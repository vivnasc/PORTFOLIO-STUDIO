'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface ContactEntry {
  name: string
  email: string
  relationship: string
  lastContact: string
  notes: string
  interactions: { date: string; type: string; notes: string }[]
}

export default function Contacts() {
  const [contacts, setContacts] = useState<ContactEntry[]>([])
  const [insights, setInsights] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [newContact, setNewContact] = useState({
    name: '',
    email: '',
    relationship: '',
    notes: '',
  })

  const addContact = () => {
    if (!newContact.name) return
    setContacts([...contacts, {
      ...newContact,
      lastContact: new Date().toISOString(),
      interactions: [],
    }])
    setNewContact({ name: '', email: '', relationship: '', notes: '' })
  }

  const logInteraction = (index: number) => {
    const updated = [...contacts]
    updated[index].interactions.push({
      date: new Date().toISOString(),
      type: 'contact',
      notes: '',
    })
    updated[index].lastContact = new Date().toISOString()
    setContacts(updated)
  }

  const getInsights = async (contact: ContactEntry) => {
    setLoading(true)
    try {
      const response = await fetch('/api/peopledb/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contact, interactions: contact.interactions }),
      })
      const data = await response.json()
      setInsights(data)
    } catch (error) {
      console.error('Insights failed:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Contacts</h1>
        <p className="text-muted-foreground">Your personal CRM with relationship intelligence</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add Contact</CardTitle>
          <CardDescription>Add someone to your network</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Name"
            value={newContact.name}
            onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
          />
          <Input
            type="email"
            placeholder="Email"
            value={newContact.email}
            onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
          />
          <Input
            placeholder="Relationship (friend, colleague, client...)"
            value={newContact.relationship}
            onChange={(e) => setNewContact({ ...newContact, relationship: e.target.value })}
          />
          <Input
            placeholder="Notes"
            value={newContact.notes}
            onChange={(e) => setNewContact({ ...newContact, notes: e.target.value })}
          />
          <Button onClick={addContact}>Add Contact</Button>
        </CardContent>
      </Card>

      {contacts.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Your Network ({contacts.length})</h2>
          {contacts.map((c, i) => (
            <Card key={i}>
              <CardHeader>
                <CardTitle>{c.name}</CardTitle>
                <CardDescription>
                  {c.relationship} {c.email && `- ${c.email}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">
                  Interactions: {c.interactions.length} | Last contact: {new Date(c.lastContact).toLocaleDateString()}
                </p>
                {c.notes && <p className="text-sm mb-4">{c.notes}</p>}
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => logInteraction(i)}>Log Contact</Button>
                  <Button size="sm" variant="outline" onClick={() => getInsights(c)} disabled={loading}>
                    {loading ? 'Loading...' : 'Get Insights'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {insights && (
        <Card>
          <CardHeader>
            <CardTitle>Relationship Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap text-sm">{JSON.stringify(insights, null, 2)}</pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
