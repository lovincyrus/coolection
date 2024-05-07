# Coolection

**Coolection** is an open-source bookmarking tool that allows you to save and organize your favorite links. Coolection is designed to be single purpose and focused on speed and simplicity. No ads. No tracking. No distractions.

## Motivation

The internet is great, but internet resources can be short-lived. The Internet Archive created the Wayback Machine to archive the internet, while GitHub preserves codebases in the Arctic Code Vault. But what about the links you find useful? They are scattered across your browser bookmarks, notes, messages, and emails. All you need to do is _remember_ to save them.

## Development setup

To run this application, you need to have `Docker`, `Node.js`, and `pnpm` installed on your machine.

First, run the development server and open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

```bash
# Install dependencies
pnpm install

# Run the development server
pnpm dev
```

Next, spin up the local database, apply the schema, and seed the database:

```bash
# Start the database
pnpm db:up

# Force push schema
pnpm db:push

# Seed the database
pnpm db:seed
```

When this is complete, you have a local pg instance running on `localhost:5432` with the database `coolection`.

While the local database is running, you can run the following commands:

```bash
# Stop the database
pnpm db:down
```

## Configuration

### Database

This project uses Prisma as an ORM. To get started, you need to create a `.env` file in the root of the project and add the following:

```bash
DATABASE_URL="postgresql://root:password@localhost:5432/coolection"
```

If you want to self-host the database or use a different provider (e.g., [Supabase](https://supabase.com/database), [Neon](https://neon.tech)), you can update the `DATABASE_URL` to point to your database.

### Clerk

This project uses Clerk for authentication. To get started, you need to create a Clerk account and set up a new application. Once you have your application ID and API key, you can create a `.env.local` file in the root of the project and add the following:

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=
NEXT_PUBLIC_CLERK_SIGN_UP_URL=
```

## Data modeling

Run `prisma migrate dev` to create and apply a migration or run `prisma db push` to apply the changes directly (in both cases Prisma Client is automatically generated)
