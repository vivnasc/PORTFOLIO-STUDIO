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
You are a calendar co-pilot powered by body rhythm intelligence. Analyze the user's energy tracking data to predict peak performance windows, recommend optimal task scheduling, and prevent energy crashes before they happen.

Energy logs: ${JSON.stringify(data.logs, null, 2)}
${data.calendar ? `Calendar events: ${JSON.stringify(data.calendar, null, 2)}` : ''}

Based on the biological energy patterns in this data:
1. Identify the user's chronotype and natural rhythm (peak, sustain, recovery phases)
2. Predict upcoming peak performance windows for the next 7 days
3. Flag crash risks — times when energy will likely drop based on historical patterns
4. Recommend task scheduling aligned with energy phases
5. Identify energy drains (meetings, contexts, activities that consistently deplete)

Respond ONLY in valid JSON:
{
  "chronotype": "description of user's natural energy pattern",
  "peakWindows": [{ "day": "day of week", "start": "HH:MM", "end": "HH:MM", "quality": "deep-focus/creative/collaborative", "confidence": 0-100 }],
  "crashRisks": [{ "day": "day of week", "time": "HH:MM", "trigger": "what causes the crash", "prevention": "actionable prevention strategy" }],
  "recommendedSchedule": {
    "deepWork": [{ "day": "day", "slot": "HH:MM-HH:MM" }],
    "meetings": [{ "day": "day", "slot": "HH:MM-HH:MM" }],
    "recovery": [{ "day": "day", "slot": "HH:MM-HH:MM", "activity": "suggested recovery activity" }]
  },
  "energyDrains": [{ "activity": "description", "avgEnergyDrop": 0-100, "recommendation": "how to mitigate" }],
  "energyScore": 0-100,
  "weekForecast": "1-2 sentence summary of the energy week ahead"
}`,
    'schedule-optimizer': (data) => `
You are a calendar co-pilot that merges body rhythm data with calendar commitments. Your job is to find the optimal placement for tasks by matching task demands to predicted energy availability.

Energy logs: ${JSON.stringify(data.energyLogs, null, 2)}
Calendar events: ${JSON.stringify(data.calendar, null, 2)}
Tasks to schedule: ${JSON.stringify(data.tasks, null, 2)}

For each task:
1. Determine the cognitive demand type (deep focus, creative, administrative, collaborative)
2. Match it to the best available energy window that isn't already occupied
3. Flag conflicts where high-demand tasks are placed during low-energy periods
4. Suggest rescheduling for misplaced existing calendar events if they clash with energy patterns

Respond ONLY in valid JSON:
{
  "optimizedSchedule": [
    {
      "task": "task name",
      "demandType": "deep-focus/creative/administrative/collaborative",
      "recommendedSlot": { "day": "day", "start": "HH:MM", "end": "HH:MM" },
      "energyMatch": 0-100,
      "reasoning": "why this slot is optimal"
    }
  ],
  "conflicts": [
    {
      "event": "existing calendar event",
      "issue": "why this is misplaced",
      "suggestedMove": "better time slot"
    }
  ],
  "protectedRecoveryBlocks": [{ "day": "day", "slot": "HH:MM-HH:MM", "reason": "why this must stay free" }],
  "dailySummary": [{ "day": "day", "energyBudget": 0-100, "allocated": 0-100, "headroom": 0-100 }]
}`,
  },
  capacityos: {
    'load-assessment': (data) => `
You are a burnout prevention system. Analyze the user's current cognitive load, commitments, and work patterns to assess burnout risk with a concrete timeline. Your job is to predict when the user will hit the wall if they continue at this pace, and provide a professionally-worded boundary statement they can share with their boss or client.

Tasks: ${JSON.stringify(data.tasks, null, 2)}
Commitments: ${JSON.stringify(data.commitments, null, 2)}
${data.workHistory ? `Recent work history: ${JSON.stringify(data.workHistory, null, 2)}` : ''}
${data.restData ? `Rest/recovery data: ${JSON.stringify(data.restData, null, 2)}` : ''}

Assess:
1. Current cognitive load vs sustainable capacity
2. Burnout trajectory — at this rate, how many days until critical burnout
3. Which specific commitments are the biggest load drivers
4. What must be shed, deferred, or renegotiated to stay sustainable
5. A professional boundary statement the user can copy-paste to their boss/client

