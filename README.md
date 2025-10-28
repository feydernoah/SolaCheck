# SolaCheck

AWP Projekt für das Zukunftsforum Nachhaltigkeit

A modern Progressive Web App (PWA) built with Next.js, TypeScript, and Tailwind CSS.

## Features

- ⚡ **Next.js 16** - Latest version with App Router and Turbopack
- 📱 **Progressive Web App** - Installable with offline support
- 🎨 **Tailwind CSS v4** - Modern utility-first CSS framework
- 🔒 **TypeScript** - Full type safety
- 🚀 **API Routes** - Built-in backend functionality
- 🎯 **Minimal Setup** - No bloat, just what you need

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/feydernoah/SolaCheck.git
cd SolaCheck
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run linter

## Project Structure

```
SolaCheck/
├── src/
│   └── app/
│       ├── api/
│       │   └── hello/
│       │       └── route.ts      # Sample API endpoint
│       ├── layout.tsx             # Root layout
│       ├── page.tsx               # Home page
│       └── globals.css            # Global styles
├── public/
│   ├── manifest.json              # PWA manifest
│   └── icon-*.png                 # PWA icons
├── next.config.js                 # Next.js configuration
├── tailwind.config.ts             # Tailwind configuration
└── tsconfig.json                  # TypeScript configuration
```

## PWA Support

This application is configured as a Progressive Web App:

- **Installable** - Users can install it on their devices
- **Offline Support** - Service worker caches assets
- **App-like Experience** - Standalone display mode
- **Icons** - Proper PWA icons for all devices

To test PWA features in production:

```bash
npm run build
npm run start
```

Then visit the app in Chrome and look for the install prompt.

## API Routes

Example API endpoint is available at `/api/hello`:

```typescript
// src/app/api/hello/route.ts
export async function GET() {
  return NextResponse.json({
    message: "Hello from the API!",
    timestamp: new Date().toISOString(),
  });
}
```

## Customization

### Styling

Tailwind CSS is configured and ready to use. Customize in `src/app/globals.css`:

```css
@import "tailwindcss";
```

### PWA Settings

Modify the PWA configuration in `next.config.js` and `public/manifest.json`.

### TypeScript

TypeScript configuration is in `tsconfig.json`. Adjust as needed for your project.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [PWA Documentation](https://web.dev/progressive-web-apps/)

## License

ISC
