'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface CommitmentEntry {
  title: string
  description: string
  requester: string
  hoursPerWeek: number
  deadline: string
}

export default function CommitmentFilterPage() {
  const [commitments, setCommitments] = useState<(CommitmentEntry & { evaluation?: any })[]>([])
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const [newCommitment, setNewCommitment] = useState({
    title: '',
    description: '',
    requester: '',
    hoursPerWeek: 2,
    deadline: '',
  })
  const [values, setValues] = useState('')
  const [valuesList, setValuesList] = useState<string[]>([])

  const addValue = () => {
    const trimmed = values.trim()
    if (trimmed && !valuesList.includes(trimmed)) {
      setValuesList([...valuesList, trimmed])
      setValues('')
    }
  }

  const removeValue = (v: string) => {
    setValuesList(valuesList.filter(val => val !== v))
  }

  const evaluateCommitment = async () => {
    if (!newCommitment.title) return
    setLoading(true)
    try {
      const response = await fetch('/api/commitmentfilter/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commitment: newCommitment,
          currentLoad: {
            activeCommitments: commitments.length,
            totalHoursPerWeek: commitments.reduce((sum, c) => sum + c.hoursPerWeek, 0),
          },
          values: valuesList,
          existingCommitments: commitments.map(c => ({
            title: c.title,
            hoursPerWeek: c.hoursPerWeek,
          })),
        }),
      })
      const evaluation = await response.json()
      setCommitments([...commitments, { ...newCommitment, evaluation }])
      setNewCommitment({ title: '', description: '', requester: '', hoursPerWeek: 2, deadline: '' })
    } catch (error) {
      console.error('Evaluation failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const totalBlocked = commitments.filter(c => c.evaluation?.recommendation === 'decline').length
  const totalNegotiated = commitments.filter(c => c.evaluation?.recommendation === 'negotiate').length
  const hoursSaved = commitments
    .filter(c => c.evaluation?.recommendation === 'decline')
    .reduce((sum, c) => sum + (c.evaluation?.directCost?.hoursPerYear || 0), 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Commitment Firewall</h1>
        <p className="text-muted-foreground">Every yes has a hidden cost. See the real price before you commit.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Evaluated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{commitments.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Blocked</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{totalBlocked}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Negotiated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{totalNegotiated}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Hours/Year Saved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{hoursSaved || '—'}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Values</CardTitle>
          <CardDescription>What matters most to you? The firewall checks every commitment against these.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-3">
            <Input
              placeholder="Add a value: family, health, freedom, growth..."
              value={values}
              onChange={(e) => setValues(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addValue()}
            />
            <Button variant="outline" onClick={addValue}>Add</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {valuesList.map((v, i) => (
              <span key={i} className="inline-flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                {v}
                <button onClick={() => removeValue(v)} className="text-primary/50 hover:text-primary ml-1">&times;</button>
              </span>
            ))}
            {valuesList.length === 0 && (
              <p className="text-sm text-muted-foreground">Add your core values to get better alignment scores</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Incoming Commitment</CardTitle>
          <CardDescription>Before you say yes, run it through the firewall</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="What's being asked of you?"
            value={newCommitment.title}
            onChange={(e) => setNewCommitment({ ...newCommitment, title: e.target.value })}
          />
          <Input
            placeholder="Details: what does this actually involve?"
            value={newCommitment.description}
            onChange={(e) => setNewCommitment({ ...newCommitment, description: e.target.value })}
          />
          <div className="grid grid-cols-3 gap-4">
            <Input
              placeholder="Who's asking?"
              value={newCommitment.requester}
              onChange={(e) => setNewCommitment({ ...newCommitment, requester: e.target.value })}
            />
            <div>
              <label className="text-sm font-medium mb-1 block">Hours/week</label>
              <Input
                type="number"
                min={0.5}
                max={40}
                step={0.5}
                value={newCommitment.hoursPerWeek}
                onChange={(e) => setNewCommitment({ ...newCommitment, hoursPerWeek: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Deadline</label>
              <Input
                type="date"
                value={newCommitment.deadline}
                onChange={(e) => setNewCommitment({ ...newCommitment, deadline: e.target.value })}
              />
            </div>
          </div>
          <Button onClick={evaluateCommitment} disabled={loading} className="w-full">
            {loading ? 'Scanning...' : 'Run Through Firewall'}
          </Button>
        </CardContent>
      </Card>

      {commitments.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Evaluated Commitments</h2>
          {commitments.map((c, i) => (
            <Card key={i} className={`border-2 ${
              c.evaluation?.recommendation === 'accept' ? 'border-green-300' :
              c.evaluation?.recommendation === 'negotiate' ? 'border-yellow-300' :
              'border-red-300'
            }`}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{c.title}</span>
                  {c.evaluation?.recommendation && (
                    <span className={`text-sm px-4 py-1 rounded-full font-bold uppercase ${
                      c.evaluation.recommendation === 'accept' ? 'bg-green-100 text-green-800' :
                      c.evaluation.recommendation === 'negotiate' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {c.evaluation.recommendation}
                    </span>
                  )}
                </CardTitle>
                <CardDescription>From: {c.requester} | {c.hoursPerWeek}h/week | Deadline: {c.deadline || 'None'}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {c.evaluation && (
                  <>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <div className={`text-2xl font-bold ${
                          c.evaluation.alignmentScore >= 70 ? 'text-green-600' :
                          c.evaluation.alignmentScore >= 40 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {c.evaluation.alignmentScore}%
                        </div>
                        <div className="text-xs text-muted-foreground">Value Alignment</div>
                      </div>
                      {c.evaluation.directCost && (
                        <>
                          <div className="text-center p-3 bg-muted rounded-lg">
                            <div className="text-2xl font-bold">{c.evaluation.directCost.hoursPerYear}</div>
                            <div className="text-xs text-muted-foreground">Hours/Year</div>
                          </div>
                          <div className="text-center p-3 bg-muted rounded-lg">
                            <div className="text-2xl font-bold">{c.evaluation.directCost.equivalentWorkdays}</div>
                            <div className="text-xs text-muted-foreground">Workdays/Year</div>
                          </div>
                        </>
                      )}
                    </div>

                    {c.evaluation.hiddenCosts && (
                      <div className="bg-orange-50 rounded-lg p-4">
                        <h4 className="font-medium text-orange-800 mb-2">Hidden Costs</h4>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          {c.evaluation.hiddenCosts.energyDrain && (
                            <div>
                              <span className="font-medium">Energy Drain:</span>{' '}
                              <span className={
                                c.evaluation.hiddenCosts.energyDrain.level === 'extreme' ? 'text-red-600' :
                                c.evaluation.hiddenCosts.energyDrain.level === 'high' ? 'text-orange-600' :
                                'text-yellow-600'
                              }>
                                {c.evaluation.hiddenCosts.energyDrain.level}
                              </span>
                            </div>
                          )}
                          {c.evaluation.hiddenCosts.mentalOverhead && (
                            <div>
                              <span className="font-medium">Mental Overhead:</span>{' '}
                              {c.evaluation.hiddenCosts.mentalOverhead.level}
                            </div>
                          )}
                          {c.evaluation.hiddenCosts.contextSwitchingTax && (
                            <div>
                              <span className="font-medium">Focus Blocks Disrupted:</span>{' '}
                              {c.evaluation.hiddenCosts.contextSwitchingTax.fragmentedBlocks}
                            </div>
                          )}
                          {c.evaluation.hiddenCosts.prepAndRecovery && (
                            <div>
                              <span className="font-medium">Prep + Recovery:</span>{' '}
                              {c.evaluation.hiddenCosts.prepAndRecovery.hoursPerWeek}h/week
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {c.evaluation.opportunityCost?.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">What You Give Up</h4>
                        {c.evaluation.opportunityCost.map((o: any, j: number) => (
                          <div key={j} className="text-sm border-l-2 border-red-300 pl-3 mb-2">
                            <span className="font-medium">{o.whatYouLose}</span>
                            <span className="text-muted-foreground"> — {o.value}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {c.evaluation.realityCheck && (
                      <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                        <h4 className="font-bold text-red-800 mb-2">Reality Check</h4>
                        <p className="text-sm leading-relaxed font-medium">{c.evaluation.realityCheck}</p>
                      </div>
                    )}

                    {c.evaluation.scopeCreepRisk && (
                      <div className="bg-yellow-50 rounded-lg p-3">
                        <span className="text-sm font-medium">Scope Creep Risk: </span>
                        <span className={`text-sm font-bold ${
                          c.evaluation.scopeCreepRisk.level === 'high' ? 'text-red-600' :
                          c.evaluation.scopeCreepRisk.level === 'medium' ? 'text-yellow-600' : 'text-green-600'
                        }`}>{c.evaluation.scopeCreepRisk.level}</span>
                        <p className="text-xs text-muted-foreground mt-1">{c.evaluation.scopeCreepRisk.projection}</p>
                      </div>
                    )}

                    {c.evaluation.negotiationScript && c.evaluation.recommendation === 'negotiate' && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-medium text-blue-800 mb-2">Negotiation Script</h4>
                        <p className="text-sm leading-relaxed italic">{c.evaluation.negotiationScript}</p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() => copyText(c.evaluation.negotiationScript, `script-${i}`)}
                        >
                          {copied === `script-${i}` ? 'Copied!' : 'Copy Script'}
                        </Button>
                      </div>
                    )}

                    {c.evaluation.alternatives?.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Alternatives</h4>
                        {c.evaluation.alternatives.map((a: any, j: number) => (
                          <div key={j} className="bg-green-50 rounded-md p-3 mb-2 text-sm">
                            <span className="font-medium">{a.suggestion}</span>
                            <span className="text-muted-foreground"> — saves {a.costReduction}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {c.evaluation.reasoning && (
                      <p className="text-sm text-muted-foreground border-t pt-3">{c.evaluation.reasoning}</p>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
