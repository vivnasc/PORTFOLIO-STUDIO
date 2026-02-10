'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface DecisionEntry {
  title: string
  description: string
  context: string
  tags: string[]
  date: string
}

export default function DecisionArchive() {
  const [decisions, setDecisions] = useState<DecisionEntry[]>([])
  const [analysis, setAnalysis] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [newDecision, setNewDecision] = useState({
    title: '',
    description: '',
    context: '',
    tags: '',
    date: '',
  })

  const addDecision = () => {
    if (!newDecision.title) return
    setDecisions([...decisions, {
      ...newDecision,
      tags: newDecision.tags.split(',').map(t => t.trim()).filter(Boolean),
    }])
    setNewDecision({ title: '', description: '', context: '', tags: '', date: '' })
  }

  const analyzeDecision = async (decision: DecisionEntry) => {
    setLoading(true)
    try {
      const response = await fetch('/api/outcomedb/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision }),
      })
      const data = await response.json()
      setAnalysis(data)
    } catch (error) {
      console.error('Analysis failed:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Decision Archive</h1>
        <p className="text-muted-foreground">Document and analyze your decisions for future reference</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Record Decision</CardTitle>
          <CardDescription>Archive a decision with full context</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Decision title"
            value={newDecision.title}
            onChange={(e) => setNewDecision({ ...newDecision, title: e.target.value })}
          />
          <Input
            placeholder="What was decided and why?"
            value={newDecision.description}
            onChange={(e) => setNewDecision({ ...newDecision, description: e.target.value })}
          />
          <Input
            placeholder="Context (what led to this decision)"
            value={newDecision.context}
            onChange={(e) => setNewDecision({ ...newDecision, context: e.target.value })}
          />
          <Input
            placeholder="Tags (comma separated)"
            value={newDecision.tags}
            onChange={(e) => setNewDecision({ ...newDecision, tags: e.target.value })}
          />
          <Input
            type="date"
            value={newDecision.date}
            onChange={(e) => setNewDecision({ ...newDecision, date: e.target.value })}
          />
          <Button onClick={addDecision}>Archive Decision</Button>
        </CardContent>
      </Card>

      {decisions.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Decision Log ({decisions.length})</h2>
          {decisions.map((d, i) => (
            <Card key={i}>
              <CardHeader>
                <CardTitle>{d.title}</CardTitle>
                <CardDescription>{d.date}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-2">{d.description}</p>
                <p className="text-sm text-muted-foreground mb-2">Context: {d.context}</p>
                <div className="flex gap-2 mb-4">
                  {d.tags.map((tag, j) => (
                    <span key={j} className="bg-secondary text-secondary-foreground px-2 py-1 rounded text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
                <Button size="sm" variant="outline" onClick={() => analyzeDecision(d)} disabled={loading}>
                  {loading ? 'Analyzing...' : 'Analyze'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {analysis && (
        <Card>
          <CardHeader>
            <CardTitle>Decision Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap text-sm">{JSON.stringify(analysis, null, 2)}</pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
