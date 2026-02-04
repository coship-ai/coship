# Skill: ship-respond

## Purpose
AI-powered response generation that drafts replies, comments, and messages in Ship's authentic voice while flagging sensitive items for human review.

## Trigger Phrases
- "Run ship-respond"
- "Draft responses to new interactions"
- "Generate replies for pending items"
- "Help me respond to [specific interaction]"

## What This Skill Does

### 1. Load Context
**Ship Persona:**
- Reads `/SHIP_PERSONA.md` for voice, tone, values
- Understands: core beliefs, what Ship cares about, example phrases
- Maintains: helpful & approachable, clear over clever, encouraging but honest

**Platform Context:**
- Understands platform norms (Twitter brevity vs Reddit depth)
- Adapts formality based on platform and interaction type
- Knows when to use threads vs single replies

### 2. Fetch Pending Interactions
Queries Notion "Interactions Log" for:
```sql
SELECT * FROM interactions
WHERE "Response Status" = 'New'
ORDER BY Priority DESC, Date DESC
```

### 3. Draft Responses
For each interaction:

**Analyze Intent:**
- What is the person asking/saying?
- What's the appropriate response type? (Answer question, provide encouragement, give advice, celebrate, etc.)
- Should CoShip be mentioned? (Only if directly relevant)

**Apply Response Templates:**
- Match to appropriate template from SHIP_PERSONA.md
- Customize based on specific context
- Ensure voice consistency

**Generate Draft:**
- Write response in Ship's voice
- Include: helpful content, empathy, encouragement, call-to-action (if appropriate)
- Keep appropriate length for platform

### 4. Escalation Check
Flag for human review if:
- Negative feedback or complaints
- Pricing/financial questions
- Competitor mentions or comparisons
- Legal/medical/financial advice territory
- Requests for features/commitments
- Anything "too promotional" feeling
- Personal attacks or trolling
- Suspicious/spam-like behavior

### 5. Update Notion
For each drafted response:
```sql
UPDATE interactions
SET "Draft Response" = [generated text],
    "Response Status" = 'Draft Ready' OR 'Needs Review'
WHERE interaction_id = [id]
```

### 6. Present to Human
Show drafts with context for approval:
```markdown
## Draft Responses Ready for Review

### 1. Twitter: @startup_founder asking about pricing
**Their message:** "How much does CoShip cost? I have a marketplace idea."
**Priority:** HIGH
**My draft response:**
> Hey! CoShip pricing is $299 for the first 20 customers (launch price), then $499.
>
> For a marketplace, we'd focus on the MVP core: user registration, listings, and basic transactions. No need for every feature on day one.
>
> Happy to chat about your specific idea if you want to DM me. What's the marketplace for?

**Recommendation:** ✅ Safe to post
**Action:** Reply or Edit?
```

## Step-by-Step Execution

### Step 1: Initialize Context
```javascript
1. Read /SHIP_PERSONA.md
2. Load response templates
3. Understand voice guidelines
4. Set escalation triggers
```

### Step 2: Query Notion for Pending Interactions
```javascript
1. Connect to Notion Interactions Log
2. Filter: Response Status = "New"
3. Sort: Priority (High → Low), Date (New → Old)
4. Load interaction details: Platform, Type, Author, Content, URL
```

### Step 3: Process Each Interaction
```javascript
for each interaction {
  // Analyze
  intent = analyzeIntent(interaction.content)
  context = getConversationContext(interaction.url)

  // Check for escalation
  if (requiresHumanReview(interaction)) {
    flagForReview(interaction, reason)
    continue
  }

  // Generate response
  draft = generateResponse(
    persona: SHIP_PERSONA,
    platform: interaction.platform,
    type: interaction.type,
    intent: intent,
    context: context
  )

  // Save to Notion
  updateNotion(interaction.id, {
    draftResponse: draft,
    status: 'Draft Ready'
  })
}
```

### Step 4: Present Drafts to Human
```javascript
1. Group by priority
2. Show draft with full context
3. Indicate safety level
4. Request approval or edits
```

