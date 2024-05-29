# Coolection

**Coolection** is an open-source bookmarking tool that allows you to save and organize your favorite links. Coolection is designed to be single purpose and focused on speed and simplicity. No ads. No tracking. No distractions.

https://github.com/lovincyrus/coolection/assets/1021101/285f1364-ef41-4d8f-b608-2e6c684f7a43

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

# Push to sync the schema
pnpm db:push

# Seed the database
pnpm db:seed
```

When this is complete, you have a local pg instance running on `localhost:5432` with the database `coolection`.

If you want to stop the database, you can run the following command:

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

If you want to self-host the database or use a different provider (e.g., [Supabase](https://supabase.com/database), [Neon](https://neon.tech), [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres), [Heroku](https://elements.heroku.com/addons/heroku-postgresql)), you can update the `DATABASE_URL` to point to your database.

### Clerk

This project uses Clerk for authentication. To get started, you need to create a Clerk account and set up a new application. Once you have your application ID and API key, you can create a `.env` file in the root of the project and add the following:

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
WEBHOOK_SECRET=
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
```

You need to set up webhook https://clerk.com/docs/integrations/webhooks/sync-data locally if you wish to sync user creation from Clerk to your database.

<br>

<sup>
All code is licensed under the <a href="LICENSE">MIT license</a>.
</sup>
