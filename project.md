# Alpha Art & Events - Project Documentation

## 📋 Project Overview

**Alpha Art & Events** is a full-stack e-commerce platform designed for renting and selling event decoration products (balloons, props, lighting, structures, etc.). It provides a seamless shopping experience for customers and a comprehensive admin panel for business management.

**Live Domain:** alphaartandevents.com  
**Repository:** Lalitmehta045/alpha.event (GitHub)  
**Deployed On:** Vercel  

---

## 🏗️ Tech Stack

### Frontend
- **Framework:** Next.js 16.1.1 (React 19.2.3, TypeScript)
- **UI Components:** Radix UI + TailwindCSS
- **State Management:** Redux Toolkit
- **Animations:** Framer Motion
- **Forms:** React Hook Form + Zod validation
- **HTTP Client:** Axios
- **Styling:** TailwindCSS + PostCSS

### Backend
- **Runtime:** Node.js (Next.js API Routes)
- **Database:** MongoDB (Mongoose ODM)
- **Authentication:** NextAuth 4.24.13 (Google OAuth, JWT)
- **Payment Gateway:** Razorpay
- **Email Service:** Nodemailer
- **SMS Service:** Twilio
- **Image Storage:** AWS S3 (with presigned URLs)
- **Image Upload:** Cloudinary

### Authentication & Security
- JWT tokens (Access & Refresh tokens)
- NextAuth for OAuth (Google login)
- Bcryptjs for password hashing
- Email OTP verification
- Protected routes with guardian middleware

---

## 🎯 Core Features

### 1. **Product Catalog**
- Browse products by categories and subcategories
- Product detail pages with multiple images
- Price display in INR with discount calculations
- Stock tracking
- "Most Popular Products" section
- Similar products recommendations

**Key API Endpoints:**
```
GET /api/product                    - Get all products
GET /api/product/:id                - Get product details
GET /api/product/similar/:productId - Get similar products
GET /api/product/most-popular       - Get trending products
GET /api/category                   - Get all categories
GET /api/sub-category               - Get all subcategories
```

### 2. **Shopping Cart**
- Add/remove products from cart
- Cart persistence (stored in Redux state)
- Real-time cart updates
- Mobile-responsive cart bar
- Cart item quantity management

**Key Operations:**
```
- Add items to cart
- Remove items from cart
- Update item quantity
- Clear cart
- Calculate total price with discounts
```

### 3. **Checkout & Orders**
- Address management (save multiple addresses)
- Order placement with COD (Cash on Delivery)
- GPS location detection for delivery
- Order tracking with status updates
- Invoice generation

**Order Status:** PENDING → PROCESSING → DELIVERED/CANCELLED

**Key API Endpoints:**
```
POST /api/orders              - Place order
GET /api/orders               - Get user orders
POST /api/address             - Save address
GET /api/address              - Get saved addresses
PUT /api/address/:addressId   - Update address
DELETE /api/address/:id       - Delete address
```

### 4. **User Authentication**
- **Email/Password Registration:** OTP-based verification
- **Google OAuth:** One-click login
- **Phone Number:** Required during signup for SMS notifications
- **Profile Management:** Complete user profile with contact info
- **Session Management:** NextAuth handles token expiry

**Auth Flow:**
```
1. User registers/signs in
2. Email OTP verification (Nodemailer)
3. Phone number verification (Twilio SMS)
4. JWT token generation (Access + Refresh)
5. Protected routes enforced
```

**Key Files:**
- `src/lib/auth.ts` - NextAuth configuration
- `src/app/api/auth/[...nextauth]/route.ts` - Auth handler
- `src/actions/auth.ts` - Auth server actions

### 5. **Admin Panel**
- **Dashboard:** Overview of recent orders and activities
- **Product Management:** CRUD operations for products
- **Category Management:** Manage categories and subcategories
- **Order Management:** View and update order status
- **User Management:** View customer details
- **Product Upload:** Bulk upload with image management (AWS S3)

**Protected Routes:**
```
/admin                    - Admin dashboard
/admin/products           - Manage products
/admin/category           - Manage categories
/admin/sub-category       - Manage subcategories
/admin/orders             - Manage orders
/admin/users              - View users
/admin/all-admins         - Super admin only
```

### 6. **User Profile & Account**
- View/edit profile information
- Saved addresses management
- Purchase history with invoice download
- Order tracking
- Account settings
- Logout

---

