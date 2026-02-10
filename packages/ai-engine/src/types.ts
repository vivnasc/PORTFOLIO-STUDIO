export interface AnalyzeParams {
  productId: string
  promptType: string
  data: Record<string, unknown>
  locale: 'en' | 'pt'
}

export interface AIResponse {
  content: string
  parsed: Record<string, unknown> | null
  usage: {
    inputTokens: number
    outputTokens: number
  }
}
