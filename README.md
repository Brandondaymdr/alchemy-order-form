# Alchemy Order Form

Bar/cafe inventory tracking and ordering system for Crowded Barrel's Alchemy bar.

## Features
- **Setup Flow**: First-run onboarding to enter beginning inventory and par levels
- **Weekly Cycle**: Beginning → End Count → Usage → Suggested Order → Actual Order
- **Dark/Light Mode**: Toggle in header or settings
- **Par Levels**: Set minimums, get automatic reorder suggestions
- **Order Summary**: Vendor-grouped order list for easy ordering
- **History**: 52-week archive of closed weeks
- **Variance Alerts**: Catches negative usage from count errors

## Deploy to Vercel

### Option A: CLI (fastest)
```bash
npm install -g vercel
cd alchemy-app
vercel
```

### Option B: GitHub → Vercel
1. Push this folder to a GitHub repo
2. Go to vercel.com → New Project → Import the repo
3. It auto-detects Vite and deploys

### Option C: Drag & Drop
1. Run `npm run build` locally
2. Go to vercel.com → New Project → drag the `dist` folder

## Local Development
```bash
npm install
npm run dev
```

## Data Storage
All data is stored in the browser's localStorage. Each browser/device maintains its own data.