Respond ONLY in valid JSON:
{
  "currentLoad": 0-100,
  "sustainableCapacity": 0-100,
  "burnoutRisk": "low/medium/high/critical",
  "burnoutTimeline": {
    "daysUntilCritical": "number or null if low risk",
    "trajectory": "description of the burnout curve",
    "earlyWarnings": ["symptoms to watch for now"]
  },
  "loadDrivers": [{ "commitment": "name", "loadContribution": 0-100, "canDefer": true, "canDelegate": true, "canDrop": true }],
  "recommendations": [{ "action": "what to do", "impact": "load reduction estimate", "urgency": "now/this-week/this-month" }],
  "tasksPrioritized": [{ "task": "name", "priority": 1-5, "canDefer": true, "reasoning": "why this priority" }],
  "noCard": "A professional, firm but respectful 2-3 sentence statement the user can send to their boss or client to set a boundary or push back on new work. Should reference capacity data without being emotional. Example tone: 'Based on my current workload analysis, I am at X% capacity with Y active commitments. Taking on [thing] would require deferring [other thing]. I'd recommend we revisit this after [date] or reallocate [specific item].'",
  "recoveryPlan": { "immediateActions": ["today"], "thisWeek": ["this week"], "longTerm": ["systemic changes"] }
}`,
    'burnout-forecast': (data) => `
You are a burnout early-warning system. Using historical workload data, project a burnout forecast for the next 30 days. Think of this as a weather forecast but for cognitive sustainability.

Work history: ${JSON.stringify(data.workHistory, null, 2)}
Upcoming commitments: ${JSON.stringify(data.upcoming, null, 2)}
${data.restData ? `Rest/recovery patterns: ${JSON.stringify(data.restData, null, 2)}` : ''}

Analyze:
1. Historical load patterns — are they escalating, stable, or recovering?
2. Upcoming load spikes based on scheduled commitments
3. Recovery deficit — is the user accumulating cognitive debt?
4. Predict the burnout risk for each of the next 4 weeks

Respond ONLY in valid JSON:
{
  "currentState": { "load": 0-100, "recoveryDebt": "hours of recovery deficit", "trend": "escalating/stable/recovering" },
  "weeklyForecast": [
    {
      "week": 1,
      "predictedLoad": 0-100,
      "burnoutRisk": "low/medium/high/critical",
      "peakDay": "day with highest load",
      "keyDrivers": ["what's driving load this week"],
      "recommendation": "what to do this week"
    }
  ],
  "criticalDates": [{ "date": "YYYY-MM-DD", "reason": "why this day is dangerous", "mitigation": "what to do" }],
  "recoveryWindows": [{ "date": "YYYY-MM-DD", "duration": "hours", "activity": "recommended recovery" }],
  "thirtyDaySummary": "1-2 sentence plain-language forecast of the month ahead",
  "noCard": "Professional boundary statement if the forecast shows unsustainable trajectory — something the user can proactively send to manage expectations"
}`,
  },
  outcomedb: {
    'decision-analysis': (data) => `
You are a decision intelligence analyst. Analyze this decision with the rigor of a management consultant — connect it to measurable outcomes, quantify expected ROI, identify assumptions that could invalidate the decision, and set up tracking criteria so the user knows if the decision was right.

Decision: ${JSON.stringify(data.decision, null, 2)}
${data.context ? `Business context: ${JSON.stringify(data.context, null, 2)}` : ''}
${data.previousDecisions ? `Related past decisions: ${JSON.stringify(data.previousDecisions, null, 2)}` : ''}

Analyze:
1. Decision type and strategic category
2. Expected ROI with specific metrics and timeframes
3. Key assumptions — and what evidence would prove each wrong
4. Risk-adjusted outcome probability
5. Success/failure criteria that can be measured
6. Connection to previous decisions in the user's history (if provided)

Respond ONLY in valid JSON:
{
  "decisionType": "strategic/operational/tactical/financial/people",
  "stakeholders": [{ "who": "stakeholder", "impact": "how they're affected", "influence": "high/medium/low" }],
  "expectedROI": {
    "metric": "what to measure",
    "baseline": "current state",
    "target": "expected outcome",
    "timeframe": "when to measure",
    "confidence": 0-100
  },
  "assumptions": [{ "assumption": "description", "criticality": "high/medium/low", "validationMethod": "how to test this assumption", "invalidationSignal": "what would prove this wrong" }],
  "risks": [{ "risk": "description", "probability": 0-100, "impact": "high/medium/low", "mitigation": "action" }],
  "successCriteria": [{ "metric": "what to measure", "target": "threshold", "deadline": "date" }],
  "failureCriteria": [{ "signal": "what would indicate failure", "deadline": "when to check" }],
  "reviewDate": "suggested review date",
  "tags": ["tag"],
  "connectedDecisions": ["IDs or descriptions of related past decisions"]
}`,
    'pattern-discovery': (data) => `
