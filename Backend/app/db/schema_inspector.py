from app.db.session import get_db_connection

def get_database_schema() -> str:
    """
    Description: Introspects the PostgreSQL database to retrieve tables, columns, data types, and foreign key relations.
    Usecase: Provides dynamic schema context to the LLM prompt so it generates syntactically accurate SQL queries.
    Returns: Formatted string containing schema metadata.
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    columns_query = """
    SELECT 
        table_name, 
        column_name, 
        data_type 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    ORDER BY table_name, ordinal_position;
    """

    fk_query = """
    SELECT
        tc.table_name AS foreign_table,
        kcu.column_name AS foreign_column,
        ccu.table_name AS primary_table,
        ccu.column_name AS primary_column
    FROM information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
     AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
     AND ccu.table_schema = tc.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY';
    """

    cursor.execute(columns_query)
    columns_data = cursor.fetchall()

    cursor.execute(fk_query)
    fk_data = cursor.fetchall()

    cursor.close()
    conn.close()

    tables_dict = {}
    for row in columns_data:
        t_name = row['table_name']
        c_info = f"{row['column_name']} ({row['data_type']})"
        if t_name not in tables_dict:
            tables_dict[t_name] = []
        tables_dict[t_name].append(c_info)

    schema_str = "DATABASE SCHEMA:\n"
    for table_name, cols in tables_dict.items():
        schema_str += f"- Table '{table_name}': " + ", ".join(cols) + "\n"

    if fk_data:
        schema_str += "\nFOREIGN KEY RELATIONSHIPS:\n"
        for fk in fk_data:
            schema_str += f"- {fk['foreign_table']}.{fk['foreign_column']} references {fk['primary_table']}.{fk['primary_column']}\n"

    return schema_str