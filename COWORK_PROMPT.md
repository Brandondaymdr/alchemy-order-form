# Cowork / Claude Code Starter Prompt

Copy and paste this entire prompt into Claude Code or Cowork when starting a new session:

---

## PROMPT START

Read the CLAUDE.md file in the project root first. It has the complete codebase audit, every function with line numbers, data shapes, and exact requirements.

The project is the Alchemy Order Form — a React/Vite inventory tracking app at `Desktop/Storage/Claude/alchemy-app`. GitHub: https://github.com/Brandondaymdr/alchemy-order-form

### Current State

The app is functional with: setup flow, weekly inventory tracking (begin/end/usage/suggest/order/next), par levels, history archive, dark/light themes, and close week rollover. All in a single `src/App.jsx` file (630 lines) with data in `src/data.js` (164 items, 13 vendors).

### Tasks — In This Order

**Task 1: Create New Vendor**
The Add Item modal (App.jsx line 419-442) currently has a `<select>` dropdown that only shows existing vendors. Replace it with a combobox pattern — a text input with a datalist of existing vendors that also allows free-text entry for creating new vendors. When a new vendor name is entered:
- It should automatically get a color (auto-assign from a preset palette of unused colors, or let user pick)
- Store custom vendor colors in localStorage alongside VENDOR_COLORS
- The new vendor should immediately appear in all vendor filter dropdowns, the Order Summary, and Par Levels

**Task 2: Improve Add Item Under Vendor**
Building on Task 1, update the Add Item modal so:
- The category field has autocomplete/suggestions from existing categories
- After adding an item, scroll to or highlight it in the current view
- The new item should immediately appear in Weekly Count with the correct vendor grouping

**Task 3: Rebuild Vendor Order View (Orders Tab)**
This is the biggest change. The current Orders tab (line 524-543) is a read-only list. Rebuild it as the primary ordering interface:

For each vendor, show an expandable card/section containing:
- Vendor header with color accent, vendor name, and summary stats (X items need ordering, Y total units)
- A table/list of ALL items for that vendor (not just ones with orders), showing:
  - Item name and category
  - Current inventory (ending inventory if entered, otherwise beginning)
  - Par level
  - Suggested order
  - **Editable** Actual Order input field (same as in Weekly Count)
- Items that need ordering (suggested > 0) should be visually highlighted or sorted to top
- A "Copy Order" button per vendor that copies the vendor's order list to clipboard as plain text (item name + quantity, one per line) — for calling in phone orders

Keep the existing vendor color system. Use the theme `t` object for all colors.

**Task 4: First Week Order Entry**
After setup completes (the `handleSetupComplete` function, line 245), automatically navigate the user to the Orders tab (`setView('orders')`) so they can enter their initial orders. Show a brief toast or banner: "Setup complete! Enter your first order below."

### Rules

1. Keep everything in App.jsx — don't split into separate component files
2. Plain JavaScript only, no TypeScript
3. All styling via inline CSS objects using the `t` theme variable
4. All data persistence via the existing `store` helper (localStorage)
5. Preserve existing VENDOR_COLORS — extend, don't replace
6. All number inputs should support decimals (step="0.1")
7. Use the existing `save()` debounce pattern for localStorage writes
8. Test the Close Week flow after changes — beginningInventory must roll correctly
9. After all changes, run `npm run build` to verify no build errors

### After Completing All Tasks

Run `npm run build` to verify the production build works, then:
```bash
git add .
git commit -m "Add create vendor, improve add item, rebuild order view, first week flow"
git push origin main
```

## PROMPT END
