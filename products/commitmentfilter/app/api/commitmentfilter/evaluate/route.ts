import { NextResponse } from 'next/server'
import { AIEngine } from '@repo/ai-engine'

export async function POST(request: Request) {
  try {
    const { commitment, currentLoad, values } = await request.json()

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { recommendation: 'unknown', alignmentScore: 0, message: 'API key not configured' },
        { status: 200 }
      )
    }

    const ai = new AIEngine()
    const result = await ai.analyze({
      productId: 'commitmentfilter',
      promptType: 'commitment-evaluation',
      data: { commitment, currentLoad, values },
      locale: 'en',
    })

    return NextResponse.json(result.parsed || {})
  } catch (error) {
    console.error('CommitmentFilter evaluation error:', error)
    return NextResponse.json({ error: 'Evaluation failed' }, { status: 500 })
  }
}
