// RiskLoop
export interface RiskPattern {
  id: string
  user_id: string
  description: string
  frequency: 'daily' | 'weekly' | 'monthly'
  risk_score: number
  cost_estimate: {
    time: string
    money: string
    opportunity: string
  }
  intervention_point: string
  created_at: string
}

// EnergyOS
export interface EnergyLog {
  id: string
  user_id: string
  timestamp: string
  energy_level: number // 1-10
  context: string
  activity: string
  notes?: string
}

// CapacityOS
export interface CognitiveTask {
  id: string
  user_id: string
  title: string
  cognitive_load: number // 1-10
  priority: number // 1-5
  deadline?: string
  status: 'pending' | 'in_progress' | 'completed' | 'deferred'
  created_at: string
}

// OutcomeDB
export interface Decision {
  id: string
  user_id: string
  title: string
  description: string
  context: string
  outcome?: string
  outcome_rating?: number // 1-5
  decision_date: string
  review_date?: string
  tags: string[]
  created_at: string
}

// Stick
export interface Habit {
  id: string
  user_id: string
  name: string
  description: string
  frequency: 'daily' | 'weekly'
  current_streak: number
  best_streak: number
  micro_steps: string[]
  friction_points: string[]
  created_at: string
}

// PeopleDB
export interface Contact {
  id: string
  user_id: string
  name: string
  email?: string
  relationship_type: string
  relationship_strength: number // 0-100
  last_contact_date?: string
  next_contact_date?: string
  notes: string
  tags: string[]
  created_at: string
}

// CommitmentFilter
export interface Commitment {
  id: string
  user_id: string
  title: string
  description: string
  requester: string
  alignment_score: number // 0-100
  capacity_impact: 'low' | 'medium' | 'high'
  recommendation: 'accept' | 'negotiate' | 'decline'
  status: 'pending' | 'accepted' | 'declined' | 'negotiated'
  deadline?: string
  created_at: string
}
