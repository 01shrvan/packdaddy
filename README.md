# packdaddy

Dependency cleanup CLI and landing page.

## Local CLI testing

`packdaddy` is not published to npm yet, so this will fail until release:

```bash
pnpm dlx packdaddy@latest
```

Run the built CLI directly from this repo:

```bash
pnpm --filter packdaddy build
node packages/cli/dist/index.js --cwd "../align-dev" --unused --size
```

Install the local build as a global command while developing:

```bash
pnpm --filter packdaddy build
pnpm --filter packdaddy link --global
```

Then run this inside any JavaScript project:

```bash
packdaddy --unused --outdated --size
```

## Web app

```bash
pnpm --filter web dev
pnpm --filter web build
```
