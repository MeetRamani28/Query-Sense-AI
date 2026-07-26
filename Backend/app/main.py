from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

from app.config import settings
from app.agent.graph import query_sense_agent

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Autonomous Text-to-SQL Analytics API Engine with LangGraph Self-Correction Loop",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class QueryRequest(BaseModel):
    question: str = Field(..., example="Show me total revenue by region")

class QueryResponse(BaseModel):
    question: str
    sql_query: Optional[str] = None
    query_result: Optional[List[Dict[str, Any]]] = None
    chart_type: Optional[str] = "table"
    explanation: Optional[str] = None
    retry_count: int = 0
    error_trace: Optional[str] = None

@app.get("/")
def health_check():
    """
    Description: Health check endpoint to verify backend server status.
    """
    return {
        "status": "online",
        "service": settings.PROJECT_NAME,
        "model": settings.MODEL_NAME
    }

@app.post("/api/v1/query", response_model=QueryResponse)
async def process_analytics_query(request: QueryRequest):
    """
    Description: Main Natural Language to SQL Analytics Endpoint.
    Usecase: Accepts user question, executes LangGraph self-correction workflow, and returns query results + chart mapping.
    """
    if not request.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty.")

    try:
        initial_state = {
            "question": request.question,
            "retry_count": 0,
            "max_retries": 3
        }

        final_state = await query_sense_agent.ainvoke(initial_state)

        return QueryResponse(
            question=final_state["question"],
            sql_query=final_state.get("sql_query"),
            query_result=final_state.get("query_result"),
            chart_type=final_state.get("chart_type", "table"),
            explanation=final_state.get("explanation"),
            retry_count=final_state.get("retry_count", 0),
            error_trace=final_state.get("error_trace")
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Agent Execution Error: {str(e)}")