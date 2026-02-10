'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Decision {
  description: string
  date: string
  outcome: string
  context: string
}

interface Pattern {
  description: string
  frequency: string
  riskScore: number
  interventionPoint: string
  costEstimate: {
    time: string
    money: string
    opportunity: string
  }
}

export default function PatternDetection() {
  const [decisions, setDecisions] = useState<Decision[]>([])
  const [patterns, setPatterns] = useState<Pattern[]>([])
  const [loading, setLoading] = useState(false)
  const [newDecision, setNewDecision] = useState<Decision>({
    description: '',
    date: '',
    outcome: '',
    context: '',
  })

  const addDecision = () => {
    if (!newDecision.description) return
    setDecisions([...decisions, newDecision])
    setNewDecision({ description: '', date: '', outcome: '', context: '' })
  }

  const analyzePatterns = async () => {
    if (decisions.length < 2) return
    setLoading(true)

    try {
      const response = await fetch('/api/riskloop/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decisions }),
      })
      const data = await response.json()
      setPatterns(data.patterns || [])
    } catch (error) {
      console.error('Analysis failed:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Pattern Detection</h1>
        <p className="text-muted-foreground">Log decisions to detect behavioral risk patterns</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add Decision</CardTitle>
          <CardDescription>Record a decision to build your pattern database</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="What was the decision?"
            value={newDecision.description}
            onChange={(e) => setNewDecision({ ...newDecision, description: e.target.value })}
          />
          <Input
            type="date"
            value={newDecision.date}
            onChange={(e) => setNewDecision({ ...newDecision, date: e.target.value })}
          />
          <Input
            placeholder="What was the outcome?"
            value={newDecision.outcome}
            onChange={(e) => setNewDecision({ ...newDecision, outcome: e.target.value })}
          />
          <Input
            placeholder="Context (stress, time pressure, etc.)"
            value={newDecision.context}
            onChange={(e) => setNewDecision({ ...newDecision, context: e.target.value })}
          />
          <Button onClick={addDecision}>Add Decision</Button>
        </CardContent>
      </Card>

      {decisions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Logged Decisions ({decisions.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {decisions.map((d, i) => (
                <div key={i} className="rounded-md border p-3">
                  <p className="font-medium">{d.description}</p>
                  <p className="text-sm text-muted-foreground">
                    {d.date} — {d.outcome} ({d.context})
                  </p>
                </div>
              ))}
            </div>
            <Button className="mt-4" onClick={analyzePatterns} disabled={loading || decisions.length < 2}>
              {loading ? 'Analyzing...' : 'Detect Patterns'}
            </Button>
          </CardContent>
        </Card>
      )}

      {patterns.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Detected Patterns</h2>
          {patterns.map((p, i) => (
            <Card key={i}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {p.description}
                  <span className={`text-sm px-2 py-1 rounded ${p.riskScore > 70 ? 'bg-red-100 text-red-800' : p.riskScore > 40 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                    Risk: {p.riskScore}/100
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">Frequency: {p.frequency}</p>
                <p className="text-sm font-medium">Intervention: {p.interventionPoint}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
