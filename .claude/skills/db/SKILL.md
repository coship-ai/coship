---
name: db
description: Manage the Supabase database for CoShip. Push migrations, reset database, or create new migrations.
argument-hint: "[push|reset|migrate <name>|status]"
disable-model-invocation: true
allowed-tools: Bash(pnpm *, supabase *)
---

# Database Operations

Manage the Supabase database for CoShip.

## Usage

- `/db push` - Push migrations to the database
- `/db reset` - Reset the database (destructive)
- `/db migrate <name>` - Create a new migration file
- `/db status` - Check migration status

## Instructions

Based on `$ARGUMENTS`, run the appropriate database command:

### Push Migrations
Apply pending migrations to the database:
```bash
pnpm db:push
```

### Reset Database (Destructive)
Reset the database to a clean state. Warn the user this is destructive:
```bash
pnpm db:reset
```

### Create New Migration
Create a new migration file. The user should provide a descriptive name:
```bash
supabase migration new $ARGUMENTS[1]
```

### Check Status
Show the current migration status:
```bash
supabase migration list
```

## Migration Files

Migrations are stored in `supabase/migrations/`. Current migrations:
- `20260204_profiles.sql` - User profiles with subscription tiers

## Schema Overview

The profiles table includes:
- `subscription_tier` (free/pro) - Synced to JWT app_metadata via trigger
- `stripe_customer_id` / `stripe_subscription_id` - For payment integration
- Automatic profile creation on user signup
