'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface HabitEntry {
  name: string
  description: string
  frequency: 'daily' | 'weekly'
  currentStreak: number
  attempts: { date: string; completed: boolean; notes: string }[]
}

export default function HabitTracker() {
  const [habits, setHabits] = useState<HabitEntry[]>([])
  const [analysis, setAnalysis] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [newHabit, setNewHabit] = useState({
    name: '',
    description: '',
    frequency: 'daily' as const,
  })

  const addHabit = () => {
    if (!newHabit.name) return
    setHabits([...habits, { ...newHabit, currentStreak: 0, attempts: [] }])
    setNewHabit({ name: '', description: '', frequency: 'daily' })
  }

  const logAttempt = (index: number, completed: boolean) => {
    const updated = [...habits]
    updated[index].attempts.push({
      date: new Date().toISOString(),
      completed,
      notes: '',
    })
    if (completed) {
      updated[index].currentStreak++
    } else {
      updated[index].currentStreak = 0
    }
    setHabits(updated)
  }

  const analyzeFriction = async (habit: HabitEntry) => {
    setLoading(true)
    try {
      const response = await fetch('/api/stick/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ habit, attempts: habit.attempts }),
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
        <h1 className="text-3xl font-bold">Habit Tracker</h1>
        <p className="text-muted-foreground">Build habits that stick by reducing friction</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New Habit</CardTitle>
          <CardDescription>Define a habit you want to build</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Habit name"
            value={newHabit.name}
            onChange={(e) => setNewHabit({ ...newHabit, name: e.target.value })}
          />
          <Input
            placeholder="Why this habit matters"
            value={newHabit.description}
            onChange={(e) => setNewHabit({ ...newHabit, description: e.target.value })}
          />
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={newHabit.frequency}
            onChange={(e) => setNewHabit({ ...newHabit, frequency: e.target.value as 'daily' | 'weekly' })}
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
          </select>
          <Button onClick={addHabit}>Add Habit</Button>
        </CardContent>
      </Card>

      {habits.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Your Habits</h2>
          {habits.map((h, i) => (
            <Card key={i}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {h.name}
                  <span className="text-sm font-normal bg-primary/10 text-primary px-2 py-1 rounded">
                    Streak: {h.currentStreak}
                  </span>
                </CardTitle>
                <CardDescription>{h.description} ({h.frequency})</CardDescription>
              </CardHeader>
              <CardContent className="flex gap-2">
                <Button size="sm" onClick={() => logAttempt(i, true)}>Done</Button>
                <Button size="sm" variant="outline" onClick={() => logAttempt(i, false)}>Missed</Button>
                <Button size="sm" variant="ghost" onClick={() => analyzeFriction(h)} disabled={loading}>
                  {loading ? 'Analyzing...' : 'Analyze Friction'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {analysis && (
        <Card>
          <CardHeader>
            <CardTitle>Friction Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap text-sm">{JSON.stringify(analysis, null, 2)}</pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
