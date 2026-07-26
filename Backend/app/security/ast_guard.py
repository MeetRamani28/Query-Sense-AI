import sqlglot
from sqlglot import exp

def validate_read_only_sql(sql_query: str) -> tuple[bool, str]:
    """
    Description: Parses SQL queries into an Abstract Syntax Tree (AST) using sqlglot and validates read-only access.
    Usecase: Prevents destructive commands (DROP, DELETE, UPDATE, INSERT, ALTER) from executing against PostgreSQL.
    
    Returns:
        tuple[bool, str]: (is_valid, error_message_or_cleaned_sql)
    """
    cleaned_sql = sql_query.strip()
    if cleaned_sql.startswith("```"):
        cleaned_sql = cleaned_sql.split("```")[1]
        if cleaned_sql.lower().startswith("sql"):
            cleaned_sql = cleaned_sql[3:].strip()
    if cleaned_sql.endswith("```"):
        cleaned_sql = cleaned_sql[:-3].strip()

    try:
        parsed_expressions = sqlglot.parse(cleaned_sql, read="postgres")

        for expression in parsed_expressions:
            if expression is None:
                continue

            if not isinstance(expression, exp.Select):
                forbidden_type = type(expression).__name__.upper()
                return False, f"SECURITY ERROR: Forbidden SQL command '{forbidden_type}'. Only SELECT queries are permitted."

            forbidden_nodes = (exp.Delete, exp.Drop, exp.Insert, exp.Update, exp.Alter, exp.Create)
            for node in expression.walk():
                if isinstance(node, forbidden_nodes):
                    return False, f"SECURITY ERROR: Detected destructive operation '{type(node).__name__.upper()}' in query."

        return True, cleaned_sql

    except sqlglot.errors.ParseError as pe:
        return False, f"SQL PARSE ERROR: Invalid SQL syntax - {str(pe)}"
    except Exception as e:
        return False, f"VALIDATION ERROR: Failed to parse SQL - {str(e)}"