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

## Deployment

This project uses GitHub Actions for automated deployment to your server via Docker.

### How It Works

When you push to the `main` branch, GitHub Actions will:
1. SSH into your server
2. Pull the latest code from GitHub
3. Rebuild and restart the Docker container using docker-compose
4. The app runs on localhost:3000 behind your existing web server

### Setup Instructions

**1. Setup Project Directory on Server**:

SSH to your server and create the project directory:

```bash
ssh noah@nofey.de
cd /home/noah
git clone https://github.com/feydernoah/SolaCheck.git solacheck
cd solacheck
```

**2. Configure GitHub Secrets**:

Go to your GitHub repository → Settings → Secrets and variables → Actions → New repository secret

Add these two secrets:
- `SSH_PRIVATE_KEY` - Your SSH private key (you already have this from your homepage repo)
- `SSH_KNOWN_HOSTS` - Run this on your local machine to get it:
  ```bash
  ssh-keyscan nofey.de
  ```

**3. Configure Your Web Server** (choose your web server):

**For Nginx:**

Add this to your existing site configuration (e.g., `/etc/nginx/sites-available/your-site`):

```nginx
# Add this location block to your existing server block
location /solacheck {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

Then reload Nginx:
```bash
sudo nginx -t  # Test configuration
sudo systemctl reload nginx
```

**For Apache:**

Enable required modules and add to your site config:
```bash
sudo a2enmod proxy proxy_http
```

Add this to your VirtualHost:
```apache
# Add this to your existing <VirtualHost> block
ProxyPass /solacheck http://localhost:3000
ProxyPassReverse /solacheck http://localhost:3000
ProxyPreserveHost On
```

Then reload Apache:
```bash
sudo apachectl configtest
sudo systemctl reload apache2
```

**4. Deploy!**

Push to main branch:
```bash
git add .
git commit -m "Setup CI/CD"
git push origin main
```

Your app will be accessible at: `https://nofey.de/solacheck`

### Monitoring Deployments

- **GitHub Actions**: Check the "Actions" tab in your GitHub repository
- **View Logs**: SSH to your server and run `docker-compose logs -f`
- **Container Status**: `docker-compose ps`

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [PWA Documentation](https://web.dev/progressive-web-apps/)

## License

ISC
