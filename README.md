# TTB Label Verification Tool

An AI-powered alcohol beverage label compliance tool for TTB (Alcohol and Tobacco Tax and Trade Bureau) agents. Upload a label image and enter the corresponding COLA application data — the tool verifies all required fields in under 5 seconds.

## Live Demo

https://ai-powered-alcohol-label-verificati-nu.vercel.app

## Features

- **AI-powered extraction** — Claude vision model reads label text even from angled or imperfect photos
- **Field-by-field verification** — checks brand name, class/type, ABV, net contents, bottler info, country of origin, and government warning
- **Smart matching** — normalizes capitalization and punctuation for brand names (e.g. STONE'S THROW matches Stone's Throw)
- **Strict government warning validation** — enforces exact TTB language and required ALL CAPS formatting
- **Sub-5 second processing** — meets the hard performance requirement from agent feedback
- **Clean, accessible UI** — designed for users of all tech comfort levels
- **Batch upload tab** — foundation in place for multi-label processing

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Anthropic Claude API** (claude-sonnet for vision extraction)
- **Vercel** (deployment)

## Setup

1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO
```

2. Install dependencies
```bash
npm install
```

3. Create a `.env.local` file in the project root
ANTHROPIC_API_KEY=your-api-key-here

4. Run the development server
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## How It Works

1. Agent uploads a label image (JPG, PNG, or WEBP)
2. Agent enters the submitted COLA application data into the form
3. The image is sent to Claude's vision API with a structured extraction prompt
4. Claude returns a JSON object with all detected TTB label fields
5. The verification engine compares extracted vs. expected values:
   - Brand name: case-insensitive, punctuation-normalized comparison
   - ABV: parsed numerically with 0.1% tolerance
   - Government warning: exact text match with ALL CAPS enforcement
   - All other fields: normalized string comparison
6. Results are displayed field-by-field with pass/fail/review status

## Assumptions & Tradeoffs

- **No database or auth** — this is a stateless prototype; production would require agent authentication and audit logging
- **Batch mode UI** is scaffolded but not fully implemented — the backend supports parallel processing via `Promise.all`, the frontend just needs a CSV parser and multi-file uploader
- **Government warning** is validated against the standard TTB text; edge cases like bilingual labels are flagged for manual review
- **ABV tolerance** is set to ±0.1% to account for label rounding per TTB guidelines
- Images are processed in memory and never stored