You are a decision pattern analyst. Analyze the user's complete decision history to discover win/loss patterns, recurring blind spots, and strategic tendencies. Think of this as a performance review for decision-making quality.

Decision history: ${JSON.stringify(data.decisions, null, 2)}
${data.outcomes ? `Outcome data: ${JSON.stringify(data.outcomes, null, 2)}` : ''}

Analyze across all decisions to find:
1. Win patterns — what conditions, approaches, or decision types consistently lead to good outcomes
2. Loss patterns — what conditions or approaches correlate with poor outcomes
3. Blind spots — systematic biases or factors the user consistently overlooks
4. Decision velocity — are fast or slow decisions performing better
5. Domain strengths/weaknesses — which categories of decisions does the user excel or struggle in
6. Trend over time — is decision quality improving, declining, or stable

Respond ONLY in valid JSON:
{
  "winPatterns": [{ "pattern": "description", "frequency": "how often this appears", "avgOutcomeScore": 0-100, "exampleDecisions": ["decision references"] }],
  "lossPatterns": [{ "pattern": "description", "frequency": "how often this appears", "avgOutcomeScore": 0-100, "exampleDecisions": ["decision references"] }],
  "blindSpots": [{ "bias": "description of systematic blind spot", "evidence": "how this shows up in the data", "recommendation": "how to correct for it" }],
  "decisionVelocity": { "avgTimeToDecision": "duration", "fastDecisionOutcome": 0-100, "slowDecisionOutcome": 0-100, "optimalPace": "recommendation" },
  "domainAnalysis": [{ "domain": "category", "totalDecisions": "count", "winRate": 0-100, "trend": "improving/stable/declining" }],
  "overallTrend": { "direction": "improving/stable/declining", "decisionQualityScore": 0-100, "topStrength": "description", "topWeakness": "description" },
  "recommendations": ["actionable improvements for better decision-making"]
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
You are a life firewall. Your job is to protect the user's time, energy, and focus by ruthlessly analyzing the true cost of every potential commitment. Go beyond surface-level time estimates — calculate hidden costs including energy drain, opportunity cost, context-switching tax, relationship impact, and compounding effects over time. Make the hidden cost visceral and undeniable.

Commitment: ${JSON.stringify(data.commitment, null, 2)}
Current load: ${JSON.stringify(data.currentLoad, null, 2)}
Values: ${JSON.stringify(data.values, null, 2)}
${data.existingCommitments ? `Existing commitments: ${JSON.stringify(data.existingCommitments, null, 2)}` : ''}

Analyze:
1. Direct time cost (hours/week, projected annually)
2. Hidden costs: energy drain, mental overhead, preparation time, recovery time
3. Opportunity cost: what specific things will the user NOT be able to do
4. Context-switching tax: how this fragments existing focus blocks
5. Relationship impact: how saying yes/no affects key relationships
6. Compounding effect: how this commitment grows over time (scope creep risk)
7. Values alignment: does this serve the user's stated priorities

Respond ONLY in valid JSON:
{
  "alignmentScore": 0-100,
  "recommendation": "accept/negotiate/decline",
  "reasoning": "explanation",
  "directCost": {
    "hoursPerWeek": "number",
    "hoursPerYear": "number",
    "equivalentWorkdays": "number (hours/8)"
  },
  "hiddenCosts": {
    "energyDrain": { "level": "low/medium/high/extreme", "description": "specific energy impact" },
    "mentalOverhead": { "level": "low/medium/high/extreme", "description": "cognitive load even when not actively working on it" },
    "prepAndRecovery": { "hoursPerWeek": "number", "description": "time spent preparing for and recovering from this commitment" },
    "contextSwitchingTax": { "fragmentedBlocks": "number of focus blocks disrupted", "productivityLoss": "estimated % loss" }
  },
  "opportunityCost": [{ "whatYouLose": "specific thing you cannot do", "value": "why it matters" }],
  "relationshipImpact": { "ifAccept": "impact on relationships", "ifDecline": "impact on relationships" },
  "scopeCreepRisk": { "level": "low/medium/high", "projection": "how this commitment likely grows over 6 months" },
  "realityCheck": "A visceral, emotionally compelling 2-3 sentence statement that makes the total hidden cost tangible and undeniable. Use concrete numbers and vivid comparisons. Example: 'This commitment will consume 12 hours/week — that's 624 hours/year, equivalent to 78 full workdays. You're trading almost 4 months of workdays for this. In that same time, you could [specific alternative based on their values].'",
  "alternatives": [{ "suggestion": "alternative approach", "costReduction": "how much this saves" }],
  "negotiationScript": "If recommendation is 'negotiate', provide a word-for-word script the user can use to propose better terms"
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
