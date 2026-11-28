# StressEase 🧘

A simple stress assessment & relief website. Pure HTML + CSS + vanilla JavaScript — no build tools, no frameworks, no backend.

## Flow

1. **Profile** — name, age, gender (saved in the browser).
2. **Stress check (before)** — PSS-10 questionnaire (0–40) → stress level (Low / Moderate / High).
3. **Yoga routine** — video + pose images chosen for the stress level.
4. **Stress check (after)** — same PSS-10 questions again.
5. **Before vs After** — shows whether stress decreased.

## Run it locally

Just open `index.html` in a browser. That's it.

(Audio playback is more reliable if you serve it instead of opening the file directly. Optional: run `python -m http.server` in this folder and visit http://localhost:8000.)

## Host it for free

It's fully static, so any static host works:

- **Netlify / Vercel** — drag-and-drop this folder, or connect a GitHub repo. Free.
- **GitHub Pages** — push to a repo, enable Pages. Free.

## Editing content

- **Questions, answers, scores, thresholds, stress bands** → `data.js`
- **Yoga routines & media file names** → `YOGA_ROUTINES` in `data.js`
- **Media files** → put real images/audio in the `media/` folder (see `media/README.txt`)
- **Look & feel** → `styles.css`

## Files

```
index.html    page shell
styles.css    styling
data.js       all questions, scores, thresholds, yoga routines (DUMMY content)
app.js        app logic / screen flow
media/        your images & audio (placeholders used if missing)
```
