# CLAUDE.md — Alchemy Order Form

> **For Claude Code / Cowork:** This file contains everything you need to understand, audit, and continue building this project. Read it fully before making any changes.

---

## Project Overview

**Alchemy Order Form** is a weekly bar/cafe inventory tracking and ordering system built for **Crowded Barrel's Alchemy bar** in Austin, TX. It replaces an Excel spreadsheet with a React web app that automates inventory calculations, generates order suggestions, and archives weekly data.

- **Live URL:** https://alchemy-order-form.vercel.app
- **GitHub:** https://github.com/Brandondaymdr/alchemy-order-form
- **Local Path:** `Desktop/Storage/Claude/alchemy-app`

---

## Tech Stack

- **Framework:** React 18 (JavaScript, NOT TypeScript) via Vite 5
- **Styling:** Inline CSS-in-JS objects (no CSS files, no Tailwind, no styled-components)
- **Data Persistence:** Browser localStorage via `src/store.js` (key prefix: `alchemy_`)
- **Deployment:** Vercel (auto-deploys from GitHub `main` branch)
- **Build Tool:** Vite with `@vitejs/plugin-react`
- **Package Manager:** npm
- **Fonts:** DM Sans (UI), JetBrains Mono (numbers/data)

---

## File Structure

```
alchemy-app/
├── src/
│   ├── App.jsx       # 630 lines — ALL components and UI (SetupScreen + main App)
│   ├── data.js       # 172 lines — DEFAULT_ITEMS array (164 items) + VENDOR_COLORS
│   ├── store.js      # 19 lines — localStorage wrapper (get/set/remove with 'alchemy_' prefix)
│   └── main.jsx      # React entry point (renders <App />)
├── index.html        # HTML shell
├── package.json      # react, react-dom, vite, @vitejs/plugin-react
├── vite.config.js    # Vite config
├── vercel.json       # SPA routing
├── README.md         # Deploy instructions
├── CLAUDE.md         # THIS FILE
└── INSTRUCTIONS.md   # Human-readable project docs
```

---

## Architecture Deep Dive

### State Management

Everything is in React useState hooks in the main `App()` component (line 200). No context, no Redux, no external state.

**Key state variables in App():**

| Variable | Type | Purpose |
|----------|------|---------|
| `theme` | `'dark'` / `'light'` | Current theme |
| `setup` | `object or null` | Setup completion config (`{done, startWeek, startLabel}`) |
| `items` | `array` | All inventory items with current `beginningInventory` |
| `pars` | `object` | Par levels keyed by item ID (`{i3: 5, i4: 2, ...}`) |
| `wd` | `object` | Current week data keyed by item ID (`{i3: {endingInventory: 2, actualOrder: 3}}`) |
| `hist` | `array` | Archived weeks (max 52), newest first |
| `view` | `string` | Active tab: `'count'`, `'orders'`, `'pars'`, `'history'`, `'settings'` |
| `vf` | `string` | Vendor filter (`'all'` or vendor name) |
| `search` | `string` | Search text |
| `sf` | `string` | Status filter (`'all'`, `'ok'`, `'low'`, `'out'`) |
| `col` | `object` | Collapsed vendor sections (`{HEB: true, ...}`) |
| `modal` | `boolean` | Add Item modal open/closed |
| `ni` | `object` | New item form (`{vendor, category, name}`) |
| `editBeg` | `object` | Which items have beginning inventory in edit mode |

### localStorage Keys (all prefixed with `alchemy_`)

| Key | Contents |
|-----|----------|
| `alchemy_theme` | `'dark'` or `'light'` |
| `alchemy_setup` | `{done, startWeek, startLabel, completedAt}` |
| `alchemy_items` | Full items array with current beginningInventory values |
| `alchemy_pars` | Par levels object |
| `alchemy_wk_YYYY-MM-DD` | Weekly data (endingInventory + actualOrder per item) |
| `alchemy_history` | Array of archived week entries |

### Data Shapes

**DEFAULT_ITEMS in data.js (setup only):**
```js
{id: "i3", v: "Specs", c: "Mixers", n: "Olive Juice", b: 0}
```

**Items in localStorage (after setup):**
```js
{id: "i3", vendor: "Specs", category: "Mixers", name: "Olive Juice", beginningInventory: 3}
```

**Weekly data (wd state / alchemy_wk_*):**
```js
{"i3": {endingInventory: 2, actualOrder: 3}, "i4": {endingInventory: 0, actualOrder: 5}}
```

