# Contributing

Thanks for your interest in improving Krane's Market.

## Ground Rules

- Keep pull requests focused and small.
- Use TypeScript for app and backend code.
- Keep UX responsive across mobile and desktop.
- Do not commit secrets or credentials.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Start frontend + backend:

```bash
npm run dev:full
```

3. Run checks before submitting:

```bash
npm run typecheck
npm run lint
npm run build
```

## Branch and Commit Style

- Branch naming:
  - `feature/<short-name>`
  - `fix/<short-name>`
  - `docs/<short-name>`
- Commit message format:
  - `feat: ...`
  - `fix: ...`
  - `docs: ...`
  - `refactor: ...`
  - `chore: ...`

## Pull Request Checklist

- [ ] Feature or fix is scoped and documented.
- [ ] Typecheck, lint, and build pass.
- [ ] UI changes include updated screenshots or short notes.
- [ ] API changes are reflected in `README.md`.
- [ ] No unrelated refactors included.

## Reporting Bugs

Please include:

- Reproduction steps
- Expected behavior
- Actual behavior
- Browser/Node version
- Relevant logs/screenshots
