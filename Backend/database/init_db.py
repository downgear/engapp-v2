#!/usr/bin/env python3
"""
Database initialization script for Lingriser
Creates SQLite database and loads seed data
"""

import sqlite3
import os
from pathlib import Path

# Get the directory where this script is located
SCRIPT_DIR = Path(__file__).parent
DB_PATH = SCRIPT_DIR / "lingriser.db"
SCHEMA_PATH = SCRIPT_DIR / "schema.sql"
SEED_PATH = SCRIPT_DIR / "seed.sql"


def init_database(reset: bool = False):
    """
    Initialize the database with schema and seed data.
    
    Args:
        reset: If True, delete existing database and recreate
    """
    # Remove existing database if reset is True
    if reset and DB_PATH.exists():
        print(f"Removing existing database: {DB_PATH}")
        os.remove(DB_PATH)
    
    # Check if database already exists
    if DB_PATH.exists() and not reset:
        print(f"Database already exists: {DB_PATH}")
        print("Use --reset flag to recreate the database")
        return
    
    # Connect to database (creates it if doesn't exist)
    print(f"Creating database: {DB_PATH}")
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        # Enable foreign keys
        cursor.execute("PRAGMA foreign_keys = ON;")
        
        # Load and execute schema
        print("Loading schema...")
        with open(SCHEMA_PATH, 'r', encoding='utf-8') as f:
            schema_sql = f.read()
        cursor.executescript(schema_sql)
        print("Schema created successfully!")
        
        # Load and execute seed data
        print("Loading seed data...")
        with open(SEED_PATH, 'r', encoding='utf-8') as f:
            seed_sql = f.read()
        cursor.executescript(seed_sql)
        print("Seed data loaded successfully!")
        
        # Commit changes
        conn.commit()
        
        # Print summary
        print("\n" + "="*50)
        print("DATABASE INITIALIZATION COMPLETE")
        print("="*50)
        
        # Show table counts
        tables = [
            'users', 'students', 'parents', 'teachers',
            'courses', 'modules', 'enrollments',
            'bookings', 'learning_history', 'ai_feedback',
            'teacher_feedback', 'student_videos', 'payments'
        ]
        
        print("\nTable record counts:")
        for table in tables:
            cursor.execute(f"SELECT COUNT(*) FROM {table}")
            count = cursor.fetchone()[0]
            print(f"  {table}: {count} records")
        
        print("\n" + "="*50)
        print(f"Database file: {DB_PATH}")
        print("="*50)
        
    except Exception as e:
        print(f"Error: {e}")
        conn.rollback()
        raise
    finally:
        conn.close()


def query_database(query: str):
    """
    Execute a query and return results.
    Useful for testing.
    """
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    try:
        cursor.execute(query)
        results = cursor.fetchall()
        return [dict(row) for row in results]
    finally:
        conn.close()


if __name__ == "__main__":
    import sys
    
    reset = "--reset" in sys.argv
    init_database(reset=reset)

