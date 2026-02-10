import { NextResponse } from 'next/server'
import { AIEngine } from '@repo/ai-engine'

export async function POST(request: Request) {
  try {
    const { decision } = await request.json()

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { decisionType: 'unknown', message: 'API key not configured' },
        { status: 200 }
      )
    }

    const ai = new AIEngine()
    const result = await ai.analyze({
      productId: 'outcomedb',
      promptType: 'decision-analysis',
      data: { decision },
      locale: 'en',
    })

    return NextResponse.json(result.parsed || {})
  } catch (error) {
    console.error('OutcomeDB analysis error:', error)
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 })
  }
}
