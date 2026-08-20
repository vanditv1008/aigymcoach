from fastapi import APIRouter, HTTPException, Depends, status
from typing import List
from backend.schemas.workout import WorkoutCreate, WorkoutResponse, WorkoutHistoryResponse
from backend.database.repositories import WorkoutRepository
from backend.routes.auth import get_current_user

router = APIRouter(prefix="/api/workouts", tags=["workouts"])

@router.post("", response_model=WorkoutResponse, status_code=status.HTTP_201_CREATED)
def create_workout(
    workout_in: WorkoutCreate,
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user['id']
    workout = WorkoutRepository.add_workout(
        user_id=user_id,
        exercise_name=workout_in.exercise_name,
        reps=workout_in.reps,
        sets=workout_in.sets,
        time_taken=workout_in.time_taken
    )

    if not workout:
        raise HTTPException(status_code=500, detail="Failed to save workout")

    return WorkoutResponse(
        id=workout['id'],
        user_id=workout['user_id'],
        exercise_name=workout['exercise_name'],
        reps=workout['reps'],
        sets=workout['sets'],
        time=workout['time'],
        created_at=str(workout.get('created_at', ''))
    )


@router.get("/history", response_model=WorkoutHistoryResponse)
def get_workout_history(current_user: dict = Depends(get_current_user)):
    user_id = current_user['id']
    raw_workouts = WorkoutRepository.get_user_workouts(user_id)

    workouts = [
        WorkoutResponse(
            id=w['id'],
            user_id=w['user_id'],
            exercise_name=w['exercise_name'],
            reps=w['reps'],
            sets=w['sets'],
            time=w['time'],
            created_at=str(w.get('created_at', ''))
        )
        for w in raw_workouts
    ]

    return WorkoutHistoryResponse(workouts=workouts)


@router.get("/{workout_id}", response_model=WorkoutResponse)
def get_workout_by_id(
    workout_id: int,
    current_user: dict = Depends(get_current_user)
):
    workout = WorkoutRepository.get_workout_by_id(workout_id)

    if not workout:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Workout with ID {workout_id} not found"
        )

    # Check user isolation ownership
    if workout['user_id'] != current_user['id']:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: You do not have permission to view this workout"
        )

    return WorkoutResponse(
        id=workout['id'],
        user_id=workout['user_id'],
        exercise_name=workout['exercise_name'],
        reps=workout['reps'],
        sets=workout['sets'],
        time=workout['time'],
        created_at=str(workout.get('created_at', ''))
    )
