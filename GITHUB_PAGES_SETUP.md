# Deploy to GitHub Pages - Complete Guide

Your Quiz Interactive app is configured for GitHub Pages deployment. Follow these steps:

## Automatic Deployment (Recommended)

The app will **automatically deploy** when you push to the `main` branch using GitHub Actions.

### Step 1: Enable GitHub Pages
1. Go to your GitHub repository: https://github.com/CHAKRI-GUPTHA/quiz_interactive
2. Click **Settings** → **Pages**
3. Under "Build and deployment":
   - Source: Select **Deploy from a branch**
   - Branch: Select **gh-pages** and **/ (root)**
4. Click **Save**
5. Wait 1-2 minutes for deployment

### Step 2: Just Push Your Code
```bash
git add .
git commit -m "Your message"
git push origin main
```

GitHub Actions will automatically:
- ✅ Build your app
- ✅ Deploy to GitHub Pages
- ✅ Create a `gh-pages` branch

### Step 3: Access Your Live App
🔗 **https://chakri-guptha.github.io/quiz_interactive/**

---

## Manual Deployment (If Auto Deploy Doesn't Work)

### Install GitHub Pages CLI
```bash
npm install --save-dev gh-pages
```

### Update package.json
Add these scripts:
```json
"scripts": {
  "build": "vite build",
  "deploy": "npm run build && gh-pages -d dist"
}
```

### Deploy Manually
```bash
npm run deploy
```

---

## How It Works

1. **GitHub Actions Workflow**: Automatically runs when you push to `main`
   - File: `.github/workflows/deploy.yml`
   - Builds: `npm run build`
   - Deploys: to `gh-pages` branch

2. **GitHub Pages Hosting**: Serves files from `gh-pages` branch
   - URL: `https://chakri-guptha.github.io/quiz_interactive/`
   - Updated automatically after deployment

3. **Vite Configuration**: Routes adjusted for subdirectory
   - File: `vite.config.js`
   - Base path: `/quiz_interactive/`

---

## Features on GitHub Pages

✅ **Works Fully Offline** - All data in localStorage  
✅ **No Backend Required** - Frontend only (localStorage)  
✅ **All Features Included**:
- Teacher portal & quiz creation
- Student management
- Password protection
- Multi-attempt tracking
- Analytics dashboard

---

## Troubleshooting

### Issue: Files not loading (404 errors)
- **Cause**: Base path not set correctly
- **Solution**: Check `vite.config.js` has `base: '/quiz_interactive/'`

### Issue: GitHub Pages not showing updates
- **Solution**: GitHub Actions may take 1-2 minutes
  - Check: Settings → Pages → Check deployment status
  - Or: Go to Actions tab to see build status

### Issue: Using old content
- **Solution**: Hard refresh browser: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)

---

## Next Steps

1. ✅ Settings → Pages → Enable GitHub Pages (use gh-pages branch)
2. ✅ Push code to main: `git push origin main`
3. ✅ Wait 1-2 minutes for deployment
4. ✅ Visit: https://chakri-guptha.github.io/quiz_interactive/

---

## How to Use the App on GitHub Pages

### Teacher Login (Create Quizzes)
- **ID**: `1`
- **Password**: `1`

### Student Login
- Teacher creates students in "Manage Students"
- Students login with their credentials
- All data stored locally (no server needed!)

---

## Deployment Status

Check deployment status:
1. Go to: https://github.com/CHAKRI-GUPTHA/quiz_interactive
2. Click: **Actions** tab
3. See build status and history

---

## 📚 Additional Resources

- **Vite Docs**: https://vitejs.dev/guide/static-deploy.html
- **GitHub Pages Docs**: https://docs.github.com/en/pages
- **React Router**: Works with hash routing on GitHub Pages

---

## Support

All features of Quiz Interactive work perfectly on GitHub Pages:
- No backend required (uses localStorage)
- All data persists in browser
- Share the link with anyone
- Works on mobile browsers too!

Visit now: 🔗 **https://chakri-guptha.github.io/quiz_interactive/**
