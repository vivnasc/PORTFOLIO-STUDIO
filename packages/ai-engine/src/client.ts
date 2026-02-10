import Anthropic from '@anthropic-ai/sdk'
import type { AnalyzeParams, AIResponse } from './types'
import { loadPrompt } from './prompts'

export class AIEngine {
  private client: Anthropic

  constructor(apiKey?: string) {
    this.client = new Anthropic({
      apiKey: apiKey || process.env.ANTHROPIC_API_KEY!,
    })
  }

  async analyze(params: AnalyzeParams): Promise<AIResponse> {
    const prompt = loadPrompt(params)

    const response = await this.client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    const content =
      response.content[0].type === 'text' ? response.content[0].text : ''

    let parsed: Record<string, unknown> | null = null
    try {
      parsed = JSON.parse(content)
    } catch {
      // Response is not JSON, keep as raw text
    }

    return {
      content,
      parsed,
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
      },
    }
  }
}
