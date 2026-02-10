import { NextResponse } from 'next/server'
import { AIEngine } from '@repo/ai-engine'

export async function POST(request: Request) {
  try {
    const { tasks, commitments } = await request.json()

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { currentLoad: 0, capacity: 100, message: 'API key not configured' },
        { status: 200 }
      )
    }

    const ai = new AIEngine()
    const result = await ai.analyze({
      productId: 'capacityos',
      promptType: 'load-assessment',
      data: { tasks, commitments },
      locale: 'en',
    })

    return NextResponse.json(result.parsed || {})
  } catch (error) {
    console.error('CapacityOS assessment error:', error)
    return NextResponse.json({ error: 'Assessment failed' }, { status: 500 })
  }
}
