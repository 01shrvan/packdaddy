# packdaddy

Dependency cleanup CLI and landing page.

## Quick start

```bash
npx packdaddy
npx packdaddy --all
npx packdaddy --fix
```

Or with other package managers:

```bash
pnpm dlx packdaddy
bunx packdaddy
yarn dlx packdaddy
```

## Local development

Build and run the CLI directly from this repo:

```bash
pnpm --filter packdaddy build
node packages/cli/dist/index.js --cwd "../my-app" --unused --size
```

Install the local build as a global command while developing:

```bash
pnpm --filter packdaddy build
pnpm --filter packdaddy link --global
packdaddy --unused --outdated --size
```

## Web app

```bash
pnpm --filter web dev
pnpm --filter web build
```