## 📁 Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (public)/                 # Public routes
│   │   ├── home/                 # Homepage
│   │   ├── product/              # Product listing & details
│   │   ├── category/             # Category browsing
│   │   ├── cart/                 # Shopping cart
│   │   ├── checkout/             # Order placement
│   │   ├── orders/               # Checkout/address management
│   │   ├── purchase-history/     # Order history
│   │   ├── profile/              # User profile
│   │   ├── settings/             # Account settings
│   │   └── [other routes]/       # About, Contact, Blog, etc.
│   ├── admin/                    # Admin panel (protected)
│   │   ├── products/             # Product CRUD
│   │   ├── category/             # Category management
│   │   ├── orders/               # Order management
│   │   └── users/                # User list
│   ├── api/                      # Backend API routes
│   │   ├── auth/                 # Authentication
│   │   ├── product/              # Product operations
│   │   ├── cart/                 # Cart management
│   │   ├── orders/               # Order operations
│   │   ├── address/              # Address management
│   │   ├── category/             # Category operations
│   │   ├── admin/                # Admin operations
│   │   └── [other endpoints]/    # Other APIs
│   └── layout.tsx                # Root layout
│
├── components/
│   ├── common/                   # Reusable components
│   │   ├── cart/                 # Cart-related components
│   │   ├── address/              # Address dialogs
│   │   ├── profile/              # Profile components
│   │   ├── ctaButton/            # Call-to-action buttons
│   │   └── [others]/
│   ├── core/                     # Core feature components
│   │   ├── hero/                 # Hero section
│   │   ├── product/              # Product cards
│   │   ├── category/             # Category components
│   │   ├── featured/             # Featured products
│   │   └── [others]/
│   ├── admin/                    # Admin-specific components
│   ├── ui/                       # Shadcn/Radix UI components
│   └── [others]/
│
├── @types/                       # TypeScript type definitions
│   ├── product.ts
│   ├── cart.ts
│   ├── order.ts
│   ├── address.ts
│   ├── user.ts
│   └── [others]/
│
├── lib/
│   ├── db.ts                     # MongoDB connection
│   ├── auth.ts                   # Authentication logic
│   ├── models/                   # Mongoose schemas
│   │   ├── Product.model.ts
│   │   ├── Category.model.ts
│   │   ├── User.model.ts
│   │   ├── Order.model.ts
│   │   ├── Cart.model.ts
│   │   └── Address.model.ts
│   ├── mailSender.ts             # Email service
│   ├── twilio.ts                 # SMS service
│   ├── razorpay.ts               # Payment integration
│   ├── verifyUser.ts             # User verification
│   ├── adminGuard.ts             # Admin auth middleware
│   └── utils/                    # Helper functions
│
├── services/
│   ├── api_endpoints.ts          # Centralized API URLs
│   ├── apiconnector.ts           # Axios wrapper
│   └── operations/               # API operation functions
│       ├── product.ts            # Product API calls
│       ├── cart.ts               # Cart API calls
│       ├── orders.ts             # Order API calls
│       ├── address.ts            # Address API calls
│       └── [others]/
│
├── redux/
│   ├── store/                    # Redux store setup
│   ├── slices/                   # Redux slices
│   │   ├── product.ts            # Product state
│   │   ├── cart.ts               # Cart state
│   │   ├── auth.ts               # Auth state
│   │   ├── order.ts              # Order state
│   │   └── [others]/
│   └── provider.tsx              # Redux provider
│
├── utils/
│   ├── constant.ts               # App constants
│   ├── DisplayPriceInRupees.ts   # Price formatting
│   ├── PriceWithDiscount.ts      # Discount calculator
│   ├── formatTimer.ts            # Time formatting
│   ├── maskedEmail.ts            # Email masking for OTP
│   └── [others]/
│
├── actions/                      # Server actions
│   └── auth.ts                   # Authentication actions
│
├── context/                      # React context (if any)
└── hooks/                        # Custom React hooks
    └── index.ts
