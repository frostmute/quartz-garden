# Quartz Garden 🌱

A digital garden powered by [Quartz](https://quartz.jzhao.xyz/) and Obsidian.

**Live Site:** https://quartz-garden.vercel.app

## Quick Start

### 1. Open in Obsidian

```bash
# Open this folder in Obsidian as a vault
File > Open Vault > Open folder as vault
# Select: quartz-garden/content/
```

### 2. Create Notes

- New notes go in `content/` folder
- Use `[[WikiLinks]]` to connect ideas
- Add frontmatter for metadata:
  ```yaml
  ---
  title: "My Note"
  date: 2026-02-14
  tags: [idea, draft]
  ---
  ```

### 3. Auto-Publish

Changes pushed to GitHub automatically deploy to Vercel.

```bash
git add .
git commit -m "New notes"
git push origin main
```

## Project Structure

```
quartz-garden/
├── content/          # Your notes (Obsidian vault)
│   ├── .obsidian/    # Obsidian config
│   ├── templates/    # Note templates
│   └── index.md      # Garden homepage
├── quartz/           # Quartz engine
├── public/           # Built site (generated)
└── vercel.json       # Vercel config
```

## Password Protection

Currently password-protected for testing. Options:

1. **Vercel Pro** ($20/mo): Native password protection
2. **Deployment Protection**: Vercel account required to view
3. **Remove protection**: Delete password from Vercel dashboard when ready

To set password (requires Vercel CLI):
```bash
vercel env add QUARTZ_PASSWORD
# Enter your password, select Production + Preview
vercel --prod
```

## Local Development

```bash
npm install
npx quartz build --serve
```

## Sync Options

### Option A: Obsidian Git Plugin (Recommended)
1. Install "Git" plugin in Obsidian
2. Configure auto-backup
3. Push triggers auto-deploy

### Option B: Manual Git
1. Edit notes in Obsidian
2. Commit & push via terminal

### Option C: GitHub Desktop
1. Point to this repo
2. Changes auto-detected
3. Commit & push

---

*Built with [Quartz v4](https://quartz.jzhao.xyz/)*
