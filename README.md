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


## 🔮 Future Roadmap

- [ ] **Tags & Filtering**: Organize bookmarks with custom tags.
- [ ] **Search**: Full-text search for titles and URLs.
- [ ] **Metadata Fetching**: Automatically fetch page titles, descriptions, and og:images from URLs.
- [ ] **Drag & Drop**: Reorder bookmarks manually.