```

---

## 🔑 Key Database Models

### 1. **User Model**
```typescript
{
  _id: ObjectId
  firstName: string
  lastName: string
  email: string (unique)
  password: string (hashed)
  phoneNumber: string
  role: 'user' | 'admin' | 'super-admin'
  isEmailVerified: boolean
  isPhoneVerified: boolean
  profileImage?: string
  addresses: [AddressId]
  createdAt: Date
  updatedAt: Date
}
```

### 2. **Product Model**
```typescript
{
  _id: ObjectId
  name: string
  image: [string]  // URLs from AWS S3
  category: [CategoryId]
  subCategory: [SubCategoryId]
  price: number
  discount?: number
  unit: string
  stock: number
  description?: string
  more_details?: Record<string, string>
  publish: boolean
  createdAt: Date
  updatedAt: Date
}
```

### 3. **Order Model**
```typescript
{
  _id: ObjectId
  userId: UserId
  items: [
    {
      productId: ProductId
      quantity: number
      price: number
      discount?: number
    }
  ]
  totalPrice: number
  totalQuantity: number
  deliveryAddress: AddressId
  deliveryDate: Date
  status: 'PENDING' | 'PROCESSING' | 'DELIVERED' | 'CANCELLED'
  paymentMethod: 'COD' | 'RAZORPAY'
  paymentStatus: 'PENDING' | 'COMPLETED' | 'FAILED'
  invoiceUrl?: string
  createdAt: Date
  updatedAt: Date
}
```

### 4. **Cart Model**
```typescript
{
  _id: ObjectId
  userId: UserId
  items: [
    {
      productId: ProductId
      quantity: number
    }
  ]
  totalQuantity: number
  totalPrice: number
  updatedAt: Date
}
```

### 5. **Address Model**
```typescript
{
  _id: ObjectId
  userId: UserId
  fullName: string
  phoneNumber: string
  street: string
  city: string
  state: string
  pincode: string
  country: string
  isDefault: boolean
  createdAt: Date
  updatedAt: Date
}
```

---

## 🔄 Data Flow Architecture

### **Customer Purchase Flow:**
```
1. Browse Homepage
   ↓
2. Browse Categories/Products
   ↓
3. Add to Cart (Redux state)
   ↓
4. View Cart
   ↓
5. Checkout (Login required)
   ↓
6. Select/Add Delivery Address
   ↓
7. Select Delivery Date
   ↓
8. Place Order (COD)
   ↓
9. Order Confirmation Email
   ↓
10. View Purchase History
```

### **Admin Management Flow:**
```
1. Login to Admin Panel
   ↓
2. Dashboard (Recent orders overview)
   ↓
3. Product Management
   - Upload new products (AWS S3)
   - Edit product details
   - Delete products
   ↓
4. Category Management
   - Create/edit categories
   - Manage subcategories
   ↓
5. Order Management
   - View orders
   - Update order status
   - Generate invoices
   ↓
6. User Management
   - View customer list
   - View customer details
```

---

## 🔐 Security Features

1. **Authentication:**
   - JWT-based authentication (Access + Refresh tokens)
   - NextAuth for session management
   - Password hashing with bcryptjs

2. **Authorization:**
   - Role-based access control (User, Admin, Super Admin)
   - Protected routes with middleware
   - API route guards

3. **Data Validation:**
   - Server-side validation with Zod
   - Input sanitization
   - Rate limiting (email/SMS)

4. **Payment Security:**
   - Razorpay integration (when implemented)
   - COD for safer transactions

5. **Image Security:**
   - AWS S3 presigned URLs
   - Cloudinary for image optimization
   - No direct file access

---

## 📱 Key UI Components

### Shadcn/Radix UI Components Used:
- `Button` - Interactive buttons
- `Card` - Content cards
- `Dialog` - Modals/dialogs
- `Input` - Form inputs
- `Select` - Dropdown selections
- `Tabs` - Tab navigation
- `Accordion` - Collapsible content
- `Badge` - Status badges
- `Separator` - Visual dividers
- `Avatar` - User avatars
- `Breadcrumb` - Navigation breadcrumb
- `Table` - Data tables (TanStack React Table)

### Custom Components:
- `ProductCard` - Display product with price and add-to-cart
- `AddToCartButton` - Quick add-to-cart action
- `CartMobileBar` - Mobile cart indicator
- `ProfileSheet` - User menu drawer
- `AddAddressDialog` - Address form modal
- `CheckoutDateDialog` - Delivery date picker

---

## 🌐 API Integration

### Base URL Configuration:
```
Production: https://www.alphaartandevents.com
Development: http://localhost:3000
Configured via: NEXT_PUBLIC_BASE_ALPHA env variable
```

### API Request Pattern:
```typescript
// Using axios wrapper (apiconnector.ts)
import { apiConnector } from "@/services/apiconnector";

const response = await apiConnector(
  "GET",
  "/api/product",
  null,
  headers,
  null
);
```

---

## 🚀 Deployment & Environment

### Environment Variables Required:
```bash
# NextAuth
NEXTAUTH_URL=https://alphaartandevents.com
NEXTAUTH_SECRET=<secret-key>

