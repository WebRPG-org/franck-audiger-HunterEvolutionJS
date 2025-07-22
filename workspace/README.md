# Deployment Scripts

The `workspace/` folder contains various scripts used to push the game to the remote server. They can be run manually or via the GitHub workflows.

- `deploy-dev.sh` – copies the current version to the site's *dev* environment. Used when pushing to the `main` branch.
- `release.sh` – deploys a tagged version to the public site and generates the desktop distribution archive. Triggered when creating a Git tag.

These scripts are invoked by the `.github/workflows/` files that automate deployments over SSH.