**History entry:**
```js
{week: "2026-02-09", label: "2/9 – 2/15", data: {"i3": {beginning: 5, ending: 2, usage: 3, actualOrder: 3, suggested: 3}}}
```

---

## Core Formulas

```
usage = beginningInventory - endingInventory
suggestedOrder = max(0, ceil(parLevel - endingInventory))
nextWeekBeginning = endingInventory + actualOrder
status: out (inv <= 0 or inv <= par*0.5), low (inv <= par), ok (inv > par)
```

---

## Key Functions Reference (App.jsx)

| Function | Line | What It Does |
|----------|------|-------------|
| `weekLabel()` | 6 | Display label: "2/9 – 2/15" |
| `weekKey()` | 12 | Storage key: "2026-02-09" |
| `pn(v)` | 16 | Parses and validates numeric input |
| `beg(i)` | 261 | Gets beginning inventory for item |
| `end(i)` | 262 | Gets ending inventory from weekly data |
| `ord(i)` | 263 | Gets actual order from weekly data |
| `usage(i)` | 264 | Calculates usage (beg - end) |
| `sugg(i)` | 265 | Calculates suggested order (par - end, ceiled) |
| `status(i)` | 266 | Returns 'ok', 'low', or 'out' |
| `uf(id,field,val)` | 256 | Updates weekly field (endingInventory or actualOrder) |
| `up(id,val)` | 257 | Updates par level for item |
| `ub(id,val)` | 258 | Updates beginning inventory for item |
| `addItem()` | 271 | Creates new item, saves to localStorage |
| `closeWeek()` | 278 | Archives week, rolls beginning inventory forward |
| `resetApp()` | 293 | Clears ALL localStorage data |

---

## Feature Status & Required Updates

### ✅ WORKING — No Changes Needed

- Setup flow (welcome screen → inventory + pars entry → main app)
- Dark/Light mode toggle (header button + settings)
- Weekly Count view (Begin / End✎ / Usage / Suggest / Order✎ / Next columns)
- Par Levels tab (editable per item, grouped by vendor)
- History tab (expandable archived weeks)
- Settings tab (theme, reset)
- Search + vendor + status filters
- Variance alerts (negative usage flagged with ⚠)
- Debounced auto-save to localStorage
- Flow reminder breadcrumb (Begin → End → Usage → Suggest → Order → Next)
- Close Week archives and rolls inventory (nextBeginning = ending + actualOrder)

### 🔧 NEEDS BUILDING OR UPDATING

#### 1. CREATE NEW VENDOR — Missing

**Current:** Add Item modal (line 419-442) has a `<select>` dropdown for vendors that only shows existing vendors. No way to type a new vendor name.

**Required:** Allow typing a new vendor name in the Add Item modal. When a new vendor is entered:
- It should persist in the items list and appear in all vendor dropdowns/filters
- Auto-assign a color or let user pick one (store custom vendor colors in localStorage)
- The new vendor should appear in Order Summary, Par Levels, etc.

**Suggested approach:** Replace the vendor `<select>` with a combobox — text input with datalist of existing vendors, allowing free-text for new ones. Add a color picker or auto-assign from a preset palette.

#### 2. CREATE NEW ITEM UNDER VENDOR — Partially Working

