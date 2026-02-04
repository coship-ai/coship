# Skill: ship-content

## Purpose
AI-powered content generation that creates daily posts across Twitter, Reddit, and Product Hunt following Ship's content pillar strategy and authentic voice.

## Trigger Phrases
- "Run ship-content"
- "Generate this week's content"
- "Create posts for next 3 days"
- "Write a [pain point/tip/build-in-public] post"

## What This Skill Does

### 1. Load Strategy Context
**Content Pillars (from SHIP_PERSONA.md):**
- 30% Build-in-Public Updates
- 30% Non-Technical Founder Pain Points
- 25% Quick Tips & Insights
- 15% Celebrating Founder Wins

**Voice & Tone:**
- Helpful & approachable
- Clear over clever
- Encouraging but honest
- Avoids hype/buzzwords

**Platform Guidelines:**
- Twitter: Punchy, 280 chars, daily
- Reddit: Detailed, helpful, 2-3x/week
- Product Hunt: Pre-launch prep, engaging

### 2. Generate Content Ideas
Based on:
- Current week's focus (e.g., Product Hunt prep)
- Recent interactions (questions from ship-daily-check)
- Trending topics in target communities
- Content calendar gaps
- Balance across pillars

### 3. Write Posts
For each piece of content:
- Draft in Ship's voice
- Ensure alignment with pillar strategy
- Optimize for platform (length, format, hashtags)
- Include call-to-action when appropriate
- Add engagement hooks

### 4. Save to Notion Content Calendar
```sql
INSERT INTO "collection://12e73c27-ebb5-4eac-9b6a-bbb4d6ff018a"
  ("Post Title", Platform, "Content Pillar", Status, "date:Scheduled Date:start", Content, Notes)
VALUES
  (...);
```

### 5. Present Content Plan
Show human the generated content with context:
- What pillar it serves
- Why it's relevant now
- Suggested posting time
- Expected engagement type

## Content Pillar Details

### Pillar 1: Build-in-Public Updates (30%)
**Purpose:** Share CoShip journey transparently, build trust, show progress

**Types:**
- Feature launches
- Milestone celebrations
- Challenges being worked through
- Learnings from customer conversations
- Behind-the-scenes process

**Examples:**
```
Shipped a new feature today: one-click Supabase integration.

Why it matters: Most MVPs need a database. Setting it up manually takes hours and is error-prone.

Now founders can get auth + database + storage in 60 seconds. That's the kind of complexity we should hide.
```

```
Honest moment: Had a call with a founder yesterday who said "I almost gave up on my idea because I couldn't find technical help."

That hit hard. It's exactly why we're building CoShip.

If you've felt this, you're not alone. And you shouldn't have to.
```

**Cadence:** 2-3x per week

---

### Pillar 2: Non-Technical Founder Pain Points (30%)
**Purpose:** Speak directly to target audience struggles, show empathy, position CoShip as solution

**Types:**
- Technical co-founder challenges
- Agency disappointments
- Learning curve frustrations
- Impostor syndrome around tech
- Validation without building

**Examples:**
```
The hardest part of having a startup idea without technical skills isn't the building.

It's not knowing where to start.

Do I hire an agency? Find a co-founder? Learn to code? Use no-code?

Each path has its own pitfalls, and none of them feel straightforward.

You're not overthinking it. The path IS confusing.
```

```
Things that shouldn't require a CS degree:
- Turning your validated idea into a working product
- Understanding if your idea is technically feasible
- Getting a realistic timeline and budget estimate
- Making changes to your MVP without starting over

The tools exist to make this accessible. We should use them.
```

**Cadence:** 2-3x per week

---

### Pillar 3: Quick Tips & Insights (25%)
**Purpose:** Provide immediate value, establish expertise, help even if they don't use CoShip

**Types:**
- MVP scoping advice
- Validation techniques
- Technical explanations simplified
- Founder mental models
- Red flags to watch for

**Examples:**
```
Before you build anything, answer these 3 questions:

1. Who is this for? (Not "everyone"—be specific)
2. What's the ONE thing it must do well?
3. How will you know if it's working?

If you can't answer these clearly, you're not ready to build yet. And that's okay.
```

```
Your MVP should do ONE thing well.

Not three things okay.
Not five things eventually.
One thing well.

Here's how to find that one thing: What's the smallest version that solves the core problem?

Everything else is v2.
```

**Cadence:** 2x per week

---

### Pillar 4: Celebrating Founder Wins (15%)
**Purpose:** Build community, amplify others, show success is possible

**Types:**
- Retweeting/sharing launches
- Commenting on founder milestones
- Celebrating "small" wins
- Encouraging those shipping

**Examples:**
```
Love seeing @founder_jane launch today!

The journey from idea to shipped product is REAL. Most people never get past the idea phase.

If you launched something this week—no matter how small—you're already ahead. Keep going. 🚢
```

```
Shoutout to everyone who launched something this week.

Your v1 is better than someone else's v-nothing.

Shipping is a skill. You're building it.
```

**Cadence:** 1-2x per week (opportunistic based on community activity)

