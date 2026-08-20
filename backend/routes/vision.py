import cv2
import numpy as np
import base64
import mediapipe as mp
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Dict, Any, Optional
from services.vision.exercise_video_processor import VideoProcessorClass
from backend.services.ai_coach import ai_coach_service

router = APIRouter(prefix="/api/vision", tags=["vision"])

# Shared video processor instance
video_processor = VideoProcessorClass()

class FrameAnalysisRequest(BaseModel):
    exercise: str = Field(..., description="Selected exercise type")
    frame: str = Field(..., description="Base64 encoded JPEG image frame (e.g. data:image/jpeg;base64,...)")

class FrameAnalysisResponse(BaseModel):
    pose_detected: bool
    exercise: str
    reps: int
    metrics: Dict[str, Any]
    coach_feedback: Optional[str] = None
    annotated_frame: Optional[str] = None

@router.post("/analyze-frame", response_model=FrameAnalysisResponse)
def analyze_frame(req: FrameAnalysisRequest):
    try:
        header_data = req.frame
        if "," in header_data:
            header_data = header_data.split(",")[1]

        image_bytes = base64.b64decode(header_data)
        np_arr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

        if img is None:
            raise HTTPException(status_code=400, detail="Invalid image frame data")

        # Set exercise on processor
        video_processor.set_exercise(req.exercise)

        # Convert to MediaPipe Image
        mp_image = mp.Image(
            image_format=mp.ImageFormat.SRGB,
            data=cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        )

        video_processor._frame_timestamps_ms += 30
        result = video_processor._landmarker.detect_for_video(mp_image, video_processor._frame_timestamps_ms)

        metrics: Dict[str, Any] = {}
        pose_detected = False

        if result.pose_landmarks:
            landmarks = result.pose_landmarks[0]
            pose_detected = True

            # Draw skeleton
            video_processor._draw_skeleton(img, landmarks)

            detector = video_processor._detectors.get(req.exercise)
            if detector:
                metrics = detector.process(landmarks)
                metrics["pose_detected"] = True
                video_processor._draw_overlays(img, metrics, req.exercise)
                video_processor.set_latest_metrics(metrics)
        else:
            video_processor._draw_no_pose_warnings(img)
            metrics = {"pose_detected": False}

        # Encode annotated image back to base64
        _, buffer = cv2.imencode(".jpg", img, [int(cv2.IMWRITE_JPEG_QUALITY), 80])
        annotated_b64 = "data:image/jpeg;base64," + base64.b64encode(buffer).decode("utf-8")

        # Trigger AI Coach text feedback if event or form issue occurs
        feedback = None
        if pose_detected and metrics:
            feedback = ai_coach_service.process_event("ongoing_form_check", req.exercise, metrics)
        elif not pose_detected:
            feedback = ai_coach_service.process_event(
                "no_pose_detected",
                req.exercise,
                {"issue": "No pose detected! Please step into the camera frame."}
            )

        reps = metrics.get("reps", 0)

        return FrameAnalysisResponse(
            pose_detected=pose_detected,
            exercise=req.exercise,
            reps=reps,
            metrics=metrics,
            coach_feedback=feedback,
            annotated_frame=annotated_b64
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Frame processing error: {str(e)}")
