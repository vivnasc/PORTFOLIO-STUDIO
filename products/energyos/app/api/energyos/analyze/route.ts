import { NextResponse } from 'next/server'
import { AIEngine } from '@repo/ai-engine'

export async function POST(request: Request) {
  try {
    const { logs } = await request.json()

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { peakHours: [], energyScore: 0, message: 'API key not configured' },
        { status: 200 }
      )
    }

    const ai = new AIEngine()
    const result = await ai.analyze({
      productId: 'energyos',
      promptType: 'energy-analysis',
      data: { logs },
      locale: 'en',
    })

    return NextResponse.json(result.parsed || {})
  } catch (error) {
    console.error('EnergyOS analysis error:', error)
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 })
  }
}
