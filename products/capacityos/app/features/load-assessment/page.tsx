'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Task {
  title: string
  cognitiveLoad: number
  deadline: string
  status: 'pending' | 'in_progress'
}

export default function LoadAssessment() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [assessment, setAssessment] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [newTask, setNewTask] = useState<Task>({
    title: '',
    cognitiveLoad: 5,
    deadline: '',
    status: 'pending',
  })

  const addTask = () => {
    if (!newTask.title) return
    setTasks([...tasks, newTask])
    setNewTask({ title: '', cognitiveLoad: 5, deadline: '', status: 'pending' })
  }

  const assessLoad = async () => {
    if (tasks.length === 0) return
    setLoading(true)
    try {
      const response = await fetch('/api/capacityos/assess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks, commitments: [] }),
      })
      const data = await response.json()
      setAssessment(data)
    } catch (error) {
      console.error('Assessment failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const totalLoad = tasks.reduce((sum, t) => sum + t.cognitiveLoad, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Cognitive Load Assessment</h1>
        <p className="text-muted-foreground">Track tasks and assess your cognitive capacity</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Load</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${totalLoad > 50 ? 'text-red-600' : totalLoad > 30 ? 'text-yellow-600' : 'text-green-600'}`}>
              {totalLoad}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Active Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{tasks.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Avg Load/Task</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {tasks.length ? (totalLoad / tasks.length).toFixed(1) : '0'}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add Task</CardTitle>
          <CardDescription>Add a task to assess its cognitive impact</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Task title"
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
          />
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium w-32">Cognitive Load (1-10)</label>
            <Input
              type="range"
              min={1}
              max={10}
              value={newTask.cognitiveLoad}
              onChange={(e) => setNewTask({ ...newTask, cognitiveLoad: parseInt(e.target.value) })}
              className="flex-1"
            />
            <span className="text-2xl font-bold w-8">{newTask.cognitiveLoad}</span>
          </div>
          <Input
            type="date"
            value={newTask.deadline}
            onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
          />
          <Button onClick={addTask}>Add Task</Button>
        </CardContent>
      </Card>

      {tasks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Tasks ({tasks.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {tasks.map((t, i) => (
                <div key={i} className="flex items-center justify-between rounded-md border p-3">
                  <div>
                    <p className="font-medium">{t.title}</p>
                    <p className="text-sm text-muted-foreground">{t.deadline || 'No deadline'}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-sm font-medium ${t.cognitiveLoad >= 7 ? 'bg-red-100 text-red-800' : t.cognitiveLoad >= 4 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                    Load: {t.cognitiveLoad}
                  </span>
                </div>
              ))}
            </div>
            <Button className="mt-4" onClick={assessLoad} disabled={loading}>
              {loading ? 'Assessing...' : 'Assess Capacity'}
            </Button>
          </CardContent>
        </Card>
      )}

      {assessment && (
        <Card>
          <CardHeader>
            <CardTitle>Capacity Assessment</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap text-sm">{JSON.stringify(assessment, null, 2)}</pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
