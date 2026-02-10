import type { AnalyzeParams } from './types'

const promptTemplates: Record<string, Record<string, (data: Record<string, unknown>) => string>> = {
  riskloop: {
    'pattern-detection': (data) => `
Analyze these decisions for behavioral risk patterns.

Decisions:
${JSON.stringify(data.decisions, null, 2)}

Identify:
1. Repeated decision types with negative outcomes
2. Contextual triggers (stress, time pressure, etc)
3. Estimated cost (time/money/opportunity)
4. Pattern frequency
5. Predicted next occurrence

Respond ONLY in valid JSON:
{
  "patterns": [
    {
      "description": "brief pattern description",
      "frequency": "weekly/monthly",
      "costEstimate": { "time": "hours", "money": "amount", "opportunity": "description" },
      "riskScore": 0-100,
      "interventionPoint": "actionable suggestion"
    }
  ]
}`,
    'cost-analysis': (data) => `
Calculate the cumulative cost of this behavioral pattern.

Pattern: ${JSON.stringify(data.pattern, null, 2)}
History: ${JSON.stringify(data.history, null, 2)}

Provide cost breakdown in JSON:
{
  "totalTimeLost": "hours",
  "totalMoneyCost": "amount",
  "opportunityCost": "description",
  "projectedAnnualCost": "amount",
  "recommendations": ["action items"]
}`,
  },
  energyos: {
    'energy-analysis': (data) => `
Analyze this energy tracking data and identify performance patterns.

Energy logs: ${JSON.stringify(data.logs, null, 2)}

Provide analysis in JSON:
{
  "peakHours": ["HH:MM-HH:MM"],
  "lowEnergyTriggers": ["trigger"],
  "recommendedSchedule": { "deepWork": "time range", "meetings": "time range", "rest": "time range" },
  "energyScore": 0-100
}`,
  },
  capacityos: {
    'load-assessment': (data) => `
Assess cognitive load based on current commitments and tasks.

Tasks: ${JSON.stringify(data.tasks, null, 2)}
Commitments: ${JSON.stringify(data.commitments, null, 2)}

Provide assessment in JSON:
{
  "currentLoad": 0-100,
  "capacity": 0-100,
  "overloadRisk": "low/medium/high",
  "recommendations": ["action items"],
  "tasksPrioritized": [{ "task": "name", "priority": 1-5, "canDefer": true }]
}`,
  },
  outcomedb: {
    'decision-analysis': (data) => `
Analyze this decision and its context for the decision archive.

Decision: ${JSON.stringify(data.decision, null, 2)}

Provide structured analysis in JSON:
{
  "decisionType": "category",
  "stakeholders": ["who"],
  "assumptions": ["assumption"],
  "risks": ["risk"],
  "expectedOutcome": "description",
  "reviewDate": "suggested date",
  "tags": ["tag"]
}`,
  },
  stick: {
    'friction-analysis': (data) => `
Analyze friction points preventing this habit from sticking.

Habit: ${JSON.stringify(data.habit, null, 2)}
Attempts: ${JSON.stringify(data.attempts, null, 2)}

Provide anti-friction strategy in JSON:
{
  "frictionPoints": [{ "point": "description", "severity": 1-5 }],
  "microSteps": ["tiny action"],
  "triggers": ["environmental trigger"],
  "rewards": ["immediate reward"],
  "streakStrategy": "approach"
}`,
  },
  peopledb: {
    'relationship-insights': (data) => `
Analyze relationship patterns and suggest actions.

Contact: ${JSON.stringify(data.contact, null, 2)}
Interactions: ${JSON.stringify(data.interactions, null, 2)}

Provide insights in JSON:
{
  "relationshipStrength": 0-100,
  "communicationStyle": "description",
  "suggestedActions": ["action"],
  "nextContactDate": "date",
  "topics": ["shared interest"]
}`,
  },
  commitmentfilter: {
    'commitment-evaluation': (data) => `
Evaluate this potential commitment against current capacity and values.

Commitment: ${JSON.stringify(data.commitment, null, 2)}
CurrentLoad: ${JSON.stringify(data.currentLoad, null, 2)}
Values: ${JSON.stringify(data.values, null, 2)}

Provide evaluation in JSON:
{
  "alignmentScore": 0-100,
  "capacityImpact": "low/medium/high",
  "recommendation": "accept/negotiate/decline",
  "reasoning": "explanation",
  "alternatives": ["suggestion"],
  "hiddenCosts": ["cost"]
}`,
  },
}

export function loadPrompt(params: { productId: string; promptType: string; data: Record<string, unknown> }): string {
  const productPrompts = promptTemplates[params.productId]
  if (!productPrompts) {
    throw new Error(`No prompts found for product: ${params.productId}`)
  }

  const template = productPrompts[params.promptType]
  if (!template) {
    throw new Error(`No prompt template found: ${params.productId}/${params.promptType}`)
  }

  return template(params.data)
}
