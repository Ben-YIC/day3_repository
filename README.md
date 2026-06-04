# SPELIX Legacy Module (Claude Code Training — Day 3)

A deliberately bad ~300-line legacy module (`legacy.js`) for the Day 3
brownfield refactoring lab. It contains intentional anti-patterns:

- Poor naming (single-letter variables, vague function names)
- N+1 query simulation (per-row lookups inside loops — watch `cnt()`)
- Mixed concerns (data access + business logic + formatting in one file)
- No tests

**Do not "fix" it before completing Phase 1 and 2 of the lab.**

## Setup

```bash
npm install
npm test        # passes (no tests yet — you will write them)
```

## Lab workflow (summary)

1. **Phase 1 — Understand before touching.** Ask Claude to explain each
   function. No code changes.
2. **Phase 2 — Characterisation tests first.** Ask Claude to write Jest tests
   in `/tests` that document the *current* behavior. Production code must not
   change. All tests must pass on the original code. Commit.
3. **Phase 3 — Refactor with safety net.** Split into 2–3 smaller modules
   (e.g. data access / business logic / formatting) with better naming.
   Run `npm test` after every step — must stay green. Commit after every
   passing step (aim for 5+ small commits).

## Module entry points

```js
const m = require('./legacy');
m.proc('2026-02');     // monthly report (string)
m.calc(1002);          // order total (number)
m.chk(1005);           // order validation ('OK' or 'NG: ...')
m.getAll('OPEN');      // orders by status (array)
m.top(3);              // top products by units (array)
m.upd(1005, 'DONE');   // status update, returns audit log line
m.cnt();               // how many "queries" have run so far
```