# Google OAuth
GOOGLE_CLIENT_ID=<google-client-id>
GOOGLE_CLIENT_SECRET=<google-client-secret>

# Database
MONGO_URL=<mongodb-atlas-url>

# JWT
SECRET_KEY_ACCESS_TOKEN=<access-token-secret>
SECRET_KEY_REFRESH_TOKEN=<refresh-token-secret>
JWT_SECRET=<jwt-secret>

# Email Service (Nodemailer)
MAIL_HOST=<mail-host>
MAIL_USER=<email>
MAIL_PASSWORD=<app-password>

# SMS Service (Twilio)
TWILIO_ACCOUNT_SID=<account-sid>
TWILIO_AUTH_TOKEN=<auth-token>
TWILIO_PHONE=<twilio-phone>

# AWS S3
AWS_S3_REGION=<region>
AWS_ACCESS_KEY_ID=<access-key>
AWS_SECRET_ACCESS_KEY=<secret-key>
AWS_S3_BUCKET=<bucket-name>

# API Base URL
NEXT_PUBLIC_BASE_ALPHA=<api-base-url>

# Vercel Production
AUTH_TRUST_HOST=true
```

### Deployment Process:
```bash
# Local Development
npm install
npm run dev

# Build
npm run build

# Production Start
npm start
```

### Vercel Deployment Checklist:
- ✅ Connect GitHub repository
- ✅ Set environment variables in Vercel console
- ✅ Configure MongoDB Atlas IP whitelist
- ✅ Set NEXTAUTH_URL to production domain
- ✅ Enable AUTH_TRUST_HOST
- ✅ Test Google OAuth redirect URIs
- ✅ Verify email/SMS services

---

## 📊 Performance Optimizations

1. **Image Optimization:**
   - Next.js Image component for lazy loading
   - AWS S3 CDN for fast delivery
   - Cloudinary for responsive images

2. **State Management:**
   - Redux for global state (reduces prop drilling)
   - Selector memoization

3. **Code Splitting:**
   - Dynamic imports for components
   - Route-based code splitting (Next.js default)

4. **Caching:**
   - Browser caching via HTTP headers
   - SWR/caching strategies in API calls

---

## 🛠️ Development Workflow

### Project Commands:
```bash
npm run dev              # Start development server
npm run build            # Build for production
npm start                # Start production server
npm run lint             # Run ESLint
```

### Code Quality:
- ESLint configuration present
- TypeScript for type safety
- Strict TypeScript rules in tsconfig.json

---

## 📞 Contact & Support

**Business Details:**
- Founder: Ankit Vishwakarma (CEO)
- Co-founder: Pankaj Nagar (Managing Director)
- Support Phone: +91 8966066299

**Platform Links:**
- Website: www.alphaartandevents.com
- GitHub: Lalitmehta045/alpha.event

---

## 🎓 Interview Talking Points

### Technical Highlights:
1. **Full-Stack Development:** Built complete e-commerce system from frontend to backend
2. **Authentication:** Implemented Google OAuth + JWT + NextAuth
3. **Database Design:** Modeled complex relationships (Users, Products, Orders, Cart)
4. **Payment Integration:** Integrated Razorpay payment gateway
5. **Cloud Services:** Used AWS S3 for image storage with presigned URLs
6. **State Management:** Implemented Redux for complex state
7. **API Design:** RESTful API with proper error handling
8. **Security:** Implemented role-based access control, password hashing, token management

### Business Features:
1. Complete product catalog with categories
2. Shopping cart with persistent storage
3. Order management with delivery tracking
4. Multiple address management
5. Admin panel for business operations
6. Email/SMS notifications
7. Responsive design for mobile/desktop

### Challenges & Solutions:
- **Challenge:** Managing real-time cart updates across components
  - **Solution:** Redux state management
  
- **Challenge:** Secure image uploads without exposing AWS keys
  - **Solution:** AWS S3 presigned URLs via backend
  
- **Challenge:** Handling user authentication across pages
  - **Solution:** NextAuth + JWT tokens with refresh mechanism

---

## 📝 Notes for Interview

**Strengths to Highlight:**
- End-to-end ownership of features
- Proper database schema design
- Implementation of payment gateway
- User authentication with multiple methods
- Admin panel with management features
- Responsive and user-friendly UI

**Areas to Deep Dive:**
- How cart state is managed in Redux
- How authentication flow works with NextAuth
- How orders are created and tracked
- How admin controls are implemented
- How images are stored and retrieved securely

---

**Last Updated:** February 24, 2026  
**Version:** 1.0  
**Status:** Production Ready
