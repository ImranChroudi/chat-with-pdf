# Chat with PDF

Turn any PDF into a conversation. Upload a contract, a research paper, or a
manual, ask questions in plain language, and get answers with the page they
came from.

## Tech stack

| Concern            | Tech                                                             |
| ------------------ | ---------------------------------------------------------------- |
| Framework          | [Next.js 16](https://nextjs.org) (App Router, Turbopack)         |
| UI                 | Tailwind CSS v4, shadcn/ui, daisyUI, Framer Motion, lucide icons |
| Auth               | [Clerk](https://clerk.com)                                       |
| File storage       | [Cloudinary](https://cloudinary.com)                             |
| Database           | Firebase Firestore (Firestore Admin SDK on the server)           |
| Vector store       | Pinecone                                                         |
| LLM + embeddings   | OpenAI via LangChain (`gpt-4.1-mini`, `text-embedding-3-small`)  |
| Billing            | Stripe (Checkout, Customer Portal, webhooks)                     |

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

Copy `.env` (or create one from the keys below). **Never commit real keys.**

```bash
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Cloudinary (uploads are stored under the chat-with-pdf/<userId>/<fileId> folder)
CLOUDINARY_URL=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# OpenAI (chat model + embeddings)
OPENAI_API_KEY=

# Pinecone
PINECONE_API_KEY=

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_API_KEY=
STRIPE_WEBHOOK_SECRET=
```

Firebase is configured from `firebase.ts` (client) and `service_key.json`
(admin / server). The index name used by Pinecone is `newindex`
(`lib/langChain.ts`).

## How it works

### 1. Upload → embeddings

1. `components/FileUploader.tsx` POSTs the PDF to `app/api/upload/route.ts`,
   which streams it up to Cloudinary (folder `chat-with-pdf/<userId>/<fileId>`)
   and returns the `secure_url` + `public_id`.
2. `hooks/useUpload.ts` writes the file metadata (`name`, `url`, `publicId`,
   `type`, `size`, `createdAt`) to Firestore at
   `users/<userId>/files/<fileId>`.
3. The `generateEmbedding` server action (`actions/generateEmbading.ts`)
   extracts the PDF text with `unpdf`, splits it into chunks
   (`RecursiveCharacterTextSplitter`), and stores the embeddings in Pinecone
   under the namespace `<fileId>`.

### 2. Chat

1. `components/ChatComponent.tsx` reads `users/<userId>/files/<fileId>/chat`
   and streams new messages to `app/api/chat/route.ts`.
2. The route calls `actions/askQuestion.ts`, which enforces the free/pro
   question limits, saves the human message, then runs
   `generateLangChainCompletion` (`lib/langChain.ts`) — retrieval over the
   Pinecone namespace + a history-aware QA chain.
3. The AI reply is saved to the same `chat` subcollection and returned to the
   client.

### 3. Document list & delete

- `app/dashboard/documents/page.tsx` is a server component that renders the
  client-side `components/DocumentList.tsx`, which subscribes to the user's
  `files` collection for realtime updates.
- Each card has a delete button that calls the `deleteDocument` server action
  (`actions/deleteDocument.ts`). It removes the Cloudinary asset, deletes the
  Pinecone namespace, and recursively deletes the Firestore doc (including its
  `chat` subcollection).

### 4. Subscriptions

- `app/dashboard/upgrade/page.tsx` renders the two plans (Free / Pro).
- Upgrading creates a Stripe Checkout session
  (`actions/createCheckoutSession.ts`); `UpgradeButton`/`useSubscription`
  surface account state and manage existing plans via the Stripe Customer
  Portal (`actions/createStripePortal.ts`).
- `app/webhook` receives Stripe events to mark `hasActiveMembership` on the
  user's Firestore doc.
- Free / Pro limits live in `hooks/useSubscription.ts` and
  `actions/askQuestion.ts`.

## Project structure

```
actions/        Server actions (chat, upload, stripe, embeddings, delete)
app/            App Router pages, API routes, webhook, global styles
components/     UI components (chat, PDF viewer, uploader, document list)
hooks/          Client hooks (upload, subscription)
lib/            Cloudinary, Pinecone, LangChain, Stripe clients
```

## Scripts

```bash
npm run dev      # development server
npm run build    # production build (type-checks too)
npm run start    # run the production build
npm run lint     # eslint
```

## Notes

- Free plan: 5 documents, 2 questions/day. Pro: unlimited, 20 questions/day,
  advanced model — adjust in `hooks/useSubscription.ts` and
  `actions/askQuestion.ts`.
- The PDF viewer (`components/PDFView.tsx`) runs on `react-pdf`.
