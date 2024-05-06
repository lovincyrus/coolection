# Coolection

## Getting Started

First, run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Development

```bash
# Run the development server
pnpm dev
```

## Database

```bash
# Start the database
pnpm db:up

# Stop the database
pnpm db:down

# Force push schema
pnpm db:push

# Seed the database
pnpm db:seed

# Connect to the database using psql
psql -h localhost -U root -d coolection

DATABASE_URL="postgresql://root:password@localhost:5432/coolection"
```

## Data modeling

Run `prisma migrate dev` to create and apply a migration or run `prisma db push` to apply the changes directly (in both cases Prisma Client is automatically generated)
