import psycopg2
from psycopg2.extras import RealDictCursor
from app.config import settings

def get_db_connection():
    """
    Description: Establishes a raw connection with PostgreSQL.
    Usecase: Used by the Agent DB Execution Node to execute synthesized SQL queries.
    Returns dictionaries for SQL results instead of raw tuples.
    """
    try:
        conn = psycopg2.connect(
            settings.DATABASE_URL,
            cursor_factory=RealDictCursor
        )
        return conn
    except Exception as e:
        print(f"❌ Error connecting to PostgreSQL database: {e}")
        raise e