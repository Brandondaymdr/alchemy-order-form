# Alchemy Order Form — Project Instructions

## Pushing Files to GitHub

### First Time (if you haven't cloned the repo locally yet)

```bash
cd Desktop/Storage/Claude/alchemy-app

# If this isn't already a git repo, initialize and connect:
git init
git remote add origin https://github.com/Brandondaymdr/alchemy-order-form.git
git pull origin main
```

### Adding CLAUDE.md and INSTRUCTIONS.md to the Repo

```bash
cd Desktop/Storage/Claude/alchemy-app

# Copy the files into your project root (if they're not already there)
# Then:
git add CLAUDE.md INSTRUCTIONS.md
git commit -m "Add CLAUDE.md and INSTRUCTIONS.md for project documentation"
git push origin main
```

This will push both files to GitHub and auto-trigger a Vercel rebuild (the .md files won't affect the app build — they're just documentation).

### For Any Future Changes

```bash
cd Desktop/Storage/Claude/alchemy-app
git add .
git commit -m "Describe what changed"
git push origin main
```

Vercel auto-deploys every push to `main`.

---

## Function Checklist

### What's Already Built & Working

| Function | How It Works | Where |
|----------|-------------|-------|
| **Set Par Levels** | Par Levels tab — each item has editable par input, also set during setup | App.jsx line 546-567 |
| **Suggested Order** | Auto-calculated: `ceil(par - ending)`. Clickable button to auto-fill Actual Order | App.jsx line 265, 506-508 |
| **Actual Order** | Editable ORDER column in Weekly Count. Staff types what they want to order | App.jsx line 510-512 |
| **Next Week from Actual Order** | Close Week sets `nextBeginning = ending + actualOrder` | App.jsx line 278-291 |
| **Add Item (partial)** | Modal with vendor select, category text, name text | App.jsx line 271-276, 419-442 |
| **Initial Setup** | Welcome screen → enter beginning inventory + par levels → start tracking | App.jsx line 49-194 |

### What Needs to Be Built or Updated

| Function | Status | What's Needed |
|----------|--------|---------------|
| **Create New Vendor** | ❌ Missing | Vendor field in Add Item modal only has `<select>` of existing vendors. Need combobox allowing free-text entry for new vendors. Auto-assign or pick vendor color. |
| **Create Item Under New Vendor** | ⚠️ Blocked | Depends on Create New Vendor. Once that works, items can be added under any vendor. Also add category autocomplete. |
| **Vendor Order View** | ⚠️ Needs rework | Orders tab is read-only list. Needs to become the primary ordering UI: show ALL items per vendor, editable order fields, vendor totals, print/copy support. |
| **First Week Order Entry** | ⚠️ Missing step | After setup, user should be guided to enter their first order (or auto-navigate to Orders tab) so next week's beginning is correct. |

---

## How the App Works (for reference)

### Weekly Cycle

1. **Beginning Inventory** — Auto from last week (ending + orders)
2. **Ending Inventory** — Staff enters physical count
3. **Usage** — Auto: beginning - ending
4. **Suggested Order** — Auto: par - ending (if below par)
5. **Actual Order** — Staff enters what they actually order
6. **Close Week** — Archives, sets next week's beginning = ending + actual order

### Vendor Order View (What It Should Become)

When staff need to call HEB to place an order, they should:
1. Go to the Orders tab
2. Click on "HEB"
3. See ALL 88 HEB items with their ending inventory, par level, suggested order
4. Enter or adjust actual order amounts for each item
5. See a total at the top ("12 items, 47 units total")
6. Optionally print or copy the order list

This is the most important view for day-to-day operations.

---

## Data Storage

All data lives in browser localStorage. Each browser/device has independent data.

- ✅ No login needed, works offline
- ❌ Can't sync between devices
- ❌ Clearing browser data deletes everything

Staff should use the **same device and browser** every time.

---

## Contact

**Brandon Day** — Owner/Developer
- GitHub: Brandondaymdr
- Crowded Barrel / Alchemy Bar
