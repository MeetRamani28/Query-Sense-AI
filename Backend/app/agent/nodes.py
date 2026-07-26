import json
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from app.config import settings
from app.agent.state import AgentState
from app.db.schema_inspector import get_database_schema
from app.db.session import get_db_connection
from app.security.ast_guard import validate_read_only_sql

llm = ChatGroq(
    groq_api_key=settings.GROQ_API_KEY,
    model_name=settings.MODEL_NAME,
    temperature=0.0  
)

def generate_sql_node(state: AgentState) -> dict:
    """
    Description: Synthesizes a PostgreSQL SELECT query based on user question and DB schema.
    Usecase: Initial step to convert text into SQL using Groq Llama-3.
    """
    schema = get_database_schema()
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", """You are an expert PostgreSQL Data Engineer. 
Your task is to convert natural language business questions into valid PostgreSQL SELECT queries.

CRITICAL RULES:
1. Return ONLY the raw executable SQL query.
2. DO NOT include markdown formatting like ```sql or explanations.
3. Use ONLY SELECT statements. No DELETE, DROP, UPDATE, INSERT, or ALTER.
4. Use valid PostgreSQL table and column names as specified in the schema below.

DATABASE SCHEMA:
{schema}"""),
        ("human", "Question: {question}")
    ])

    chain = prompt | llm
    response = chain.invoke({"schema": schema, "question": state["question"]})
    
    return {
        "schema": schema,
        "sql_query": response.content.strip(),
        "retry_count": 0
    }

def validate_sql_node(state: AgentState) -> dict:
    """
    Description: Validates generated SQL using the AST parser to block non-SELECT queries.
    Usecase: Enforces Database Read-Only Guardrails before hitting the DB engine.
    """
    is_valid, result = validate_read_only_sql(state["sql_query"])
    
    if is_valid:
        return {
            "is_valid_sql": True,
            "sql_query": result,  
            "error_trace": None
        }
    else:
        return {
            "is_valid_sql": False,
            "error_trace": result
        }

def execute_sql_node(state: AgentState) -> dict:
    """
    Description: Executes validated SQL query against PostgreSQL database.
    Usecase: Retrieves data rows or catches PostgreSQL runtime database errors.
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(state["sql_query"])
        rows = cursor.fetchall()
        cursor.close()
        conn.close()

        dict_results = [dict(row) for row in rows]
        
        return {
            "query_result": dict_results,
            "error_trace": None
        }
    except Exception as e:
        return {
            "query_result": None,
            "error_trace": f"PostgreSQL Execution Error: {str(e)}"
        }

def self_correct_node(state: AgentState) -> dict:
    """
    Description: Takes failed SQL query + error trace and re-prompts LLM to fix the query.
    Usecase: Autonomous self-healing loop for SQL syntax or schema mismatch errors.
    """
    current_retry = state.get("retry_count", 0) + 1
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", """You are an expert PostgreSQL Data Engineer. 
Your previous SQL query failed validation or execution. Fix the error and generate a valid SELECT query.

CRITICAL RULES:
1. Return ONLY the raw executable SQL query.
2. DO NOT include markdown syntax like ```sql or explanations.
3. Ensure table/column names match the schema exactly.

DATABASE SCHEMA:
{schema}"""),
        ("human", """User Question: {question}
Failed Query: {sql_query}
Error Message: {error_trace}

Corrected SQL Query:""")
    ])

    chain = prompt | llm
    response = chain.invoke({
        "schema": state["schema"],
        "question": state["question"],
        "sql_query": state["sql_query"],
        "error_trace": state["error_trace"]
    })

    return {
        "sql_query": response.content.strip(),
        "retry_count": current_retry
    }

def chart_mapping_node(state: AgentState) -> dict:
    """
    Description: Analyzes data result set and selects optimal visual chart type + business insight.
    Usecase: Powers React Recharts UI dynamically without hardcoded chart selection.
    """
    results = state.get("query_result", [])
    if not results:
        return {
            "chart_type": "none",
            "explanation": "No data records found for this query."
        }

    prompt = ChatPromptTemplate.from_messages([
        ("system", """You are a Data Visualization Specialist.
Analyze the provided query results and user question, then output a JSON object with:
1. "chart_type": Choose best from ['bar', 'line', 'pie', 'table']
   - Use 'bar' for categorical comparisons or rankings.
   - Use 'line' for time-series / date trends.
   - Use 'pie' for proportional breakdown of a whole (under 6 items).
   - Use 'table' for multi-column details or text-dense outputs.
2. "explanation": A concise 1-2 sentence business insight derived from the data.

Return ONLY raw JSON in this format: {{"chart_type": "...", "explanation": "..."}}"""),
        ("human", "Question: {question}\nData Sample: {data_sample}")
    ])

    chain = prompt | llm
    try:
        response = chain.invoke({
            "question": state["question"],
            "data_sample": json.dumps(results[:5], default=str)
        })
        
        clean_json = response.content.strip()
        if clean_json.startswith("```"):
            clean_json = clean_json.split("```")[1]
            if clean_json.lower().startswith("json"):
                clean_json = clean_json[4:].strip()
        if clean_json.endswith("```"):
            clean_json = clean_json[:-3].strip()

        parsed = json.loads(clean_json)
        return {
            "chart_type": parsed.get("chart_type", "table"),
            "explanation": parsed.get("explanation", "Query executed successfully.")
        }
    except Exception:
        return {
            "chart_type": "table",
            "explanation": f"Successfully retrieved {len(results)} rows."
        }