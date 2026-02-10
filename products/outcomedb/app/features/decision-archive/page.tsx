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
  outcome?: number | null
}

const outcomeLabels: Record<number, { label: string; color: string }> = {
  1: { label: 'Failed', color: 'bg-red-500' },
  2: { label: 'Poor', color: 'bg-orange-500' },
  3: { label: 'Neutral', color: 'bg-yellow-500' },
  4: { label: 'Good', color: 'bg-emerald-500' },
  5: { label: 'Excellent', color: 'bg-green-500' },
}

export default function DecisionArchive() {
  const [decisions, setDecisions] = useState<DecisionEntry[]>([])
  const [analysis, setAnalysis] = useState<any>(null)
  const [patterns, setPatterns] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [patternsLoading, setPatternsLoading] = useState(false)
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
      outcome: null,
    }])
    setNewDecision({ title: '', description: '', context: '', tags: '', date: '' })
  }

  const rateOutcome = (index: number, rating: number) => {
    setDecisions(decisions.map((d, i) => i === index ? { ...d, outcome: rating } : d))
  }

  const analyzeDecision = async (decision: DecisionEntry) => {
    setLoading(true)
    try {
      const response = await fetch('/api/outcomedb/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decision,
          previousDecisions: decisions.filter(d => d !== decision),
        }),
      })
      const data = await response.json()
      setAnalysis(data)
    } catch (error) {
      console.error('Analysis failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const discoverPatterns = async () => {
    if (decisions.length < 3) return
    setPatternsLoading(true)
    try {
      const response = await fetch('/api/outcomedb/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decision: { title: 'Pattern Discovery', description: 'Analyze all decisions' },
          previousDecisions: decisions,
        }),
      })
      const data = await response.json()
      setPatterns(data)
    } catch (error) {
      console.error('Pattern discovery failed:', error)
    } finally {
      setPatternsLoading(false)
    }
  }

  const ratedDecisions = decisions.filter(d => d.outcome !== null && d.outcome !== undefined)
  const winRate = ratedDecisions.length > 0
    ? Math.round((ratedDecisions.filter(d => (d.outcome ?? 0) >= 4).length / ratedDecisions.length) * 100)
    : 0
  const pendingReview = decisions.filter(d => d.outcome === null || d.outcome === undefined).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Decision Analytics</h1>
        <p className="text-muted-foreground">Track every decision. Rate outcomes. Discover what makes your good decisions good.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Decisions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{decisions.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Rated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{ratedDecisions.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Win Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${winRate >= 60 ? 'text-green-600' : winRate >= 40 ? 'text-yellow-600' : 'text-red-600'}`}>
              {ratedDecisions.length > 0 ? `${winRate}%` : '—'}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Pending Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{pendingReview}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Record Decision</CardTitle>
          <CardDescription>Log what you decided, why, and the context. Rate the outcome later.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="What did you decide?"
            value={newDecision.title}
            onChange={(e) => setNewDecision({ ...newDecision, title: e.target.value })}
          />
          <Input
            placeholder="Why did you decide this? What were the alternatives?"
            value={newDecision.description}
            onChange={(e) => setNewDecision({ ...newDecision, description: e.target.value })}
          />
          <Input
            placeholder="Context (pressure, information available, who was involved)"
            value={newDecision.context}
            onChange={(e) => setNewDecision({ ...newDecision, context: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              placeholder="Tags (comma separated): hiring, financial, strategic..."
              value={newDecision.tags}
              onChange={(e) => setNewDecision({ ...newDecision, tags: e.target.value })}
            />
            <Input
              type="date"
              value={newDecision.date}
              onChange={(e) => setNewDecision({ ...newDecision, date: e.target.value })}
            />
          </div>
          <Button onClick={addDecision}>Archive Decision</Button>
        </CardContent>
      </Card>

      {decisions.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Decision Log ({decisions.length})</h2>
            {decisions.length >= 3 && (
              <Button variant="outline" onClick={discoverPatterns} disabled={patternsLoading}>
                {patternsLoading ? 'Discovering...' : 'Discover My Patterns'}
              </Button>
            )}
          </div>
          {decisions.map((d, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{d.title}</CardTitle>
                    <CardDescription>{d.date}</CardDescription>
                  </div>
                  {d.outcome !== null && d.outcome !== undefined && (
                    <span className={`px-3 py-1 rounded-full text-white text-sm font-medium ${outcomeLabels[d.outcome].color}`}>
                      {outcomeLabels[d.outcome].label}
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="mb-2">{d.description}</p>
                <p className="text-sm text-muted-foreground mb-3">Context: {d.context}</p>
                <div className="flex gap-2 mb-4">
                  {d.tags.map((tag, j) => (
                    <span key={j} className="bg-secondary text-secondary-foreground px-2 py-1 rounded text-xs">
                      {tag}
                    </span>
                  ))}
                </div>

                {(d.outcome === null || d.outcome === undefined) && (
                  <div className="border-t pt-3">
                    <p className="text-sm font-medium mb-2">Rate this outcome:</p>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          onClick={() => rateOutcome(i, rating)}
                          className={`px-4 py-2 rounded text-sm font-medium text-white transition-colors ${outcomeLabels[rating].color} hover:opacity-80`}
                        >
                          {rating} - {outcomeLabels[rating].label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 mt-3">
                  <Button size="sm" variant="outline" onClick={() => analyzeDecision(d)} disabled={loading}>
                    {loading ? 'Analyzing...' : 'Deep Analyze'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {analysis && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Decision Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {analysis.expectedROI && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-medium text-blue-800 mb-2">Expected ROI</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Metric:</span> {analysis.expectedROI.metric}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Target:</span> {analysis.expectedROI.target}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Timeframe:</span> {analysis.expectedROI.timeframe}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Confidence:</span> {analysis.expectedROI.confidence}%
                    </div>
                  </div>
                </div>
              )}

              {analysis.assumptions?.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Key Assumptions to Validate</h4>
                  {analysis.assumptions.map((a: any, i: number) => (
                    <div key={i} className={`rounded-md border p-3 mb-2 ${
                      a.criticality === 'high' ? 'border-red-200 bg-red-50' :
                      a.criticality === 'medium' ? 'border-yellow-200 bg-yellow-50' :
                      'border-green-200 bg-green-50'
                    }`}>
                      <p className="font-medium text-sm">{a.assumption}</p>
                      <p className="text-xs text-muted-foreground mt-1">Validate: {a.validationMethod}</p>
                      <p className="text-xs text-red-600 mt-1">Invalidated if: {a.invalidationSignal}</p>
                    </div>
                  ))}
                </div>
              )}

              {analysis.successCriteria?.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Success Criteria</h4>
                  {analysis.successCriteria.map((c: any, i: number) => (
                    <div key={i} className="flex items-center justify-between rounded-md border p-3 mb-2">
                      <div>
                        <p className="font-medium text-sm">{c.metric}</p>
                        <p className="text-xs text-muted-foreground">Target: {c.target}</p>
                      </div>
                      <span className="text-sm text-muted-foreground">{c.deadline}</span>
                    </div>
                  ))}
                </div>
              )}

              {analysis.reviewDate && (
                <div className="bg-muted rounded-lg p-3 text-center">
                  <p className="text-sm">Review this decision on: <strong>{analysis.reviewDate}</strong></p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {patterns && (
        <div className="space-y-4">
          <Card className="border-2 border-primary">
            <CardHeader>
              <CardTitle>Your Decision Patterns</CardTitle>
              <CardDescription>Insights from your complete decision history</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {patterns.overallTrend && (
                <div className="bg-muted rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Decision Quality Score</span>
                    <span className={`text-2xl font-bold ${
                      patterns.overallTrend.decisionQualityScore >= 70 ? 'text-green-600' :
                      patterns.overallTrend.decisionQualityScore >= 40 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {patterns.overallTrend.decisionQualityScore}/100
                    </span>
                  </div>
                  <p className="text-sm">Trend: {patterns.overallTrend.direction}</p>
                  <p className="text-sm text-green-600">Strength: {patterns.overallTrend.topStrength}</p>
                  <p className="text-sm text-red-600">Weakness: {patterns.overallTrend.topWeakness}</p>
                </div>
              )}

              {patterns.winPatterns?.length > 0 && (
                <div>
                  <h4 className="font-medium text-green-800 mb-2">Win Patterns</h4>
                  {patterns.winPatterns.map((p: any, i: number) => (
                    <div key={i} className="bg-green-50 rounded-md p-3 mb-2">
                      <p className="font-medium text-sm">{p.pattern}</p>
                      <p className="text-xs text-muted-foreground">Frequency: {p.frequency} | Avg Score: {p.avgOutcomeScore}/100</p>
                    </div>
                  ))}
                </div>
              )}

              {patterns.blindSpots?.length > 0 && (
                <div>
                  <h4 className="font-medium text-red-800 mb-2">Blind Spots</h4>
                  {patterns.blindSpots.map((b: any, i: number) => (
                    <div key={i} className="bg-red-50 rounded-md p-3 mb-2">
                      <p className="font-medium text-sm">{b.bias}</p>
                      <p className="text-xs text-muted-foreground">{b.evidence}</p>
                      <p className="text-xs text-green-700 mt-1">Fix: {b.recommendation}</p>
                    </div>
                  ))}
                </div>
              )}

              {patterns.recommendations?.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Recommendations</h4>
                  <ul className="text-sm list-disc pl-5 space-y-1">
                    {patterns.recommendations.map((r: string, i: number) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
