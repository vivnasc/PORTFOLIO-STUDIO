import { NextResponse } from 'next/server'
import { AIEngine } from '@repo/ai-engine'

export async function POST(request: Request) {
  try {
    const { decisions } = await request.json()

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { patterns: [], message: 'API key not configured' },
        { status: 200 }
      )
    }

    const ai = new AIEngine()
    const result = await ai.analyze({
      productId: 'riskloop',
      promptType: 'pattern-detection',
      data: { decisions },
      locale: 'en',
    })

    return NextResponse.json(result.parsed || { patterns: [] })
  } catch (error) {
    console.error('RiskLoop analysis error:', error)
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 })
  }
}