## Step-by-Step Execution

### Step 1: Analyze Context
```javascript
1. Check current date and week
2. Review recent posts (avoid repetition)
3. Check Content Calendar for gaps
4. Review recent interactions for trending topics
5. Consider upcoming events (e.g., Product Hunt launch)
```

### Step 2: Generate Content Plan
```javascript
// For a week of content (7 posts)
contentPlan = {
  Monday: {
    pillar: "Pain Point",
    topic: "Technical co-founder equity split concerns",
    platform: "Twitter",
    time: "9am EST"
  },
  Tuesday: {
    pillar: "Build-in-Public",
    topic: "CoShip feature: AI code review process",
    platform: "Twitter",
    time: "12pm EST"
  },
  Wednesday: {
    pillar: "Quick Tip",
    topic: "How to scope your MVP in 30 minutes",
    platform: "Twitter + Reddit r/startups",
    time: "9am EST"
  },
  // etc...
}
```

### Step 3: Write Each Post
```javascript
for each item in contentPlan {
  // Load pillar guidelines
  guidelines = getPillarGuidelines(item.pillar)

  // Generate post
  draft = generatePost(
    pillar: item.pillar,
    topic: item.topic,
    platform: item.platform,
    voice: SHIP_PERSONA,
    guidelines: guidelines
  )

  // Optimize for platform
  if (item.platform == "Twitter") {
    draft = optimizeForTwitter(draft) // 280 chars, line breaks
  } else if (item.platform == "Reddit") {
    draft = optimizeForReddit(draft) // Detailed, markdown formatted
  }

  // Save to Notion
  saveToContentCalendar(draft, item)
}
```

### Step 4: Present Content Plan
```javascript
1. Show all generated posts
2. Group by day/platform
3. Indicate pillar and purpose
4. Request approval or edits
```

### Step 5: Schedule Approved Content
```javascript
for each approved post {
  // Update Notion status
  updateNotion(post.id, {
    status: 'Ready to Post',
    scheduledDate: post.scheduledDate
  })
}
```

## Platform-Specific Formatting

### Twitter Posts
**Format:**
- 280 characters max (aim for 200-260 for RTs)
- Use line breaks for readability
- Occasional emoji (not every post)
- Hashtags: Max 1-2, only if organic

**Structure:**
```
Hook (attention grabber)

Body (main point, 2-3 short sentences)

Punchline or CTA (call to action, question, or mic drop moment)
```

**Example:**
```
The real MVP isn't the product.

It's the founder who keeps going despite the learning curve, the false starts, and the "helpful" advice that contradicts itself.

Building is hard. Persistence is the feature.
```

### Reddit Posts
**Format:**
- Title: Specific and descriptive
- Body: 3-5 paragraphs with formatting
- Use markdown: bold, bullets, sections
- Always provide value first
- Mention CoShip last if relevant

**Structure:**
```
## Title (Clear, specific, intriguing)

Hook paragraph - why this matters

Body paragraphs - detailed advice/insights
- Use bullet points
- Examples
- Actionable steps

Conclusion - encouragement, offer to help

[Only if relevant: Brief CoShip mention]
```

**Example:**
```
Title: "Things I wish I knew before looking for a technical co-founder"

I've worked with dozens of non-technical founders over 15 years as an engineer and technical leader. Here are the things I wish more founders knew before starting the search for a technical co-founder:

**1. Equity isn't the only cost**
[... detailed explanation ...]

**2. "Technical co-founder" might not be what you need**
[... detailed explanation ...]

**3. The timing matters more than you think**
[... detailed explanation ...]

If you're in this position now, happy to answer questions. The path forward is clearer than it seems.

[Edit: Getting DMs about alternatives to technical co-founders. I'm building something in this space called CoShip if you want to check it out, but honestly just happy to help founders figure out their best path forward.]
```

### Product Hunt Comments
**Format:**
- Professional but friendly
- Show expertise
- Encourage discussion
- Support other makers

**Example:**
```
This is a really smart approach to [problem]. I especially like how you've [specific feature/decision].

One question: How are you handling [relevant technical consideration]? I've seen this be tricky for similar products.

Great work on shipping! 🚀
```

## Quality Checks

Before saving to Content Calendar:

✅ **Voice Consistency:**
- Sounds like Ship
- Uses Ship's vocabulary ("build", "ship", "straightforward" vs "disrupt", "crush")
- Maintains helpful & approachable tone

✅ **Pillar Alignment:**
- Clearly serves one of the four content pillars
- Maintains overall pillar distribution (30/30/25/15)

✅ **Value-First:**
- Provides value even if reader doesn't use CoShip
- Not overly promotional
- Actually helpful/insightful

✅ **Engagement Hook:**
- Has a clear hook (intriguing, relatable, or provocative)
- Invites response (question, discussion, story)
- Appropriate call-to-action

✅ **Platform Optimization:**
- Correct length for platform
- Proper formatting
- Timing appropriate for audience

✅ **Factual Accuracy:**
- Claims about CoShip are accurate
- Technical explanations are sound
- No promises that can't be kept

