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
If only branch publishing is available, build the same /MoneyPool/ output and publish the contents of dist (not its parent directory) on a dedicated gh-pages branch with a .nojekyll file. Select gh-pages and /(root) in Pages settings. Do not publish source files or overwrite main. GitHub does not trigger branch-based Pages builds for pushes made with the default Actions GITHUB_TOKEN.
