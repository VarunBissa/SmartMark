# SmartBookmark

**SmartBookmark** is a sophisticated, real-time bookmark management application designed for speed, privacy, and aesthetics. Built with the latest web technologies, it offers a seamless experience for organizing your digital life.

![SmartBookmark Dashboard Preview] (Add your screenshot here)

## 🌟 Key Features

### 🔐 Authentication & Security
- **Secure OAuth Login**: Seamlessly sign in with Google using Supabase Auth.
- **Row Level Security (RLS)**: Data isolation is enforced at the database level. Users can strictly access ONLY their own bookmarks.
- **Protected Routes**: Middleware ensures unauthenticated users are redirected from protected dashboard pages.

### 🔖 Smart Management
- **Intelligent Auto-Titling**: Automatically extracts the hostname as a title if none is provided.
- **One-Click Add**: Fast and intuitive interface to save URLs.
- **Contextual Deletion**: Safe deletion with a confirmation modal to prevent accidental loss.

### ⚡ Real-Time & Interactive
- **Live Synchronization**: Powered by Supabase Realtime, changes (adds/deletes) update instantly across all open tabs and devices without refreshing.
- **Responsive Design**: precise layouts for mobile, tablet, and desktop screens.
- **Optimized Performance**: Uses Next.js App Router and Server Components for lightning-fast initial loads.

### 🎨 Premium UI/UX
- **Dark Mode Aesthetic**: A carefully crafted dark theme with rich gradients, blur effects, and glassmorphism.
- **Micro-Interactions**: Smooth transitions, hover effects, and loading skeletons for a polished feel.
- **Visual Feedback**: Toast notifications and clear error messages.

---

## 🛠️ Tech Stack

- **Frontend Framework**: [Next.js 16](https://nextjs.org/) (App Router, Server Actions)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) (using the new oxide engine)
- **Backend & Database**: [Supabase](https://supabase.com/)
  - **Auth**: Google OAuth Provider
  - **Database**: PostgreSQL
  - **Realtime**: WebSocket subscriptions via `postgres_changes`
- **Tying it together**: `useCallback`, `useEffect` for client-side logic, and Next.js Middleware for auth protection.

---

## 📂 Database Schema

The application uses a single, efficient PostgreSQL table `bookmarks` with RLS policies.

```sql
create table bookmarks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  url text not null,
  title text not null,
  description text,
  image_url text,
  category text default 'Uncategorized',
  tags text[] default '{}',
  is_favorite boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

**Security Policies:**
- `SELECT`: Users can view their own bookmarks.
- `INSERT`: Users can create bookmarks linked to their `auth.uid()`.
- `DELETE`: Users can delete bookmarks where `user_id` matches their ID.

---

## 🚀 Getting Started

Follow these steps to set up the project locally.

### Prerequisites
- Node.js 18.17 or later
- A [Supabase](https://supabase.com/) account

### 1. Clone the Repository
```bash
git clone https://github.com/VarunBissa/SmartMark.git
cd SmartMark
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Supabase
1. Create a new Supabase project.
2. Go to **Authentication** -> **Providers** and enable **Google**.
   - You will need to set up a Google Cloud Project to get the *Client ID* and *Client Secret*.
   - Add the Redirect URL: `https://<your-project-ref>.supabase.co/auth/v1/callback`
3. Run the provided SQL in the Supabase **SQL Editor** to create the tables and policies. You can find the SQL in `supabase_schema.sql`.

### 4. Set Environment Variables
Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 5. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

---

## 🔧 Challenges & Solutions

### 1. Vercel Deployment & Environment Variables
**Problem:**
One of the main challenges encountered was a build failure during Vercel deployment. The error message indicated that the Supabase client could not be initialized because the `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` were missing. This occurred because Next.js attempts to statically generate pages during the build process. When the code tried to initialize the Supabase client to fetch data or check authentication, it failed due to the missing environment variables in the Vercel environment.

**Solution:**
To resolve this, we ensured that the `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` were correctly added to the **Environment Variables** section in the Vercel Project Settings. Additionally, we implemented fallback values in `lib/supabase/client.ts` and `lib/supabase/server.ts`. This ensures that `createClient` doesn't throw an immediate error during build time when keys might not be strictly necessary (e.g., for static analysis), while still requiring valid keys for actual data fetching at runtime.

### 2. Middleware for Protected Routes
**Problem:**
We needed a way to restrict access to the dashboard (`/dashboard`) so that only authenticated users could view it, while also redirecting authenticated users away from the login page (`/login`) to the dashboard. Doing this inside components can lead to content flashing (showing the dashboard briefly before redirecting).

**Solution:**
We implemented Next.js Middleware in `middleware.ts`. This file runs before a request is completed. By creating a Supabase client within the middleware, we can check for an active user session.
- If a user tries to access `/dashboard` without a session, they are redirected to `/`.
- If a logged-in user visits `/` or `/login`, they are redirected to `/dashboard`.
This logic happens on the server side, ensuring a smooth and secure transition for the user.

### 3. Real-Time UI Updates
**Problem:**
A bookmark manager needs to feel snappy. When a user adds or deletes a bookmark, the change should be reflected immediately without a page reload. Relying solely on re-fetching data can differ in speed.

**Solution:**
We leveraged Supabase's Realtime capabilities. By subscribing to the `bookmarks` table using `postgres_changes`, the application listens for `INSERT` and `DELETE` events. When an event is received, the local state is updated instantly, providing a seamless "live" experience across multiple tabs or devices.

---

## 🔮 Future Roadmap

- [ ] **Tags & Filtering**: Organize bookmarks with custom tags.
- [ ] **Search**: Full-text search for titles and URLs.
- [ ] **Metadata Fetching**: Automatically fetch page titles, descriptions, and og:images from URLs.
- [ ] **Drag & Drop**: Reorder bookmarks manually.
