import { NextResponse } from 'next/server'
import { AIEngine } from '@repo/ai-engine'

export async function POST(request: Request) {
  try {
    const { contact, interactions } = await request.json()

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { relationshipStrength: 0, message: 'API key not configured' },
        { status: 200 }
      )
    }

    const ai = new AIEngine()
    const result = await ai.analyze({
      productId: 'peopledb',
      promptType: 'relationship-insights',
      data: { contact, interactions },
      locale: 'en',
    })

    return NextResponse.json(result.parsed || {})
  } catch (error) {
    console.error('PeopleDB insights error:', error)
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 })
  }
}