### Step 5: Execute Approved Responses
```javascript
for each approved draft {
  if (platform == 'Twitter') {
    postTweetReply(draft, originalTweetUrl)
  } else if (platform == 'Reddit') {
    postRedditComment(draft, originalPostUrl)
  } else if (platform == 'Product Hunt') {
    postPHComment(draft, originalUrl)
  }

  // Update Notion
  updateNotion(interaction.id, {
    status: 'Responded',
    postedDate: now()
  })
}
```

## Response Template Matching

### For "How Do I Build X" Questions
```javascript
Template: Structured Advice
- Validate the question
- Provide 2-3 paths with tradeoffs
- Ask clarifying question
- Mention CoShip only if directly relevant
```

**Example:**
> Good question! For [X type of product], here's how I'd think about it:
>
> If you want to validate fast: [option 1]
> If you want more control: [option 2]
>
> The "right" answer depends on your timeline and budget. What's the one thing the product absolutely must do well?

### For Founder Frustration Posts
```javascript
Template: Empathy + Perspective
- Validate their feelings
- Share relevant insight from experience
- Provide encouragement
- Offer to help further
```

**Example:**
> I've been on both sides of this—as the technical person and now working with non-technical founders.
>
> The frustration you're feeling is real, but so is this: the tools available now are dramatically better than even 2 years ago.
>
> Want to share more about what you're trying to build? Happy to point you in a direction.

### For Technical Questions
```javascript
Template: Simplify + Educate
- Translate technical concept to simple terms
- Use analogies if helpful
- Break into steps
- Offer deeper explanation if wanted
```

**Example:**
> Think of authentication like a bouncer at a club. OAuth (Google Sign-In) is like showing your driver's license—someone trusted (Google) already verified you.
>
> For an MVP, you don't need to build this from scratch. Use tools like Auth0 or Supabase Auth—they handle the complex stuff so you can focus on your product's core features.

### For Praise/Positive Feedback
```javascript
Template: Gratitude + Amplify
- Thank them genuinely
- Reflect back what resonated
- Invite continued conversation
```

**Example:**
> Thanks so much! That really means a lot. The idea of making building more accessible to non-technical founders is exactly why we built CoShip.
>
> What are you working on? Always curious to hear what people are building.

### For Skepticism About AI/CoShip
```javascript
Template: Honest Acknowledgment
- Validate their concern
- Be transparent about limitations
- Explain approach
- No overselling
```

**Example:**
> Fair skepticism—there's a lot of hype out there.
>
> Here's my honest take: AI tools are genuinely useful for [specific use cases], but they're not magic. They work best with clear requirements and human oversight.
>
> That's why CoShip is AI-assisted with experienced engineers guiding the process, not just "vibe coding" and hoping for the best.

## Platform-Specific Adaptations

### Twitter
- **Length:** Aim for 280 chars or less (use thread if needed)
- **Tone:** Slightly more casual, punchy
- **Format:** Line breaks for readability
- **CTA:** Soft (e.g., "DM me if you want to talk it through")

### Reddit
- **Length:** More detailed, 2-4 paragraphs typical
- **Tone:** Helpful expert, slightly more formal
- **Format:** Use markdown: bold, bullet points, sections
- **CTA:** Stronger (e.g., "Happy to answer follow-up questions")
- **CoShip Mention:** Only in last sentence if relevant, never leading with it

### Product Hunt
- **Length:** Medium, 1-3 paragraphs
- **Tone:** Professional but friendly
- **Format:** Clean, enthusiastic
- **CTA:** Encourage continued discussion

## Escalation Scenarios

### Auto-Flag for Human Review:

**Negative Feedback:**
```
User: "This is just another scam. AI can't build real products."
→ FLAG: Negative sentiment + misconception
→ Reason: Requires thoughtful, non-defensive response
→ Suggested approach: Acknowledge skepticism, provide evidence, stay calm
```

**Pricing/Commitment Questions:**
```
User: "Can you build my app for $100?"
→ FLAG: Pricing negotiation
→ Reason: Needs accurate pricing info, possible sale
→ Suggested approach: Honest about pricing, explore if good fit
```

