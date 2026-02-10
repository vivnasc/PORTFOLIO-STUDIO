'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface CommitmentEntry {
  title: string
  description: string
  requester: string
  deadline: string
}

export default function CommitmentFilterPage() {
  const [commitments, setCommitments] = useState<(CommitmentEntry & { evaluation?: any })[]>([])
  const [loading, setLoading] = useState(false)
  const [newCommitment, setNewCommitment] = useState({
    title: '',
    description: '',
    requester: '',
    deadline: '',
  })
  const [values, setValues] = useState('')

  const evaluateCommitment = async () => {
    if (!newCommitment.title) return
    setLoading(true)
    try {
      const response = await fetch('/api/commitmentfilter/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commitment: newCommitment,
          currentLoad: { activeCommitments: commitments.length },
          values: values.split(',').map(v => v.trim()).filter(Boolean),
        }),
      })
      const evaluation = await response.json()
      setCommitments([...commitments, { ...newCommitment, evaluation }])
      setNewCommitment({ title: '', description: '', requester: '', deadline: '' })
    } catch (error) {
      console.error('Evaluation failed:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Commitment Filter</h1>
        <p className="text-muted-foreground">Evaluate commitments before accepting them</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Values</CardTitle>
          <CardDescription>Define your values to evaluate alignment (comma separated)</CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="e.g., family, health, growth, autonomy"
            value={values}
            onChange={(e) => setValues(e.target.value)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>New Commitment Request</CardTitle>
          <CardDescription>Evaluate before you commit</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="What's being asked of you?"
            value={newCommitment.title}
            onChange={(e) => setNewCommitment({ ...newCommitment, title: e.target.value })}
          />
          <Input
            placeholder="Details about this commitment"
            value={newCommitment.description}
            onChange={(e) => setNewCommitment({ ...newCommitment, description: e.target.value })}
          />
          <Input
            placeholder="Who's asking?"
            value={newCommitment.requester}
            onChange={(e) => setNewCommitment({ ...newCommitment, requester: e.target.value })}
          />
          <Input
            type="date"
            value={newCommitment.deadline}
            onChange={(e) => setNewCommitment({ ...newCommitment, deadline: e.target.value })}
          />
          <Button onClick={evaluateCommitment} disabled={loading}>
            {loading ? 'Evaluating...' : 'Evaluate Commitment'}
          </Button>
        </CardContent>
      </Card>

      {commitments.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Evaluated Commitments</h2>
          {commitments.map((c, i) => (
            <Card key={i}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {c.title}
                  {c.evaluation?.recommendation && (
                    <span className={`text-sm px-3 py-1 rounded-full ${
                      c.evaluation.recommendation === 'accept' ? 'bg-green-100 text-green-800' :
                      c.evaluation.recommendation === 'negotiate' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {c.evaluation.recommendation}
                    </span>
                  )}
                </CardTitle>
                <CardDescription>From: {c.requester} | Deadline: {c.deadline || 'None'}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-2">{c.description}</p>
                {c.evaluation && (
                  <div className="mt-4 p-3 bg-muted rounded-md">
                    <p className="text-sm font-medium">Alignment: {c.evaluation.alignmentScore}/100</p>
                    <p className="text-sm font-medium">Capacity Impact: {c.evaluation.capacityImpact}</p>
                    {c.evaluation.reasoning && (
                      <p className="text-sm text-muted-foreground mt-1">{c.evaluation.reasoning}</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
