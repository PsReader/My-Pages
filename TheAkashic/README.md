# The Akashic

A premium, production-ready web application for tracking your novels, manga, and manhwa collection. Built with **React**, **Vite**, **Tailwind CSS**, and **Supabase**.

## ✨ Features

- **� Story Dashboard**: Beautiful, responsive grid layout optimized for mobile and desktop
- **🏷️ Smart Filtering**: Search by title and filter by multiple tags instantly
- **⚡ Quick Progress Tracking**: In-line volume/chapter counters with one-touch increment/decrement
- **� Light/Dark Mode**: Elegant theme toggle with persistent user preference
- **� Secure Authentication**: Email/password auth via Supabase with Row Level Security policies
- **☁️ Real-time Sync**: Supabase real-time updates for instant multi-device synchronization
- **📝 Rich Editing**: Modal-based detailed editor supporting hype notes, character directories, and cover images
- **📱 Mobile-First Design**: Fully responsive with touch-optimized controls (44x44px minimum)
- **🚀 Production Ready**: Clean codebase, no AI-generated aesthetics, deployment scripts included

## 🛠 Tech Stack

| Component      | Technology                               |
| -------------- | ---------------------------------------- |
| **Runtime**    | Node.js 18+                              |
| **Frontend**   | React 19 + Vite 8                        |
| **Styling**    | Tailwind CSS 4                           |
| **Backend**    | Supabase (PostgreSQL + Auth + Real-time) |
| **Deployment** | GitHub Pages + gh-pages                  |

## 📁 Project Structure

```
TheAkashic/
├── src/
│   ├── components/
│   │   ├── Auth.jsx           # Login/signup authentication UI
│   │   ├── Navigation.jsx     # Header with logo, theme toggle, logout
│   │   ├── SearchBar.jsx      # Search input + tag filter bar
│   │   ├── StoryCard.jsx      # Individual story card (cover, +/- buttons)
│   │   ├── StoryModal.jsx     # Detailed edit form modal
│   │   ├── DashboardGrid.jsx  # Responsive masonry grid layout
│   │   └── Footer.jsx         # Footer with GitHub link
│   ├── supabaseClient.js      # Supabase initialization
│   ├── App.jsx                # Main app + state management
│   ├── main.jsx               # React entry point
│   └── index.css              # Global styles + Tailwind imports
├── index.html                 # HTML template
├── vite.config.js             # Vite build configuration
├── tailwind.config.js         # Tailwind theme extensions
├── postcss.config.js          # PostCSS plugins
├── package.json               # Dependencies & npm scripts
├── .env.example               # Environment variables template
├── SQL_SETUP.md               # Complete SQL migration guide
└── README.md                  # This file
```

## 🚀 Getting Started

### 1. Prerequisites

- Node.js 18 or higher
- npm or yarn package manager
- Supabase account (free tier available at supabase.com)
- GitHub account (for deployment)

### 2. Clone & Install

```bash
git clone https://github.com/yourusername/theakashic.git
cd TheAkashic
npm install
```

### 3. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **Project Settings** → **API**
3. Copy your **Project URL** and **Anon Key**
4. Create `.env.local` in the project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_public_anon_key_here
```

### 4. Configure Database

1. Go to Supabase Dashboard → **SQL Editor**
2. Open [SQL_SETUP.md](./SQL_SETUP.md) and copy the complete SQL script
3. Paste and execute in the SQL editor
4. This creates the `stories` table with Row Level Security

### 5. Start Development

```bash
npm run dev
```

Navigate to `http://localhost:5173/` and sign up with a test account.

## 📋 Available Commands

```bash
npm run dev         # Start dev server (hot reload)
npm run build       # Build for production (creates dist/)
npm run preview     # Preview production build locally
npm run deploy      # Build + deploy to GitHub Pages
npm run lint        # Run Oxlint code quality checks
```

## 🎨 Design System

### Color Palette

- **Primary Background**: `slate-50` (light) / `slate-950` (dark)
- **Secondary Surfaces**: `slate-100` / `slate-900`
- **Accent Color**: `amber-600` (light mode) / `amber-500` (dark mode)
- **Text**: `slate-900` (light) / `slate-50` (dark)

### Logo

The app features "The Codex Aperture" logo with midnight navy and metallic gold gradients, positioned in the top-left navigation header.

### Typography

- **Font Stack**: System UI sans-serif (`-apple-system`, `Segoe UI`, Roboto, etc.)
- **Line Height**: 1.5–1.6 on body text
- **Font Sizes**: Responsive scaling (sm:, lg:, xl: breakpoints)

## 🔐 Security

- **Row Level Security (RLS)**: Users can only access their own stories
- **Email Verification**: Supabase handles email confirmation
- **No Sensitive Data**: Auth tokens stored securely in localStorage
- **HTTPS Only**: All Supabase traffic is encrypted

## 📱 Mobile Optimization

- **Touch Targets**: All interactive elements are minimum 44×44px
- **Responsive Grid**: 2 columns on mobile, 3-5 on larger screens
- **Safe Area Support**: Bottom padding respects notches/home indicators
- **Native Feel**: Smooth scrolling, bounce animations, haptic-friendly

## 🧪 Testing

