import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).parent / "data.db"

def reset_history():
    con = sqlite3.connect(DB_PATH)
    cur = con.cursor()
    # Keep only the last 2 days (original real data)
    cur.execute("DELETE FROM metrics_history WHERE date < '2025-11-29'")
    print(f"Deleted {cur.rowcount} rows.")
    con.commit()
    con.close()

if __name__ == "__main__":
    reset_history()
