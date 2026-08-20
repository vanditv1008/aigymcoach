import os
import sqlite3
from pathlib import Path
from services.persistence.exercise_repository import init_db as init_existing_db, _get_connection

def get_db_connection() -> sqlite3.Connection:
    return _get_connection()

def init_database() -> None:
    init_existing_db()
