# Vatro Visuals — Portfolio Website

A personal portfolio website for **Vatro Visuals**, a computer graphics artist specializing in 3D, animation, branding, motion design, and digital art. Built with Next.js 14 and deployed on Vercel.

🌐 **Live:** [vatro-visuals.vercel.app](https://vatro-visuals.vercel.app/)

---

## Features

- **Animated hero section** — interactive logo animation and smooth scroll-based transitions
- **Projects gallery** — dynamically loaded from Firebase Firestore with priority sorting and lazy-loaded thumbnails
- **Individual project pages** — detailed view per project with images and description
- **Tools showcase** — highlights the creative software stack (After Effects, Photoshop, Illustrator, Premiere Pro, Blender)
- **Contact form** — built-in contact section
- **Instagram integration** — direct link to the artist's Instagram profile
- **Navbar with hide-on-scroll** — auto-hides while scrolling down, reappears on scroll up
- **Mobile-first responsive design** — optimized for all screen sizes including iOS
- **Glitch button effects** — custom animated UI buttons with glitch aesthetics
- **3D Spline scene** — interactive 3D element powered by Spline
- **GSAP animations** — scroll-triggered and entrance animations throughout the page

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 14](https://nextjs.org/) |
| Styling | [Tailwind CSS](https://tailwindcss.com/) |
| Animations | [GSAP](https://greensock.com/gsap/), [react-scroll-parallax](https://react-scroll-parallax.damnthat.tv/) |
| 3D | [Three.js](https://threejs.org/), [Spline](https://spline.design/) |
| Database | [Firebase Firestore](https://firebase.google.com/docs/firestore) |
| Storage | [Firebase Storage](https://firebase.google.com/docs/storage) |
| Image optimization | [Sharp](https://sharp.pixelplumbing.com/) |
| Deployment | [Vercel](https://vercel.com/) |
| Fonts | Geist Sans & Geist Mono (local) |

---

## Project Structure

```
vatro_visuals/
├── app/
│   ├── layout.js              # Root layout, metadata & global SEO
│   ├── page.js                # Home page — assembles all sections
│   ├── globals.css            # Global styles
│   └── projects/
│       ├── page.js            # Projects gallery page
│       └── [projectId]/
│           └── page.js        # Individual project detail page
├── components/                # Reusable UI components
│   ├── Navbar.js              # Responsive navbar with hide-on-scroll
│   ├── LogoAnimation.jsx      # Animated logo / hero section
│   ├── GlitchButton.js        # Custom animated button with glitch effect
│   ├── ToolsList.js           # Creative tools grid (AE, PS, AI, PR, Blender)
│   ├── section3.js            # Projects carousel section
│   ├── section4.js            # Tools & about section
│   ├── section5.js            # Contact & social section
│   └── ...                    # Other animated and UI components
├── lib/
│   ├── getProjects.js         # Fetch projects from Firestore
│   └── getProjectById.js      # Fetch a single project by ID
├── config/
│   ├── firebaseConfig.js      # Firebase initialization
│   └── carousel-config.js     # Static carousel configuration
├── utils/
│   ├── scrollWithRAF.js       # Smooth scroll with requestAnimationFrame
│   ├── scrollWithObserver.js  # Scroll helper using IntersectionObserver
│   └── logoUtils.js           # Logo animation utilities
└── public/                    # Static assets (images, videos, SVGs, favicon)
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- A Firebase project with Firestore and Storage enabled

### Installation

```bash
# Clone the repository
git clone https://github.com/s218270/vatro_visuals.git
cd vatro_visuals

# Install dependencies
npm install
```

### Environment Variables

Create a `.env.local` file in the root directory and add your Firebase credentials:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build & Production

```bash
npm run build
npm run start
```

---

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

---

## Creative Tools Featured

- **Adobe After Effects** — motion graphics & VFX
- **Adobe Photoshop** — photo editing & compositing
- **Adobe Illustrator** — vector graphics & illustration
- **Adobe Premiere Pro** — video editing
- **Blender** — 3D modeling, rendering & animation
