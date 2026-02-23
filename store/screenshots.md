# Screenshot Guide — Smart Seek for YouTube TV

---

## Specs

| Store          | Required size(s)         | Format      | Count   |
|----------------|--------------------------|-------------|---------|
| Chrome         | 1280×800 or 640×400      | PNG or JPEG | 1–5     |
| Firefox        | Any (1:1 aspect or wider)| PNG or JPEG | 0–10    |
| Edge           | 1366×768 minimum         | PNG or JPEG | 1–10    |

**Recommended:** capture at **1280×800** — satisfies all three stores.

---

## Shots to capture

### 1. Seek OSD in action *(primary screenshot)*

Show the on-screen indicator appearing after a seek keypress.

**Steps:**
1. Open YouTube TV (`tv.youtube.com`) and start playing any video
2. Press `Shift+J` to seek backward — the circular arrow + seek amount label
   will appear in the centre of the screen
3. Screenshot while the OSD is visible (it fades out after ~1 s — use a
   screen-capture shortcut timed with the keypress, or use browser DevTools
   to pause the CSS animation)

**What it shows:** the core feature in context.

---

### 2. Toolbar popup

Show the popup with the seek amount controls and key binding display.

**Steps:**
1. Navigate to `tv.youtube.com` (any page)
2. Click the Smart Seek icon in the browser toolbar
3. Screenshot the open popup

**What it shows:** quick seek-amount adjustment without opening settings.

---

### 3. Options page

Show the full settings page.

**Steps:**
1. Right-click the toolbar icon → *Options*, or click "Open Settings" in the popup
2. Screenshot the options page (seek amount field + key binding inputs + Save/Reset buttons)

**What it shows:** full configurability.

---

## Tips

- Use a **clean browser profile** with no other extensions visible in the toolbar.
- YouTube TV's dark UI makes the OSD and extension UI contrast well — no extra
  preparation needed.
- If capturing the OSD is tricky, open DevTools → Elements, find the
  `.smart-seek-osd` element, and manually add the `smart-seek-osd--visible` and
  `smart-seek-osd--forward` classes to freeze it in the visible state.

---

## Promo tiles (Chrome/Edge, optional but recommended)

Chrome and Edge support promotional images shown in store search results.
These are marketing graphics, not screenshots.

| Image              | Size     |
|--------------------|----------|
| Small promo tile   | 440×280  |
| Large promo tile   | 920×680  |
| Marquee promo tile | 1400×560 |

Suggested content: extension name + icon on a dark background, with a
stylised YouTube TV player showing the seek OSD.