## Content Ideas Generator

### Pain Point Sources:
- Recent interactions (ship-daily-check findings)
- Common questions in r/startups, r/Entrepreneur
- Founder stories from network
- Personal experience working with founders

### Build-in-Public Sources:
- Recent CoShip development
- Customer feedback/wins
- Challenges being solved
- Milestones reached

### Tips Sources:
- Frequently asked questions
- Common mistakes observed
- Simple frameworks that help founders
- Technical concepts explained simply

### Celebration Sources:
- Community launches (Twitter, Product Hunt)
- Founder milestones shared publicly
- "Small wins" that deserve recognition

## Configuration Options

### Content Length
```
You: "Generate a week of content"
You: "Generate next 3 days of posts"
You: "Create one pain point post for Twitter"
```

### Platform Focus
```
You: "Focus on Twitter content this week"
You: "Generate Reddit posts for r/startups"
```

### Thematic Focus
```
You: "Theme this week around Product Hunt launch"
You: "Focus on MVP scoping advice this week"
```

### Voice Adjustment
```
You: "Make content slightly more technical this week"
You: "Keep it extra approachable - target total beginners"
```

## Output Format

### Standard Content Plan
```markdown
# Ship Content Plan
**Week of:** February 5-11, 2026
**Generated:** [Timestamp]
**Theme:** Product Hunt Launch Prep

---

## Monday, February 5 - 9am EST
**Platform:** Twitter
**Pillar:** Pain Point (30%)
**Content:**

The hardest part of having a startup idea without technical skills isn't the building.

It's not knowing where to start.

Do I hire an agency? Find a co-founder? Learn to code? Use no-code?

Each path has its own pitfalls. You're not overthinking it—the path IS confusing.

**Why this works:**
- Addresses common founder frustration
- Validates their experience
- Doesn't push solution
- Invites empathy/engagement

**Expected engagement:** Replies from founders sharing experiences
**Status:** Draft → Review → Ready to Post

---

## Tuesday, February 6 - 12pm EST
**Platform:** Twitter
**Pillar:** Build-in-Public (30%)
**Content:**

Shipped our Supabase one-click integration today.

Founders told us: "Setting up auth and database takes hours and I'm never sure I did it right."

Now it's 60 seconds and just works.

This is the kind of technical complexity that shouldn't be a founder's problem.

**Why this works:**
- Shows progress
- Customer-problem-driven
- Humble tone (not "crushing it")
- Demonstrates value

**Expected engagement:** Questions about the feature, interest in CoShip
**Status:** Draft → Review → Ready to Post

---

## Wednesday, February 7 - 9am EST
**Platform:** Twitter + Reddit (r/startups)
**Pillar:** Quick Tip (25%)

**Twitter Version (262 chars):**

Before you build anything, answer these 3 questions:

1. Who is this for? (Not "everyone"—be specific)
2. What's the ONE thing it must do well?
3. How will you know if it's working?

If you can't answer clearly, you're not ready to build. And that's okay.

**Reddit Version:**
[Longer, detailed post with examples for each question]

**Why this works:**
- Actionable framework
- Saves founders time/money
- Positions Ship as knowledgeable
- Value-first, no pitch

**Expected engagement:** Saves/bookmarks, founders asking for feedback
**Status:** Draft → Review → Ready to Post

---

[... continues for full week ...]

---

## Content Distribution
- **Build-in-Public:** 2 posts (29%)
- **Pain Points:** 2 posts (29%)
- **Quick Tips:** 2 posts (29%)
- **Founder Wins:** 1 post (14%)
- **Total:** 7 posts

**Balance:** ✅ Within target ranges

---

## Alignment with Current Goals
🎯 **Product Hunt Prep:** Yes
- Build-in-Public posts create anticipation
- Tips establish authority
- Pain Points attract target audience

🎯 **Audience Growth:** Yes
- Mix of relatable and valuable content
- Engagement hooks in every post

🎯 **Brand Positioning:** Yes
- Helpful, not salesy
- Expertise without gatekeeping

---

**Next Steps:**
1. Review each post (approve/edit)
2. I'll add approved posts to Notion Content Calendar
3. Set Status to "Ready to Post" with scheduled dates
4. You can post manually or I can post via browser automation

Ready to review?
```

## Integration with Other Skills

### Informed by ship-daily-check:
```
Interactions reveal:
- Common questions → Tip posts
- Pain points mentioned → Pain point posts
- Success stories → Celebration posts
```

### Feeds ship-analytics:
```
Content performance tracked:
- Engagement by pillar
- Best performing topics
- Optimal posting times
```

### Supports ship-respond:
```
Content drives interactions:
- Questions from posts → ship-respond handles
- Discussions → engagement opportunities
```

## Metrics Tracked

- Posts by pillar (distribution %)
- Engagement per post (likes, comments, shares)
- Top performing posts by pillar
- Content → interaction rate
- Content → website traffic

---

**Version:** 1.0
**Last Updated:** February 2, 2026
**Status:** Ready to Use
