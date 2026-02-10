'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Task {
  title: string
  cognitiveLoad: number
  deadline: string
  hoursPerWeek: number
  status: 'pending' | 'in_progress'
}

function CapacityMeter({ load, sustainable }: { load: number; sustainable: number }) {
  const percentage = Math.min(load, 100)
  const risk = load >= 90 ? 'critical' : load >= 70 ? 'high' : load >= 50 ? 'medium' : 'low'
  const colors = {
    critical: { bar: 'bg-red-500', text: 'text-red-600', bg: 'bg-red-50', label: 'CRITICAL' },
    high: { bar: 'bg-orange-500', text: 'text-orange-600', bg: 'bg-orange-50', label: 'HIGH RISK' },
    medium: { bar: 'bg-yellow-500', text: 'text-yellow-600', bg: 'bg-yellow-50', label: 'MODERATE' },
    low: { bar: 'bg-green-500', text: 'text-green-600', bg: 'bg-green-50', label: 'SUSTAINABLE' },
  }
  const style = colors[risk]

  return (
    <Card className={`${style.bg} border-2`}>
      <CardContent className="pt-6">
        <div className="text-center mb-4">
          <div className={`text-6xl font-bold ${style.text}`}>{percentage}%</div>
          <div className={`text-sm font-medium ${style.text} mt-1`}>CAPACITY USED</div>
          <div className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold ${style.bar} text-white`}>
            {style.label}
          </div>
        </div>
        <div className="w-full h-4 bg-white/50 rounded-full overflow-hidden">
          <div className={`h-full ${style.bar} rounded-full transition-all duration-500`} style={{ width: `${percentage}%` }} />
        </div>
        <div className="flex justify-between text-xs mt-1">
          <span>0%</span>
          <span className="text-muted-foreground">Sustainable: {sustainable}%</span>
          <span>100%</span>
        </div>
      </CardContent>
    </Card>
  )
}

export default function LoadAssessment() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [assessment, setAssessment] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [newTask, setNewTask] = useState<Task>({
    title: '',
    cognitiveLoad: 5,
    hoursPerWeek: 2,
    deadline: '',
    status: 'pending',
  })

  const addTask = () => {
    if (!newTask.title) return
    setTasks([...tasks, newTask])
    setNewTask({ title: '', cognitiveLoad: 5, hoursPerWeek: 2, deadline: '', status: 'pending' })
  }

  const removeTask = (index: number) => {
    setTasks(tasks.filter((_, i) => i !== index))
  }

  const assessLoad = async () => {
    if (tasks.length === 0) return
    setLoading(true)
    try {
      const response = await fetch('/api/capacityos/assess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tasks,
          commitments: tasks.map(t => ({
            name: t.title,
            hoursPerWeek: t.hoursPerWeek,
            cognitiveLoad: t.cognitiveLoad,
            deadline: t.deadline,
          })),
        }),
      })
      const data = await response.json()
      setAssessment(data)
    } catch (error) {
      console.error('Assessment failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const copyNoCard = () => {
    if (assessment?.noCard) {
      navigator.clipboard.writeText(assessment.noCard)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const totalLoad = tasks.reduce((sum, t) => sum + t.cognitiveLoad * (t.hoursPerWeek / 10), 0)
  const estimatedCapacity = Math.min(Math.round(totalLoad * 10), 100)
  const totalHours = tasks.reduce((sum, t) => sum + t.hoursPerWeek, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Capacity Dashboard</h1>
        <p className="text-muted-foreground">See your real capacity. Predict burnout before it hits. Get the words to say no.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <CapacityMeter load={estimatedCapacity} sustainable={75} />
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Active Commitments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{tasks.length}</div>
            <p className="text-xs text-muted-foreground mt-1">{totalHours} hrs/week committed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Burnout Risk</CardTitle>
          </CardHeader>
          <CardContent>
            {assessment?.burnoutTimeline ? (
              <>
                <div className={`text-2xl font-bold ${
                  assessment.burnoutRisk === 'critical' ? 'text-red-600' :
                  assessment.burnoutRisk === 'high' ? 'text-orange-600' :
                  assessment.burnoutRisk === 'medium' ? 'text-yellow-600' : 'text-green-600'
                }`}>
                  {assessment.burnoutTimeline.daysUntilCritical
                    ? `${assessment.burnoutTimeline.daysUntilCritical} days`
                    : 'Low risk'}
                </div>
                <p className="text-xs text-muted-foreground mt-1">until critical burnout</p>
              </>
            ) : (
              <>
                <div className="text-2xl font-bold text-muted-foreground">—</div>
                <p className="text-xs text-muted-foreground mt-1">Run assessment to forecast</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add Commitment</CardTitle>
          <CardDescription>Add everything on your plate — meetings, projects, obligations, side work</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Commitment name"
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Hours per Week</label>
              <Input
                type="number"
                min={0.5}
                max={40}
                step={0.5}
                value={newTask.hoursPerWeek}
                onChange={(e) => setNewTask({ ...newTask, hoursPerWeek: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Deadline</label>
              <Input
                type="date"
                value={newTask.deadline}
                onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium w-32">Mental Drain (1-10)</label>
            <Input
              type="range"
              min={1}
              max={10}
              value={newTask.cognitiveLoad}
              onChange={(e) => setNewTask({ ...newTask, cognitiveLoad: parseInt(e.target.value) })}
              className="flex-1"
            />
            <span className={`text-2xl font-bold w-8 ${newTask.cognitiveLoad >= 7 ? 'text-red-600' : newTask.cognitiveLoad >= 4 ? 'text-yellow-600' : 'text-green-600'}`}>
              {newTask.cognitiveLoad}
            </span>
          </div>
          <Button onClick={addTask}>Add to My Plate</Button>
        </CardContent>
      </Card>

      {tasks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Plate ({tasks.length} commitments)</CardTitle>
            <CardDescription>{totalHours} hours/week | {Math.round(totalHours * 52)} hours/year | {Math.round(totalHours * 52 / 8)} workdays/year</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {tasks.map((t, i) => (
                <div key={i} className="flex items-center justify-between rounded-md border p-3">
                  <div className="flex-1">
                    <p className="font-medium">{t.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {t.hoursPerWeek}h/week | {t.deadline || 'No deadline'}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded text-sm font-medium mr-3 ${
                    t.cognitiveLoad >= 7 ? 'bg-red-100 text-red-800' :
                    t.cognitiveLoad >= 4 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    Drain: {t.cognitiveLoad}
                  </span>
                  <button onClick={() => removeTask(i)} className="text-muted-foreground hover:text-red-600 text-sm">
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <Button className="mt-4" onClick={assessLoad} disabled={loading}>
              {loading ? 'Assessing Burnout Risk...' : 'Assess My Capacity'}
            </Button>
          </CardContent>
        </Card>
      )}

      {assessment && (
        <div className="space-y-4">
          {assessment.burnoutTimeline && (
            <Card className={`border-2 ${
              assessment.burnoutRisk === 'critical' ? 'border-red-400 bg-red-50' :
              assessment.burnoutRisk === 'high' ? 'border-orange-400 bg-orange-50' :
              assessment.burnoutRisk === 'medium' ? 'border-yellow-400 bg-yellow-50' :
              'border-green-400 bg-green-50'
            }`}>
              <CardHeader>
                <CardTitle>Burnout Forecast</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-medium">{assessment.burnoutTimeline.trajectory}</p>
                {assessment.burnoutTimeline.earlyWarnings?.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm font-medium mb-1">Watch for these signs:</p>
                    <ul className="text-sm text-muted-foreground list-disc pl-5">
                      {assessment.burnoutTimeline.earlyWarnings.map((w: string, i: number) => (
                        <li key={i}>{w}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {assessment.loadDrivers?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Biggest Load Drivers</CardTitle>
                <CardDescription>These commitments are eating the most capacity</CardDescription>
              </CardHeader>
              <CardContent>
                {assessment.loadDrivers.map((d: any, i: number) => (
                  <div key={i} className="flex items-center justify-between rounded-md border p-3 mb-2">
                    <div>
                      <p className="font-medium">{d.commitment}</p>
                      <div className="flex gap-2 mt-1">
                        {d.canDefer && <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">Can Defer</span>}
                        {d.canDelegate && <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded">Can Delegate</span>}
                        {d.canDrop && <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded">Can Drop</span>}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">{d.loadContribution}%</div>
                      <div className="text-xs text-muted-foreground">of your load</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {assessment.recommendations?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recommended Actions</CardTitle>
              </CardHeader>
              <CardContent>
                {assessment.recommendations.map((r: any, i: number) => (
                  <div key={i} className="flex items-center gap-3 rounded-md border p-3 mb-2">
                    <span className={`shrink-0 text-xs font-bold px-2 py-1 rounded ${
                      r.urgency === 'now' ? 'bg-red-100 text-red-800' :
                      r.urgency === 'this-week' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {r.urgency}
                    </span>
                    <div>
                      <p className="font-medium">{r.action}</p>
                      <p className="text-sm text-muted-foreground">Impact: {r.impact}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {assessment.noCard && (
            <Card className="border-2 border-primary">
              <CardHeader>
                <CardTitle>Your "No" Card</CardTitle>
                <CardDescription>Copy this professional boundary statement and send it to your boss or client</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted rounded-lg p-4 text-sm leading-relaxed">
                  {assessment.noCard}
                </div>
                <Button className="mt-3" variant="outline" onClick={copyNoCard}>
                  {copied ? 'Copied!' : 'Copy to Clipboard'}
                </Button>
              </CardContent>
            </Card>
          )}

          {assessment.recoveryPlan && (
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle>Recovery Plan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {assessment.recoveryPlan.immediateActions?.length > 0 && (
                  <div>
                    <h4 className="font-medium text-green-800 mb-1">Today</h4>
                    <ul className="text-sm list-disc pl-5">
                      {assessment.recoveryPlan.immediateActions.map((a: string, i: number) => <li key={i}>{a}</li>)}
                    </ul>
                  </div>
                )}
                {assessment.recoveryPlan.thisWeek?.length > 0 && (
                  <div>
                    <h4 className="font-medium text-green-800 mb-1">This Week</h4>
                    <ul className="text-sm list-disc pl-5">
                      {assessment.recoveryPlan.thisWeek.map((a: string, i: number) => <li key={i}>{a}</li>)}
                    </ul>
                  </div>
                )}
                {assessment.recoveryPlan.longTerm?.length > 0 && (
                  <div>
                    <h4 className="font-medium text-green-800 mb-1">Long Term</h4>
                    <ul className="text-sm list-disc pl-5">
                      {assessment.recoveryPlan.longTerm.map((a: string, i: number) => <li key={i}>{a}</li>)}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
