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

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Folder Structure
```bash
src/
│
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   │
│   ├── (public)
│   │   └── ...
│   │
│   ├── account/
│   │   └── page.tsx
│   │
│   ├── admin/                ✅ Admin Panel UI (protected)
│   │   ├── layout.tsx        ✅ Sidebar + Admin Shell
│   │   ├── page.tsx          ✅ Dashboard Overview
│   │   ├── products/
│   │   │   ├── page.tsx      ✅ Products Listing
│   │   │   ├── new/page.tsx  ✅ Create Product UI
│   │   │   └── [id]/page.tsx ✅ Edit Product UI
│   │   │
│   │   ├── orders/
│   │   │   └── page.tsx
│   │   ├── users/
│   │       └── page.tsx
│   │
│   ├── api/                  ✅ Backend API Endpoints
│   │   ├── auth/
│   │   │   └── [...nextauth]/route.ts ✅ Admin/User Auth
│   │   │
│   │   ├── products/
│   │   │   ├── route.ts     ✅ POST, GET (Create + GetAll)
│   │   │   └── [id]/route.ts✅ PUT, DELETE, GET
│   │   │
│   │   ├── users/
│   │   │   └── route.ts
│   │   ├── orders/
│   │   │   └── route.ts
│   │   └── payments/
│   │       └── route.ts
│
├── components/               ✅ UI elements
│
├── lib/
│   ├── db.ts                 ✅ Database connection
│   ├── auth.ts               ✅ Admin auth helpers
│   ├── utils.ts              ✅ Helpers
│   ├── razorpay.ts           ✅ Payment setup
│   └── models/
│       ├── Product.ts
│       ├── Order.ts
│       ├── User.ts
│       └── Category.ts
│
├── redux/                    ✅ If using Redux Toolkit
│   └── store.ts
│
└── services/                 ✅ API service calls

```

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