Create a test account in your Supabase project and add sample stories to verify:

- ✅ Login/signup works
- ✅ Stories save to database
- ✅ Real-time updates sync
- ✅ +/- buttons increment smoothly
- ✅ Dark mode toggle persists
- ✅ Filtering by tags works correctly

## 🚀 Deployment

### GitHub Pages

1. Push your repo to GitHub
2. Update the `base` in `vite.config.js` if using a subdirectory:
   ```javascript
   base: '/the-akashic/', // if repo is github.com/user/the-akashic
   ```
3. Run:
   ```bash
   npm run deploy
   ```

### Other Hosting (Vercel, Netlify, etc.)

1. Connect your GitHub repo
2. Set environment variables in the dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Set build command: `npm run build`
4. Set publish directory: `dist`

## 🤝 Contributing

Feel free to submit issues or pull requests to improve The Akashic!

## 📄 License

This project is open-source and available under the MIT License.

---

**Made with ❤️ for tracking stories you love.**

````

> **Note**: First ensure `gh-pages` is installed and your remote is set up correctly.

## Theme & Design

The app uses a **mystical purple theme** inspired by the visual design of "Lord of the Mysteries":

- **Primary Color**: Tyrian Purple (#9b5fff)
- **Dark Background**: Deep black with purple accents
- **Light Mode**: Clean whites with purple accents
- **Smooth Transitions**: All interactions use Tailwind's transition utilities

### Color Palette

```css
Primary Purple: #9b5fff (main), #6b1bda (darker), #5a15b8 (darkest)
Dark Theme: #0a0a0a (background) to #262626 (surfaces)
Accent Glow: Shadow effects with purple tint
````

## Database Schema Details

### Stories Table Fields

| Field                 | Type      | Purpose                                            |
| --------------------- | --------- | -------------------------------------------------- |
| `id`                  | UUID      | Unique identifier                                  |
| `user_id`             | UUID      | Links to authenticated user                        |
| `title`               | TEXT      | Story name                                         |
| `tags`                | TEXT[]    | Array of category tags                             |
| `status`              | TEXT      | Reading status (To Read/Reading/Completed/On Hold) |
| `volume`              | INT       | Current volume number                              |
| `chapter`             | INT       | Current chapter number                             |
| `source_url`          | URL       | Link to source (Wattpad, NovelUpdates, etc.)       |
| `cover_image_url`     | URL       | Cover image link                                   |
| `hype_note`           | TEXT      | Personal thoughts, ratings, review                 |
| `character_directory` | TEXT      | Character/faction tracking notes                   |
| `created_at`          | TIMESTAMP | Record creation time                               |
| `updated_at`          | TIMESTAMP | Last modification time                             |

## Features Deep Dive

### Global Search & Filtering

- **Search Bar**: Filters stories by title in real-time
- **Tag Buttons**: Click any tag badge to filter dashboard
- **All Button**: Reset filter to show all stories

### Inline Progress Updates

- **Volume/Chapter Counters**: Update without opening modal
- **Debounced Database Calls**: Rapid clicking won't spam Supabase
- **Instant UI Feedback**: Optimistic updates for smooth UX

### Story Modal

- **Full Edit Form**: Title, status, URL, cover image
- **Rich Text Areas**: Separate fields for hype notes and character directory
- **Tag Management**: Add/remove tags with visual feedback
- **Save & Cancel**: Modal controls with loading states

### Real-time Sync

- Supabase Realtime listeners automatically update the dashboard
- Multi-device changes sync instantly
- Row Level Security ensures users only see their own data

## Customization

### Theme Colors

Edit `tailwind.config.js` to customize:

```javascript
colors: {
  primary: { ... },
  dark: { ... }
}
```

### Add New Fields

1. Alter the Supabase table schema
2. Update the form in `StoryModal.jsx`
3. Update the display in `StoryCard.jsx` if needed

### Modify Card Layout

Edit the className and structure in `StoryCard.jsx` for different layouts.

## Troubleshooting

### "Failed to connect to Supabase"

- Verify `.env.local` has correct URL and anon key
- Check that Supabase project is active
- Ensure browser isn't blocking the request

### "Unexpected token" errors

- Clear `node_modules` and reinstall: `rm -r node_modules && npm install`
- Clear Vite cache: `rm -r .vite`
- Restart dev server

### RLS Policy Errors

- Ensure user is authenticated before querying
- Check RLS policies allow the operation
- Verify the user_id matches `auth.uid()`

### Import Errors

- All component imports use relative paths from `src/`
- Ensure file names match (case-sensitive on Linux/Mac)

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers with full ES2020+ support

## Future Enhancements

- [ ] Reading list sorting (by status, date, rating)
- [ ] Statistics dashboard (stories per month, completion rate)
- [ ] Export/import data as JSON
- [ ] Social features (share reading lists)
- [ ] PWA support for offline access
- [ ] Mobile app (React Native version)

## License

MIT License - Feel free to use and modify for personal projects.

## Credits

Built with passion by an aspiring web developer. Inspired by the visual design and organizational requirements of tracking multi-series stories and manga collections.

---

**Happy Tracking!** ✦

May your Akashic Records be forever organized.

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
