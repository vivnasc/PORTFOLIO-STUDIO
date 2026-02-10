'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface EnergyEntry {
  timestamp: string
  level: number
  activity: string
  context: string
}

export default function EnergyTracking() {
  const [entries, setEntries] = useState<EnergyEntry[]>([])
  const [analysis, setAnalysis] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [newEntry, setNewEntry] = useState<EnergyEntry>({
    timestamp: '',
    level: 5,
    activity: '',
    context: '',
  })

  const addEntry = () => {
    if (!newEntry.activity) return
    setEntries([...entries, { ...newEntry, timestamp: newEntry.timestamp || new Date().toISOString() }])
    setNewEntry({ timestamp: '', level: 5, activity: '', context: '' })
  }

  const analyzeEnergy = async () => {
    if (entries.length < 3) return
    setLoading(true)
    try {
      const response = await fetch('/api/energyos/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logs: entries }),
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
        <h1 className="text-3xl font-bold">Energy Tracking</h1>
        <p className="text-muted-foreground">Track your energy levels to optimize performance</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Log Energy Level</CardTitle>
          <CardDescription>Record your current energy state</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium w-24">Energy (1-10)</label>
            <Input
              type="range"
              min={1}
              max={10}
              value={newEntry.level}
              onChange={(e) => setNewEntry({ ...newEntry, level: parseInt(e.target.value) })}
              className="flex-1"
            />
            <span className="text-2xl font-bold w-8">{newEntry.level}</span>
          </div>
          <Input
            placeholder="What are you doing?"
            value={newEntry.activity}
            onChange={(e) => setNewEntry({ ...newEntry, activity: e.target.value })}
          />
          <Input
            placeholder="Context (after lunch, morning, stressed...)"
            value={newEntry.context}
            onChange={(e) => setNewEntry({ ...newEntry, context: e.target.value })}
          />
          <Button onClick={addEntry}>Log Energy</Button>
        </CardContent>
      </Card>

      {entries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Energy Log ({entries.length} entries)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {entries.map((e, i) => (
                <div key={i} className="flex items-center justify-between rounded-md border p-3">
                  <div>
                    <p className="font-medium">{e.activity}</p>
                    <p className="text-sm text-muted-foreground">{e.context}</p>
                  </div>
                  <div className={`text-2xl font-bold ${e.level >= 7 ? 'text-green-600' : e.level >= 4 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {e.level}/10
                  </div>
                </div>
              ))}
            </div>
            <Button className="mt-4" onClick={analyzeEnergy} disabled={loading || entries.length < 3}>
              {loading ? 'Analyzing...' : 'Analyze Energy Patterns'}
            </Button>
          </CardContent>
        </Card>
      )}

      {analysis && (
        <Card>
          <CardHeader>
            <CardTitle>Energy Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap text-sm">{JSON.stringify(analysis, null, 2)}</pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
