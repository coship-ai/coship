---
name: skill
description: Create a new MCP skill for the CoShip server. Supports free and pro tier skills.
argument-hint: "<name> [--pro]"
disable-model-invocation: true
allowed-tools: Write, Bash(mkdir *)
---

# Create New Skill

Add a new skill to the CoShip MCP server.

## Usage

- `/skill <name>` - Create a new free tier skill
- `/skill <name> --pro` - Create a new pro tier skill

## Instructions

### 1. Determine the tier
- Free skills go in `apps/mcp-server/skills/free/`
- Pro skills go in `apps/mcp-server/skills/pro/`

### 2. Create the skill directory and SKILL.md file

For a skill named `$ARGUMENTS[0]`, create:
```
apps/mcp-server/skills/<tier>/$ARGUMENTS[0]/SKILL.md
```

### 3. SKILL.md Template

Use this template for the skill file:

```markdown
# <Skill Title>

<One-line description of what this skill does.>

## Description

<Detailed explanation of the skill, including:>
- What problem it solves
- Key features
- How it helps founders

## Usage

<Explain how to use this skill with example prompts.>

## Example Prompts

- "<Example prompt 1>"
- "<Example prompt 2>"
- "<Example prompt 3>"

## Requirements

<For pro skills only:>
**Pro subscription required** - This skill requires an active Pro subscription.
```

### 4. Update the server (if needed)

If the skill needs custom logic beyond the SKILL.md resource, add a tool or resource handler in `apps/mcp-server/src/coship_mcp/server.py`.

## Existing Skills

### Free Tier
- `mvp-scope` - MVP scoping assistant
- `tech-stack` - Tech stack recommendations

### Pro Tier
- `code-review` - Code review assistant
- `deployment` - Deployment guidance