**Competitor Comparison:**
```
User: "How is this different from Bubble/Webflow/V0?"
→ FLAG: Competitive positioning
→ Reason: Important differentiation opportunity
→ Suggested approach: Honest comparison, focus on unique value
```

**Feature Request/Commitment:**
```
User: "Will you add Stripe integration?"
→ FLAG: Feature commitment
→ Reason: Can't promise features without founder approval
→ Suggested approach: "Great idea, let me look into this"
```

## Quality Checks

Before marking draft as ready:

✅ **Voice Consistency:**
- Sounds like Ship (helpful, approachable, not salesy)
- Uses Ship's vocabulary
- Avoids buzzwords Ship wouldn't use

✅ **Accuracy:**
- Facts about CoShip are correct
- No promises that can't be kept
- Technical explanations are sound

✅ **Helpfulness:**
- Actually answers the question/addresses the comment
- Provides value even if not promoting CoShip
- Encourages continued conversation

✅ **Appropriateness:**
- Respects platform norms
- Not overly promotional
- Matches formality level of original interaction

✅ **Safety:**
- No legal/financial/medical advice
- No personal attacks (even in response to trolling)
- No revealing confidential information

## Configuration Options

### Auto-Respond Mode
```
You: "Run ship-respond with auto-post for low-priority items"
→ Claude drafts responses
→ Low priority: Auto-posts
→ Medium/High priority: Shows for approval
```

### Voice Adjustment
```
You: "Make responses slightly more casual today"
You: "Be more direct with technical explanations"
```

### Platform Focus
```
You: "Only respond to Twitter interactions for now"
You: "Prioritize Reddit responses today"
```

## Output Format

### Standard Review Format
```markdown
# Ship Respond - Draft Review
**Generated:** [Timestamp]
**Interactions Processed:** 5
**Drafts Ready:** 4
**Flagged for Review:** 1

---

## ✅ Ready to Post (4)

### 1. Twitter: @jane_designer
**Priority:** Medium
**Type:** Reply
**Context:** Replied to your pain point tweet about finding technical help

**Their message:**
> "So relatable! I've been stuck for months trying to find the right person to build my app idea."

**My draft (187 chars):**
> I felt this so many times working with founders. The good news: you have more options now than ever.
>
> What's the app about? Sometimes talking it through helps clarify the path forward.

**Why this works:**
- Empathetic opening
- Encouraging tone
- Asks question to continue conversation
- Doesn't push CoShip unless she asks

**Action:** ✅ Post | ✏️ Edit | ❌ Skip

---

### 2. Reddit: u/tech_founder in r/startups
[...similar format...]

---

## ⚠️ Needs Your Review (1)

### 5. Twitter: @competitor_xyz
**Priority:** High
**Type:** Mention
**Context:** Comparing CoShip to their service

**Their message:**
> "@ship_coship How is this different from what we do at CompetitorXYZ? Seems like the same thing."

**My draft:**
> [FLAGGED: Competitor comparison]

**Why flagged:**
- Direct competitor comparison
- Public thread
- Needs careful positioning

**Suggested approaches:**
1. Focus on differentiation (AI + human vs AI-only)
2. Compliment their product, explain our focus
3. Take conversation to DMs

**Your input needed:** How do you want to position vs CompetitorXYZ?

---

**Next Steps:**
1. Review flagged item and provide guidance
2. Approve ready-to-post drafts (or edit)
3. I'll post approved responses and update Notion

Ready to proceed?
```

## Integration with Other Skills

### After ship-daily-check:
```
ship-daily-check → ship-respond
(Check platforms → Draft responses)
```

### Feeds ship-analytics:
```
Response times, engagement, sentiment tracked
```

### Informs ship-content:
```
Popular questions → Create tip posts
Recurring themes → Adjust content strategy
```

## Metrics Tracked

- Average response time (from check to post)
- Responses requiring escalation (%)
- Approval rate (drafts accepted vs edited)
- Engagement on responses (likes, replies)
- Sentiment (positive, neutral, negative)

---

**Version:** 1.0
**Last Updated:** February 2, 2026
**Status:** Ready to Use (requires SHIP_PERSONA.md)