**Current:** `addItem()` works but has gaps:
- Can only select existing vendors (blocked by issue #1 above)
- No autocomplete for categories
- New item doesn't scroll into view

**Required improvements:**
- Hook into Create New Vendor (once built)
- Add category autocomplete/suggestions from existing categories
- After adding, scroll to or highlight the new item in the list
- Confirm the item immediately appears in Weekly Count

#### 3. VENDOR ORDER VIEW (Order Summary) — Needs Rework

**Current:** Orders tab (line 524-543) is a simple read-only list of items where actualOrder > 0. Can't edit from this view. Not useful for actually placing orders.

**Required — build as the primary ordering interface:**
- Show each vendor as an expandable card/section
- Display ALL items for that vendor (not just ones already ordered)
- Show per item: current ending inventory, par level, suggested order, and EDITABLE actual order field
- Vendor summary header: total items needing orders, total quantity
- Staff should be able to do ALL their ordering from this one view
- Consider: print button or "copy to clipboard" per vendor for calling in orders
- This is what staff will look at when they pick up the phone to call HEB, Odeko, etc.

#### 4. INITIAL LAUNCH FIRST WEEK ORDER — Needs Enhancement

**Current:** Setup collects beginning inventory + par levels, then drops user into Weekly Count with no orders.

**Required:** After setup finishes, either:
- Add an optional step to enter "orders already placed" for the current week, OR
- Auto-navigate to the Orders tab so staff can enter their first order immediately

This ensures the next week's beginning inventory calculation is correct from day one.

---

## Item Catalog: 164 Items Across 13 Vendors

The app has 164 items (data.js). The original Excel had 162. The app has 7 items added after the Excel was created — these are intentional additions:

| ID | Vendor | Category | Name | Note |
|----|--------|----------|------|------|
| i169 | Amazon | Other | Stamp Pad | Added post-Excel |
| i170 | HEB | Spices | Nutmeg | Added post-Excel |
| i171 | Amazon | Packaging | Bottle Bags Paper | Added post-Excel |
| i172 | Amazon | Packaging | Bottle Bags Plastic | Added post-Excel |
| i173 | HEB | Snacks | Chip Variety Bag | Added post-Excel |
| i174 | Specs | Spirits | Sweet Vermouth | Added post-Excel |
| i175 | Specs | Spirits | Dry Vermouth | Added post-Excel |

3 items from the original Excel were NOT added because they're duplicates or merged (Olive Juice appears once in app, once in Excel).

### Vendor Summary

| Vendor | Items | Color | Primary Categories |
|--------|-------|-------|--------------------|
| HEB | 88 | #e03131 | Produce, Juice, Cleaning, Spices, Soda, Sweetener, Dairy |
| Odeko | 24 | #2b8a3e | Cups, Lids, Syrups, Tea, Chai, Matcha, Oat Milk |
| Amazon | 18 | #f08c00 | Gloves, Picks, Straws, Acids, Packaging, Mixers |
| ECOLAB | 5 | #1971c2 | Dishwasher chemicals |
| Greater Goods | 5 | #0c8599 | Coffee, Coffee machine cleaners |
| Kombucha | 5 | #e8590c | 5 kombucha flavors |
| Tincture | 5 | #9c36b5 | Heart, Lung, Kidney, Spleen, Liver |
| RNDC | 4 | #7048e8 | Wine (Chardonnay, Cabernet, Rose, Sparkling) |
| Specs | 3 | #d6336c | Olive Juice, Sweet Vermouth, Dry Vermouth |
| Sams Club | 2 | #4263eb | Bathroom towels, Hand soap |
| Twin Liquor | 1 | #5c940d | Blueberry Simple syrup |
| Kwik Ice | 1 | #3bc9db | Cube Ice |
| Other | 1 | #868e96 | Athletic (N/A Beer) |

---

## Theme System

Both themes are defined in `themes` object (line 19-38).

**Dark (default):** Gold accent (#ffd43b), near-black background (#0f1114)
**Light:** Burnt orange accent (#c2410c), off-white background (#f8f9fa)

Each theme defines: bg, bgCard, bgHover, bgInput, border, borderLight, borderInput, text, textMuted, textDim, textDimmer, accent, accentBg, accentText, ok, low, out, rowOut, rowLow, pillBg, modalBg.

---

## Development & Deployment

```bash
npm run dev          # Dev server at http://localhost:5173
npm run build        # Production build → dist/
npm run preview      # Preview production build locally

git add .
git commit -m "description"
git push origin main # Auto-deploys to Vercel
```

---

## Important Rules for AI Agents

1. **Plain JavaScript only** — no TypeScript
2. **Inline CSS objects only** — no CSS files, no Tailwind, no styled-components
3. **Single-file App.jsx** — don't split into multiple component files unless explicitly asked
4. **localStorage only** — no backend, no database, no APIs
5. **Keep the theme system** — all colors must come from the `t` theme object, never hardcoded
6. **Fractional quantities** — all number inputs use `step="0.1"` minimum
7. **Debounced saves** — use the existing `save()` pattern for localStorage writes
8. **Brand colors are sacred** — gold (#ffd43b) for dark mode, burnt orange (#c2410c) for light mode
9. **HEB has 88 items** — any vendor list UI must handle large item counts efficiently
10. **Staff are the users** — keep UI simple, clear labels, obvious workflow
11. **Test Close Week flow** — this is the most critical function; verify beginning inventory rolls correctly
12. **Preserve existing VENDOR_COLORS** — when adding new vendors, extend don't replace
