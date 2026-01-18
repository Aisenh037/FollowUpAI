"""Migration script to add new columns to the leads table."""
import sqlite3
import os

DB_PATH = "followupai.db"

def migrate():
    if not os.path.exists(DB_PATH):
        print(f"Database not found at {DB_PATH}")
        return

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    columns_to_add = [
        ("contact_type", "TEXT DEFAULT 'client'"),
        ("resume_link", "TEXT"),
        ("tech_stack", "TEXT"),
        ("source_url", "TEXT"),
        ("phone", "TEXT"),
        ("sequence_id", "INTEGER"),
        ("current_step_number", "INTEGER DEFAULT 0")
    ]

    for col_name, col_type in columns_to_add:
        try:
            cursor.execute(f"ALTER TABLE leads ADD COLUMN {col_name} {col_type}")
            print(f"Added column: {col_name}")
        except sqlite3.OperationalError as e:
            if "duplicate column name" in str(e).lower():
                print(f"Column already exists: {col_name}")
            else:
                print(f"Error adding column {col_name}: {e}")

    conn.commit()
    conn.close()
    print("Migration finished.")

if __name__ == "__main__":
    migrate()
