import sqlite3
from typing import List, Optional, Dict, Any
from services.persistence.exercise_repository import (
    get_user as repo_get_user,
    create_user as repo_create_user,
    get_or_create_user as repo_get_or_create_user,
    add_exercise as repo_add_exercise,
    get_users_exercises as repo_get_users_exercises,
    _get_connection
)

class UserRepository:
    @staticmethod
    def get_by_username(username: str) -> Optional[Dict[str, Any]]:
        row = repo_get_user(username)
        return dict(row) if row else None

    @staticmethod
    def create(username: str) -> Dict[str, Any]:
        row = repo_create_user(username)
        return dict(row)

    @staticmethod
    def get_or_create(username: str) -> Dict[str, Any]:
        row = repo_get_or_create_user(username)
        return dict(row)

    @staticmethod
    def get_by_id(user_id: int) -> Optional[Dict[str, Any]]:
        conn = _get_connection()
        row = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
        return dict(row) if row else None


class WorkoutRepository:
    @staticmethod
    def add_workout(user_id: int, exercise_name: str, reps: int, sets: int, time_taken: int) -> Dict[str, Any]:
        repo_add_exercise(user_id, exercise_name, reps, sets, time_taken)
        conn = _get_connection()
        row = conn.execute("""
            SELECT * FROM exercises 
            WHERE user_id = ? AND exercise_name = ?
            ORDER BY id DESC LIMIT 1
        """, (user_id, exercise_name)).fetchone()
        return dict(row) if row else {}

    @staticmethod
    def get_user_workouts(user_id: int) -> List[Dict[str, Any]]:
        rows = repo_get_users_exercises(user_id)
        return [dict(r) for r in rows]

    @staticmethod
    def get_workout_by_id(workout_id: int) -> Optional[Dict[str, Any]]:
        conn = _get_connection()
        row = conn.execute("SELECT * FROM exercises WHERE id = ?", (workout_id,)).fetchone()
        return dict(row) if row else None
