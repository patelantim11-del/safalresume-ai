# SAFALPROFILE AI - Universal AI Profile Builder

**Create professional resumes, biodatas, portfolios, business profiles and personal documents with AI.**

A production-ready SaaS platform built with Next.js 15, TypeScript, MongoDB, and AI integration for creating multiple document types with ATS optimization, AI-powered features, and subscription management.

## 🚀 Features

### Document Types (15+)

- Job Resume
- Marriage Biodata
- Student CV
- Internship Resume
- Freelancer Profile
- Business Profile
- Academic CV
- Government Job Resume
- Professional Portfolio
- Personal Profile
- Teacher Profile
- Doctor Profile
- Lawyer Profile
- Artist/Model Profile
- Custom Profile

### AI-Powered Features

- **ATS Analyzer** - Get ATS score, missing keywords, formatting issues
- **Resume Optimizer** - One-click professional enhancement
- **Cover Letter Generator** - Professional letters for different career stages
- **LinkedIn Profile Generator** - Auto-generate compelling LinkedIn content
- **Job Description Matching** - Match percentage and skill gaps
- **Career Tools** - Roadmap generator, trending skills, interviews, certifications

### SaaS Features

- **Subscription System** - Free, Pro, Premium plans
- **Dashboard** - Analytics, quick actions, recent documents
- **Public Profiles** - Share resumes via public links
- **Blog System** - Career tips with categories and SEO
- **Admin Panel** - User management, analytics, content management
- **Dark Mode** - Professional glassmorphism design
- **Mobile-First** - Fully responsive layout

## 📋 Prerequisites

- Node.js 22.17+
- MongoDB Atlas account
- Gemini or OpenAI API key
- Razorpay account (for payments)

## 🛠️ Setup

### 1. Clone & Install

```bash
git clone <repo-url>
cd ai-resume-builder
npm install
```

### 2. Environment Variables

Create `.env.local`:

```env
# MongoDB
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/safalprofile

# AI Integration (choose one)
GEMINI_API_KEY=your_gemini_key
# OR
OPENAI_API_KEY=your_openai_key
AI_PROVIDER=gemini  # or 'openai'

# Razorpay
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_razorpay_webhook_secret

# Auth and app URLs
JWT_SECRET=your_jwt_secret
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Use `.env.example` as the complete deployment template.

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 4. Build for Production

```bash
npm run build
npm start
```

## 📁 Project Structure

```
├── app/
│   ├── api/              # API routes
│   │   ├── auth/         # Authentication
│   │   ├── documents/    # Document CRUD
│   │   ├── ai/          # AI features
│   │   ├── subscription/# Subscription
│   │   ├── blog/        # Blog system
│   │   └── dashboard/   # Analytics
│   ├── dashboard/        # User dashboard
│   ├── auth/            # Auth pages
│   ├── blog/            # Blog pages
│   └── admin/           # Admin panel
├── components/           # React components
├── lib/                 # Utilities
│   ├── auth.ts         # Auth helpers
│   ├── ai.ts           # AI integration
│   ├── subscription.ts # Subscription logic
│   └── mongodb.ts      # DB connection
├── models/              # MongoDB models
├── types/               # TypeScript types
└── public/              # Static assets
```

## 🔐 Authentication

JWT-based authentication with secure password hashing (bcryptjs).

**Routes:**

- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Current user

## 📄 Document Management

**API Endpoints:**

- `GET /api/documents` - List user documents
- `POST /api/documents` - Create document
- `GET /api/documents/[id]` - Get document
- `PUT /api/documents/[id]` - Update document
- `DELETE /api/documents/[id]` - Delete document

## 🤖 AI Features

**Resume Analysis:**

- `POST /api/ai/ats-analyze` - Get ATS score
- `POST /api/ai/optimize-resume` - Enhance resume
- `POST /api/ai/job-match` - Match job description
- `POST /api/ai/cover-letter` - Generate cover letter
- `POST /api/ai/linkedin-generator` - LinkedIn content
- `POST /api/ai/career-tools` - Career guidance tools

## 💳 Subscription Plans

| Feature           | Free  | Pro       | Premium   |
| ----------------- | ----- | --------- | --------- |
| Documents         | 2     | Unlimited | Unlimited |
| ATS Analyzer      | ❌    | ✅        | ✅        |
| Cover Letters     | ❌    | 10/month  | Unlimited |
| Portfolio Hosting | ❌    | ❌        | ✅        |
| AI Credits        | 0     | 100/month | 200/month |
| Support           | Email | Priority  | Priority  |

## 🎨 Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Node.js
- **Database**: MongoDB Atlas
- **Authentication**: JWT, bcryptjs
- **AI**: Gemini/OpenAI APIs
- **Payments**: Razorpay
- **Analytics**: Recharts
- **UI Components**: Lucide React

## 📚 API Documentation

### Create Document

```bash
POST /api/documents
Content-Type: application/json

{
  "type": "job_resume",
  "title": "My Resume",
  "template": "modern",
  "content": { ... }
}
```

### Analyze ATS

```bash
POST /api/ai/ats-analyze
Content-Type: application/json

{
  "resumeText": "resume content here...",
  "documentId": "optional_doc_id"
}

# Response
{
  "score": 85,
  "missingKeywords": ["..."],
  "formattingIssues": ["..."],
  "suggestions": ["..."]
}
```

### Generate Cover Letter

```bash
POST /api/ai/cover-letter
Content-Type: application/json

{
  "jobDescription": "job desc here...",
  "resumeContent": "resume here...",
  "candidateType": "experienced"
}

# Response
{
  "content": "cover letter text...",
  "suggestions": ["..."]
}
```

## 🚀 Deployment

### Vercel (Recommended)

```bash
npm run lint
npm run build
vercel deploy --prod
```

This repository includes `vercel.json` with the Next.js preset, `npm ci` install command, `npm run build` build command, and a larger timeout/memory budget for `/api/export-pdf`.

### Environment Variables on Vercel

Use `.env.example` as the source of truth for Vercel. Add those variables in Vercel Project Settings -> Environment Variables. For production, set:

- `NEXTAUTH_URL`, `NEXT_PUBLIC_BASE_URL`, and `NEXT_PUBLIC_APP_URL` to your deployed HTTPS domain.
- `JWT_SECRET` and `NEXTAUTH_SECRET` to different strong random values.
- Either `GEMINI_API_KEY` with `AI_PROVIDER=gemini`, or `OPENAI_API_KEY` with `AI_PROVIDER=openai`.
- `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, and `RAZORPAY_WEBHOOK_SECRET` if payments are enabled.
- `SMTP_USER` and `SMTP_PASS` for password reset emails.

The project declares Node `>=22.17.0 <25` in `package.json`; set the Vercel Node.js version to 22.x if the dashboard asks.

### MongoDB Atlas

1. Create cluster
2. Create database user
3. Get connection string
4. Add to `MONGODB_URI`

## 📈 Analytics

Dashboard shows:

- Total documents created
- Average ATS score
- AI credits remaining
- Cover letters generated
- Profile views
- Charts for usage trends

## 🔒 Security

- JWT authentication
- Password hashing with bcryptjs
- Environment variable protection
- MongoDB connection pooling
- API rate limiting ready
- HTTPS enforced in production

## 📝 License

Proprietary - All rights reserved

## 🤝 Support

For issues and feature requests, contact support@safalprofile.ai

---

Built with ❤️ for career growth
