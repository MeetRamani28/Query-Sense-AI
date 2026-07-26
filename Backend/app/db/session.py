import psycopg2
from psycopg2.extras import RealDictCursor
from app.config import settings

def get_db_connection(db_config: dict = None):
    """
    Description: Establishes a dynamic connection to PostgreSQL based on user credentials.
    Usecase: Supports multi-tenant user database connections while falling back to default env settings.
    """
    try:
        if db_config and all(k in db_config for k in ("host", "port", "dbname", "user", "password")):
            conn = psycopg2.connect(
                host=db_config["host"],
                port=int(db_config["port"]),
                dbname=db_config["dbname"],
                user=db_config["user"],
                password=db_config["password"],
                cursor_factory=RealDictCursor,
                connect_timeout=5
            )
        else:
            conn = psycopg2.connect(
                settings.DATABASE_URL,
                cursor_factory=RealDictCursor
            )
        return conn
    except Exception as e:
        print(f"❌ Connection error for database {db_config.get('dbname') if db_config else 'default'}: {e}")
        raise e