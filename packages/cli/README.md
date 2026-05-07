# packdaddy

Dependency cleanup CLI for modern JavaScript projects.

## Usage during local development

Build:

```bash
pnpm --filter packdaddy build
```

Run against another project:

```bash
node packages/cli/dist/index.js --cwd "../align-dev" --unused --size
```

Link globally:

```bash
pnpm --filter packdaddy link --global
```

Use from any project:

```bash
packdaddy --unused --outdated --size
```
