#!/usr/bin/env python3
"""
Initialize Neon PostgreSQL Database for Lingriser

Usage:
    python init_postgres.py             # Create tables and seed data
    python init_postgres.py --reset     # Drop all tables and recreate
    python init_postgres.py --schema    # Only run schema (no seed data)
"""

import os
import sys
import argparse
import psycopg2
from psycopg2 import sql

# Connection string for Neon PostgreSQL
DATABASE_URL = os.environ.get(
    'DATABASE_URL',
    'postgresql://neondb_owner:npg_nkji5mU2JoMr@ep-morning-unit-ahp0dh7v-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require'
)

# Get the directory where this script is located
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

def get_connection():
    """Create a connection to the Neon PostgreSQL database."""
    try:
        conn = psycopg2.connect(DATABASE_URL)
        conn.autocommit = False
        return conn
    except psycopg2.Error as e:
        print(f"❌ Error connecting to database: {e}")
        sys.exit(1)

def drop_all_tables(conn):
    """Drop all tables in the database."""
    tables = [
        'payments',
        'student_videos',
        'class_feedback',
        'teacher_feedback',
        'ai_feedback',
        'learning_history',
        'bookings',
        'teacher_availability',
        'enrollments',
        'modules',
        'courses',
        'account_links',
        'parents',
        'students',
        'teachers',
        'users',
    ]
    
    cursor = conn.cursor()
    try:
        for table in tables:
            cursor.execute(sql.SQL("DROP TABLE IF EXISTS {} CASCADE").format(sql.Identifier(table)))
            print(f"   Dropped table: {table}")
        conn.commit()
        print("✅ All tables dropped successfully")
    except psycopg2.Error as e:
        conn.rollback()
        print(f"❌ Error dropping tables: {e}")
        sys.exit(1)
    finally:
        cursor.close()

def run_sql_file(conn, filename):
    """Execute a SQL file against the database."""
    filepath = os.path.join(SCRIPT_DIR, filename)
    
    if not os.path.exists(filepath):
        print(f"❌ SQL file not found: {filepath}")
        sys.exit(1)
    
    with open(filepath, 'r', encoding='utf-8') as f:
        sql_content = f.read()
    
    cursor = conn.cursor()
    try:
        cursor.execute(sql_content)
        conn.commit()
        print(f"✅ Successfully executed: {filename}")
    except psycopg2.Error as e:
        conn.rollback()
        print(f"❌ Error executing {filename}: {e}")
        sys.exit(1)
    finally:
        cursor.close()

def check_tables_exist(conn):
    """Check if the main tables already exist."""
    cursor = conn.cursor()
    cursor.execute("""
        SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'users'
        );
    """)
    result = cursor.fetchone()[0]
    cursor.close()
    return result

def main():
    parser = argparse.ArgumentParser(description='Initialize Neon PostgreSQL database for Lingriser')
    parser.add_argument('--reset', action='store_true', help='Drop all tables and recreate')
    parser.add_argument('--schema', action='store_true', help='Only run schema (no seed data)')
    args = parser.parse_args()

    print("=" * 50)
    print("🚀 Lingriser Database Initialization (Neon PostgreSQL)")
    print("=" * 50)
    print()

    # Connect to database
    print("📡 Connecting to Neon PostgreSQL...")
    conn = get_connection()
    print("✅ Connected successfully!")
    print()

    # Check if tables exist
    tables_exist = check_tables_exist(conn)

    if tables_exist and not args.reset:
        print("⚠️  Tables already exist!")
        print("   Use --reset flag to drop and recreate all tables")
        print()
        response = input("Do you want to continue and overwrite? (y/N): ")
        if response.lower() != 'y':
            print("Cancelled.")
            conn.close()
            return
        print()

    # Reset if requested or confirmed
    if args.reset or tables_exist:
        print("🗑️  Dropping existing tables...")
        drop_all_tables(conn)
        print()

    # Run schema
    print("📝 Creating schema...")
    run_sql_file(conn, 'schema_postgres.sql')
    print()

    # Run seed data (unless --schema flag is used)
    if not args.schema:
        print("🌱 Inserting seed data...")
        run_sql_file(conn, 'seed_postgres.sql')
        print()

    # Close connection
    conn.close()

    print("=" * 50)
    print("✅ Database initialization complete!")
    print("=" * 50)
    print()
    print("📊 Summary:")
    print("   - Database: Neon PostgreSQL")
    print("   - Schema: schema_postgres.sql")
    if not args.schema:
        print("   - Seed data: seed_postgres.sql")
    print()
    print("🔗 Connection string:")
    print(f"   {DATABASE_URL[:50]}...")
    print()

if __name__ == '__main__':
    main()


