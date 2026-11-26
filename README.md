This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Local PostgreSQL

Copy `.env.example` to `.env`. Use the same local development password for `POSTGRES_PASSWORD` and the password in `DATABASE_URL`. URL-encode the password in `DATABASE_URL` if it contains special characters. With Docker running, start the database:

```bash
docker compose up -d --wait postgres
```

The development database is `typixel`, with user `typixel`, on `127.0.0.1:5432`.

To verify the connection from Prisma, run `npm run db:check`. It generates Prisma Client and runs `SELECT 1` against `DATABASE_URL`.

## Local Google sign-in

1. With PostgreSQL running, apply the checked-in migrations to create the
   authentication tables:

   ```bash
   npx prisma migrate deploy
   ```

2. Generate a random secret and copy the output into `BETTER_AUTH_SECRET` in
   your local `.env`. Keep that value out of version control.

   ```bash
   node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
   ```

3. Create a **Web application** OAuth client in Google Cloud and add
   `http://localhost:3000/api/auth/callback/google` to its authorized redirect URIs.
   Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `.env`. Match
   `BETTER_AUTH_URL` to the origin you use to open Typixel, including the port.
4. Start or restart the development server with `npm run dev` and select
   **Sign in** in the studio header.

## Local Cloudflare R2

1. Create a private R2 bucket in Cloudflare. Keep the public development URL
   and public custom domains disabled.
2. Create an R2 token with **Object Read & Write** access scoped to that
   bucket. Set the bucket name and its S3 API endpoint in `R2_BUCKET_NAME` and
   `R2_ENDPOINT` in your local `.env`. The default endpoint looks like
   `https://<account-id>.r2.cloudflarestorage.com`.
   Set the token's keys in `R2_ACCESS_KEY_ID` and `R2_SECRET_ACCESS_KEY`.
3. Under the bucket's **Settings → CORS Policy**, allow direct uploads from
   your local app origin:

   ```json
   [
     {
       "AllowedOrigins": ["http://localhost:3000"],
       "AllowedMethods": ["PUT"],
       "AllowedHeaders": ["Content-Type"]
     }
   ]
   ```

   Use the exact origin you open in your browser, including the port.
4. Restart the development server after changing `.env`.

The server signs upload URLs for a single object key and content type. The
browser sends the file to that URL with `PUT` and the returned `Content-Type`
header. Upload URLs expire after 15 minutes.

[R2 token setup](https://developers.cloudflare.com/r2/api/tokens/) ·
[R2 CORS configuration](https://developers.cloudflare.com/r2/buckets/cors/)

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
