# Ano'ng Uulamin Ko? — Ulam Picker

Hirap mamili ng ulam? I-roulette mo na!

A mobile-first web app that helps boarding house residents randomly choose a meal (ulam) using a slot-machine style roulette picker. Built with HTML, CSS, and vanilla JavaScript — no backend or database required.

## Features

- **Roulette Spin** — Slot-machine animation with smooth deceleration
- **Local Images** — Ulam photos loaded from `data/ulam/` folder
- **Confetti Celebration** — Canvas-based confetti burst on every pick
- **Pick History** — Shows last 10 picked ulams
- **Consecutive Duplicate Prevention** — Won't pick the same ulam twice in a row
- **Responsive** — Mobile, Tablet, Desktop
- **No Backend Required** — Pure HTML/CSS/JS, deployable on GitHub Pages or Vercel

## Folder Structure

```
/
├── index.html
├── README.md
├── css/
│   └── style.css
├── js/
│   └── app.js
├── data/
│   ├── ulams.json
│   ├── think.png
│   └── ulam/
│       ├── Pritong-Itlog.jpg
│       ├── Nilagang Itlog.jpg
│       ├── Scrambled Egg.jpg
│       └── ...
└── assets/
    └── icons/
```

## How to Add or Change Ulams

1. Add your image to `data/ulam/` (JPG or PNG)
2. Edit `data/ulams.json` and add an entry:
   ```json
   { "name": "Ulam Name", "image": "data/ulam/your-image.jpg" }
   ```

## How to Run Locally

```bash
npx serve .
```

Or open with VS Code Live Server.

## Tech Stack

- HTML5
- CSS3 (custom properties, flexbox, animations)
- Vanilla JavaScript (no frameworks)
- Canvas API (confetti)
- Google Fonts (Poppins)

## Deploy

Deploy the entire repository to GitHub Pages or Vercel without any configuration.

---

Created by [Samael](https://samaelcode.vercel.app)
