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

const timeSlots = [
  { label: 'Early Morning (6-8am)', value: '07:00' },
  { label: 'Morning (8-10am)', value: '09:00' },
  { label: 'Late Morning (10-12pm)', value: '11:00' },
  { label: 'After Lunch (12-2pm)', value: '13:00' },
  { label: 'Afternoon (2-4pm)', value: '15:00' },
  { label: 'Late Afternoon (4-6pm)', value: '17:00' },
  { label: 'Evening (6-8pm)', value: '19:00' },
  { label: 'Night (8-10pm)', value: '21:00' },
]

function EnergyBar({ level, label }: { level: number; label: string }) {
  const color = level >= 8 ? 'bg-green-500' : level >= 6 ? 'bg-emerald-400' : level >= 4 ? 'bg-yellow-400' : level >= 2 ? 'bg-orange-400' : 'bg-red-500'
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-muted-foreground w-28 shrink-0">{label}</span>
      <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${level * 10}%` }} />
      </div>
      <span className="text-sm font-bold w-6 text-right">{level}</span>
    </div>
  )
}

export default function EnergyTracking() {
  const [entries, setEntries] = useState<EnergyEntry[]>([])
  const [analysis, setAnalysis] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [selectedTime, setSelectedTime] = useState('')
  const [newEntry, setNewEntry] = useState<EnergyEntry>({
    timestamp: '',
    level: 5,
    activity: '',
    context: '',
  })

  const addEntry = () => {
    if (!newEntry.activity) return
    const timestamp = selectedTime || new Date().toISOString()
    setEntries([...entries, { ...newEntry, timestamp }])
    setNewEntry({ timestamp: '', level: 5, activity: '', context: '' })
    setSelectedTime('')
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

  const avgEnergy = entries.length ? (entries.reduce((s, e) => s + e.level, 0) / entries.length).toFixed(1) : '—'
  const peakEntry = entries.length ? entries.reduce((best, e) => e.level > best.level ? e : best, entries[0]) : null
  const lowEntry = entries.length ? entries.reduce((worst, e) => e.level < worst.level ? e : worst, entries[0]) : null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Energy Co-Pilot</h1>
        <p className="text-muted-foreground">Map your body rhythms. Schedule your life around your energy, not against it.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Check-ins Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{entries.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Avg Energy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{avgEnergy}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Peak Window</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-green-600">
              {peakEntry ? `${peakEntry.context || peakEntry.activity}` : '—'}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Crash Risk</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-red-600">
              {lowEntry ? `${lowEntry.context || lowEntry.activity}` : '—'}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Energy Check-in</CardTitle>
          <CardDescription>How are you feeling right now? Quick check-ins build your energy map.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Time of Day</label>
            <div className="grid grid-cols-4 gap-2">
              {timeSlots.map((slot) => (
                <button
                  key={slot.value}
                  onClick={() => setSelectedTime(slot.value)}
                  className={`text-xs px-2 py-2 rounded border transition-colors ${
                    selectedTime === slot.value
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'hover:bg-muted border-border'
                  }`}
                >
                  {slot.label}
                </button>
              ))}
            </div>
          </div>
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
            <span className={`text-2xl font-bold w-8 ${newEntry.level >= 7 ? 'text-green-600' : newEntry.level >= 4 ? 'text-yellow-600' : 'text-red-600'}`}>
              {newEntry.level}
            </span>
          </div>
          <Input
            placeholder="What are you doing right now?"
            value={newEntry.activity}
            onChange={(e) => setNewEntry({ ...newEntry, activity: e.target.value })}
          />
          <Input
            placeholder="Context (after lunch, morning coffee, stressed, post-meeting...)"
            value={newEntry.context}
            onChange={(e) => setNewEntry({ ...newEntry, context: e.target.value })}
          />
          <Button onClick={addEntry}>Log Check-in</Button>
        </CardContent>
      </Card>

      {entries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Energy Map</CardTitle>
            <CardDescription>Visualize your energy rhythm throughout the day</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {entries.map((e, i) => (
              <EnergyBar key={i} level={e.level} label={e.context || e.activity} />
            ))}
            <div className="pt-4 border-t">
              <Button onClick={analyzeEnergy} disabled={loading || entries.length < 3}>
                {loading ? 'Mapping Your Rhythm...' : 'Get My Optimal Schedule'}
              </Button>
              {entries.length < 3 && (
                <p className="text-xs text-muted-foreground mt-2">Log at least 3 check-ins to unlock your energy map</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {analysis && (
        <div className="space-y-4">
          {analysis.chronotype && (
            <Card>
              <CardHeader>
                <CardTitle>Your Chronotype</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg">{analysis.chronotype}</p>
              </CardContent>
            </Card>
          )}

          {analysis.recommendedSchedule && (
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle>Your Optimal Day</CardTitle>
                <CardDescription>Schedule these blocks to work with your body, not against it</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {analysis.recommendedSchedule.deepWork?.length > 0 && (
                  <div>
                    <h4 className="font-medium text-green-800 mb-2">Deep Focus Windows</h4>
                    {analysis.recommendedSchedule.deepWork.map((slot: any, i: number) => (
                      <div key={i} className="text-sm bg-white rounded px-3 py-2 mb-1">
                        {slot.day}: {slot.slot}
                      </div>
                    ))}
                  </div>
                )}
                {analysis.recommendedSchedule.meetings?.length > 0 && (
                  <div>
                    <h4 className="font-medium text-yellow-800 mb-2">Meeting Windows</h4>
                    {analysis.recommendedSchedule.meetings.map((slot: any, i: number) => (
                      <div key={i} className="text-sm bg-white rounded px-3 py-2 mb-1">
                        {slot.day}: {slot.slot}
                      </div>
                    ))}
                  </div>
                )}
                {analysis.recommendedSchedule.recovery?.length > 0 && (
                  <div>
                    <h4 className="font-medium text-blue-800 mb-2">Recovery Blocks</h4>
                    {analysis.recommendedSchedule.recovery.map((slot: any, i: number) => (
                      <div key={i} className="text-sm bg-white rounded px-3 py-2 mb-1">
                        {slot.day}: {slot.slot} — {slot.activity}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {analysis.crashRisks?.length > 0 && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle>Crash Risks</CardTitle>
                <CardDescription>Watch out for these energy drops</CardDescription>
              </CardHeader>
              <CardContent>
                {analysis.crashRisks.map((risk: any, i: number) => (
                  <div key={i} className="bg-white rounded px-3 py-2 mb-2">
                    <p className="font-medium text-red-800">{risk.day} at {risk.time}</p>
                    <p className="text-sm text-muted-foreground">Trigger: {risk.trigger}</p>
                    <p className="text-sm text-green-700">Prevention: {risk.prevention}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {analysis.weekForecast && (
            <Card>
              <CardHeader>
                <CardTitle>Week Ahead</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{analysis.weekForecast}</p>
                {analysis.energyScore !== undefined && (
                  <div className="mt-3">
                    <span className="text-sm text-muted-foreground">Energy Score: </span>
                    <span className={`text-2xl font-bold ${analysis.energyScore >= 70 ? 'text-green-600' : analysis.energyScore >= 40 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {analysis.energyScore}/100
                    </span>
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
