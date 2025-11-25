# SolaCheck

AWP Projekt für das Zukunftsforum Nachhaltigkeit

A modern Progressive Web App (PWA) built with Next.js, TypeScript, and Tailwind CSS.

## Features

- ⚡ **Next.js 16** - Latest version with App Router and Turbopack
- 📱 **Progressive Web App** - Installable with offline support
- 🎨 **Tailwind CSS v4** - Modern utility-first CSS framework
- 🔒 **TypeScript** - Full type safety
- 🚀 **API Routes** - Built-in backend functionality
- 🧪 **Playwright Testing** - End-to-end tests with Docker support
- 🐳 **Docker** - Containerized for consistent deployments
- 🎯 **Minimal Setup** - No bloat, just what you need

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Docker (for running tests in Docker)

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

4. Open [http://localhost:3000/solacheck](http://localhost:3000/solacheck) in your browser.

## Available Scripts

### Development

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production (runs lint first) |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Run ESLint and auto-fix issues |

### Testing

| Command | Description | When to Use |
|---------|-------------|-------------|
| `npm run test` | Run Playwright tests locally | Quick local testing during development |
| `npm run test:ui` | Run tests with Playwright UI | Debugging tests interactively |
| `npm run test:headed` | Run tests in headed browser | Watch tests execute visually |
| `npm run test:docker` | Run tests in Docker container | **Recommended for CI parity** - ensures same environment as CI |
| `npm run test:docker:down` | Clean up Docker test containers | After Docker tests complete |

### When to Use Which Test Command

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Testing Decision Tree                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Quick feedback during development?                                  │
│    └── npm run test                                                  │
│                                                                      │
│  Need to debug a failing test?                                       │
│    └── npm run test:ui                                               │
│                                                                      │
│  Want to see the browser while tests run?                            │
│    └── npm run test:headed                                           │
│                                                                      │
│  Tests pass locally but fail in CI?                                  │
│    └── npm run test:docker  (matches CI environment exactly)         │
│                                                                      │
│  Before pushing to ensure CI will pass?                              │
│    └── npm run test:docker  (best practice)                          │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

## Testing

### Local Testing

For fast feedback during development, run tests locally:

```bash
# First, start the dev server in one terminal
npm run dev

# Then run tests in another terminal
npm run test
```

### Docker Testing (Recommended for CI Parity)

Tests can differ between local machines (Mac, Windows, Linux) and CI due to:
- Different browser versions
- Font rendering differences
- System library variations

To ensure your tests pass in CI, run them in Docker:

```bash
# Run tests in Docker (same environment as CI)
npm run test:docker

# Clean up after testing
npm run test:docker:down
```

This uses the official Playwright Docker image which provides:
- Consistent Chromium browser version
- Identical font rendering
- Same system libraries as CI

### Test Architecture

Tests use **Playwright's web-first assertions** which auto-retry until conditions are met:

```typescript
// ✅ Good - auto-retries until button is enabled
await expect(page.getByRole('button', { name: 'Submit' })).toBeEnabled();

// ❌ Bad - flaky, doesn't retry
await page.waitForTimeout(500);
expect(await button.isEnabled()).toBe(true);
```

## Project Structure

```
SolaCheck/
├── src/
│   ├── app/
│   │   ├── api/                   # API routes
│   │   ├── quiz/                  # Quiz page
│   │   ├── layout.tsx             # Root layout
│   │   ├── page.tsx               # Home page
│   │   └── globals.css            # Global styles
│   ├── components/                # React components
│   │   ├── ui/                    # UI components (Button, Card, etc.)
│   │   ├── AddressInput.tsx       # Address input with GPS
│   │   └── BurgerMenu.tsx         # Navigation menu
│   └── hooks/                     # Custom React hooks
│       ├── useQuizProgress.ts     # Cookie-based progress persistence
│       └── useReverseGeocoding.ts # Nominatim API integration
├── tests/                         # Playwright E2E tests
│   ├── address-input.spec.ts
│   ├── burger-menu-reset.spec.ts
│   ├── quiz-progress.spec.ts
│   └── landing-page.spec.ts
├── public/
│   ├── manifest.json              # PWA manifest
│   └── icon-*.png                 # PWA icons
├── docker-compose.yml             # Production Docker config
├── docker-compose.test.yml        # Test Docker config (all-in-one)
├── Dockerfile                     # Production Dockerfile
├── Dockerfile.test                # All-in-one test Dockerfile
├── playwright.config.ts           # Playwright configuration
└── next.config.js                 # Next.js configuration
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

## CI/CD Pipeline

### How It Works

The GitHub Actions workflow (`.github/workflows/ci-cd.yml`) runs on every push and PR:

1. **Lint** - ESLint checks code quality
2. **Test in Docker** - Playwright tests run in Docker for consistency
3. **Deploy** (main branch only) - SSH to server and rebuild containers

### Why Docker for Tests?

Tests run in Docker containers to ensure:

- Same browser version as CI
- Identical font rendering
- Consistent system libraries
- No "works on my machine" issues

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
