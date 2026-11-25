# GitHub Pages demo
MoneyPool can be published as a free static demonstration at https://single-spider.github.io/MoneyPool/ after Pages is enabled. No Supabase or Cloudflare connection is needed. All transactions are simulated, and demo data is local to the browser.
## One-time owner setup
Open Settings > Pages (https://github.com/single-spider/MoneyPool/settings/pages), select GitHub Actions under Build and deployment > Source. If you cannot see the setting, use GitHub desktop browser view and check admin rights and repository/organization restrictions. The normal workflow token cannot enable a previously disabled Pages site. Never share a personal access token in chat or put it in source code.
## Deploy
Open Actions > Deploy MoneyPool demo to GitHub Pages, choose Run workflow on main. Pushes to main also trigger deployment. The workflow installs dependencies, runs tests, builds with MP_BASE_PATH=/MoneyPool/, tests the built site, uploads the Pages artifact and publishes it. If the configure/deploy step fails because Pages is disabled, complete the owner setup and rerun the workflow. Verify the deployment output URL before sharing.
## Local preview of the Pages build
On a POSIX shell:
```sh
MP_BASE_PATH=/MoneyPool/ npm run build
MP_BASE_PATH=/MoneyPool/ npm run preview
```
Open http://localhost:4173/MoneyPool/. On PowerShell set $env:MP_BASE_PATH='/MoneyPool/' first. Normal npm run build uses / for Cloudflare or local hosting. Do not add live Supabase environment variables to the GitHub Pages demo workflow.
## Branch publishing alternative
If the Pages deployment step fails after the demo build and tests pass, the workflow attempts to create a gh-pages branch containing only the compiled static output. It never overwrites an existing gh-pages branch. In Settings > Pages, select Deploy from a branch, gh-pages and /(root), then Save. If branch preparation is blocked by repository write permissions, download the moneypool-pages-demo artifact from the successful build job or build locally, and publish its contents (not the dist parent directory) on a dedicated gh-pages branch with a .nojekyll file. Do not publish source files or overwrite main. GitHub does not trigger branch-based Pages builds for pushes made with the default Actions GITHUB_TOKEN.

The fallback is a one-time static snapshot. To refresh branch-based hosting, manually commit a fresh verified build to gh-pages with an authorized user account; the Actions source is recommended for automatic updates. GitHub Pages must still be enabled by the owner or an administrator.
