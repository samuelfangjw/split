# split

split is a web app to keep track of group expenses on short travel trips.

In my time travelling overseas with friends I found it was a real hassle to keep track of group expenses accurately. Commercial solutions exist, but as a broke student who will only use this infrequently paying for such services isn't great value.

spit is built with the following considerations in mind:

- Convenience. It's designed as a web based app relying on shareable group links. No need to download an additional app or sign up for any accounts.
- Privacy focused. No personal data shared, password protection for peace of mind.
- Mobile first.
- Self-hostable on Vercel's free hobby tier plan.

<details>
  <summary>Screenshots</summary>
  <img src="docs/images/create.png" alt="create group page" width="400px"/>
  <img src="docs/images/overview.png" alt="overview page" width="400px"/>
  <img src="docs/images/add-expense.png" alt="add expense page" width="400px"/>
  <img src="docs/images/settle-debts.png" alt="settle debts page" width="400px"/>
  <img src="docs/images/settings.png" alt="settings page" width="400px"/>
</details>

## Setting up locally

1. Start the postgres container.

```bash
docker-compose up -d
```

2. Install dependencies.

```bash
npm ci
```

3. Create `.env` file in root of project with the following config.

```
POSTGRES_DATABASE="postgres"
POSTGRES_HOST="localhost:5432"
POSTGRES_PASSWORD="postgres"
POSTGRES_PRISMA_URL="postgres://postgres:postgres@localhost:5432/postgres"
POSTGRES_URL_NON_POOLING="postgresql://postgres:postgres@localhost:5432/postgres"
POSTGRES_USER="postgres"
PASERK_SECRET="k4.local.<key>"
```

Replace `<key>` with your secret key in base64, e.g. `k4.local.dZMqv8IrpKAfR8Hzg+twrXL8KNO57Pt7cFP5W0UyYyQ=`

4. Synchronise prisma schema with database schema.

```bash
npx prisma db push
```

5. Run the development server.

```bash
npm run dev
```

## Deploying on vercel

1. Deploy project on Vercel and set up Vercel storage (postgres), ensuring that the region the serverless functions are located in is close to the region the db is hosted.

2. Add environment variable `PASERK_SECRET`.

3. Initialize db schema using `prisma db push`.
