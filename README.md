# SolaCheck

A quiz-based tool to help users decide if a balcony solar system (Balkonkraftwerk) makes sense for their situation. Built as part of the AWP project for the Zukunftsforum Nachhaltigkeit.

**Live demo:** https://nofey.de/solacheck

## What it does

SolaCheck guides users through a series of questions about their living situation, energy consumption, and balcony conditions. Based on the answers, it calculates:

- Expected energy yield based on location and orientation
- Estimated savings and payback period  
- Environmental impact (CO₂ savings)
- Personalized product recommendations

The app fetches real solar irradiation data for the user's location and uses current market prices from product scraping.

## Quick Start

```bash
git clone https://github.com/feydernoah/SolaCheck.git
cd SolaCheck
npm install
npm run dev
```

Open http://localhost:3000/solacheck

## Requirements

- Node.js 18+
- Docker (optional, for testing)

## Scripts

```bash
npm run dev              # Start dev server
npm run build            # Lint and build for production
npm run start            # Start production server
npm run lint             # Run ESLint
npm run lint:fix         # Fix linting issues

npm run test             # Run Playwright tests
npm run test:ui          # Interactive test UI
npm run test:headed      # Run tests with visible browser
npm run test:docker      # Run tests in Docker (matches CI)
npm run test:docker:down # Clean up Docker containers

npm run refresh-products # Re-scrape product data
```

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── enrich-gemini/    # AI-powered product enrichment
│   │   ├── recommendation/   # Product recommendations
│   │   ├── scrape-bkw/       # Product scraping
│   │   └── solar-data/       # Solar irradiation data
│   ├── quiz/                 # Quiz flow
│   ├── results/              # Results display
│   └── carbon-footprint/     # Environmental impact page
├── components/
│   ├── ui/                   # Reusable UI components
│   ├── CompassSelector.tsx   # Direction picker
│   ├── AddressInput.tsx      # Location input with GPS
│   └── ...
├── data/
│   └── scraped/              # Cached product data
├── hooks/                    # React hooks
├── lib/
│   ├── economicCalculator.ts # Financial calculations
│   ├── ecologicCalculator.ts # CO₂ calculations
│   └── recommendationEngine.ts
└── types/
tests/                        # Playwright E2E tests
```

## Data Sources

- **Solar irradiation:** [PVGIS](https://re.jrc.ec.europa.eu/pvg_tools/en/) via proxy
- **Product prices:** Scraped from FAZ Kaufkompass
- **Geocoding:** [Photon](https://photon.komoot.io/) (Nominatim-based)

## Testing

Run tests locally:

```bash
npm run dev   # Terminal 1
npm run test  # Terminal 2
```

For CI-equivalent environment:

```bash
npm run test:docker
npm run test:docker:down
```

## Deployment

The project uses GitHub Actions for CI/CD. On push to `main`:

1. Lint and test in Docker
2. SSH to server and rebuild containers

### Server Setup

1. Clone the repo on your server
2. Set GitHub secrets: `SSH_PRIVATE_KEY`, `SSH_KNOWN_HOSTS`
3. Configure reverse proxy (Nginx/Apache) to forward `/solacheck` to `localhost:3000`

Example Nginx config:

```nginx
location /solacheck {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}
```

## Tech Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4
- Playwright

## License

ISC
