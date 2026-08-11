# Pushing this to GitHub

1. Unzip this folder locally and `cd` into it.
2. Install dependencies and confirm it runs:
   ```bash
   npm install
   npm run dev
   ```
3. Create the GitHub repo (pick one):

   **Option A — GitHub CLI** (if you have `gh` installed and logged in):
   ```bash
   gh repo create "AI PMM Engine" --public --source=. --remote=origin --push
   ```
   That single command creates the repo, sets the remote, and pushes in one step —
   skip to step 5 if you use this.

   **Option B — GitHub website:**
   Go to github.com → New repository → name it `AI PMM Engine` → don't initialize
   with a README (you already have one) → Create repository.

4. If you used Option B, initialize git locally and push:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: AI PMM Engine"
   git branch -M main
   git remote add origin https://github.com/<your-username>/AI-PMM-Engine.git
   git push -u origin main
   ```
   (GitHub will show you this exact remote URL on the new repo's page.)

5. Optional — deploy it live (Vercel or Netlify both auto-detect Vite):
   ```bash
   npx vercel
   ```
   or drag the `dist/` folder (after `npm run build`) into Netlify's dashboard.
