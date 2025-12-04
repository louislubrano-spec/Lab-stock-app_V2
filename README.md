# Stock Manager PWA

A mobile-optimized web application for recording stock movements (IN, OUT, INVENTORY) and exporting them to Excel formatted for lab management.

## 🚀 How to use this project

This project is a **Vite + React** application.

### 1. Installation

1. Download all the files.
2. Open a terminal in the folder.
3. Run `npm install` to install dependencies.
4. Run `npm run dev` to start the local server.

### 2. Deployment on GitHub Pages

1. Create a new repository on GitHub.
2. Push all files to the repository.
3. Go to **Settings** > **Pages**.
4. Source: `GitHub Actions`.
5. Create a workflow file at `.github/workflows/deploy.yml` with standard static site deployment config, OR simply run `npm run build` locally and upload the contents of the `dist/` folder to a `gh-pages` branch.

**Easiest way (Manual):**
1. Run `npm run build` locally.
2. This creates a `dist` folder.
3. Upload the contents of the `dist` folder to your web server or GitHub repository.

## ✨ Features

- **PWA**: Can be installed on Android/iOS home screens.
- **Excel Export**: Generates `.xlsx` files compatible with the requested structure (Data starts at Row 7).
- **Offline Capable**: Works without internet once loaded (if configured with service workers, currently basic static site).
