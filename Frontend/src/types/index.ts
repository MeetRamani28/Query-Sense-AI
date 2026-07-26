export interface QueryRequestPayload {
  question: string;
}

export interface QueryResponseData {
  question: string;
  sql_query: string | null;
  query_result: Array<Record<string, unknown>> | null;
  chart_type: 'bar' | 'line' | 'pie' | 'table' | 'none';
  explanation: string | null;
  retry_count: number;
  error_trace: string | null;
}

export interface HistoryItem {
  id: string;
  question: string;
  timestamp: string;
  chartType: string;
}