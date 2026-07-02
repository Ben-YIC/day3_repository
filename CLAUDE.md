# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

Training lab (SPELIX Day 3, "brownfield refactoring") for practicing safe refactoring workflows. `legacy.js` was originally a deliberately bad ~300-line monolith (poor naming, N+1 query simulation, mixed concerns, no tests). The lab's expected sequence — captured in `README.md` — is:

1. **Phase 1 — Understand before touching.** Explain functions, no code changes.
2. **Phase 2 — Characterisation tests first.** Add Jest tests in `/tests` documenting *current* behavior before any refactor. Production code must not change; all tests must pass on the original code.
3. **Phase 3 — Refactor with safety net.** Split into smaller modules with better naming, running `npm test` after every step (must stay green), committing after every passing step.

This repo's git history already shows Phase 3 completed (`legacy.js` logic was extracted into `src/db.js`, `src/orders.js`, `src/reports.js`, `src/format.js`). `legacy.js` is now a thin backward-compatible facade re-exporting the same short-named API (`q`, `qa`, `ql`, `cnt`, `fmt`, `calc`, `chk`, `upd`, `proc`, `getAll`, `top`) so existing callers/tests keep working. `tests/legacy.characterization.test.js` still exercises the module through this facade and must keep passing — it's the safety net proving the refactor preserved behavior.

## Tech Stack

- **Node.js**: v18+
- **Framework**: Express
- **Database**: SQLite
- **Testing**: Jest

## Commands

```bash
npm install
npm test          # run the full Jest suite
npx jest tests/db.test.js         # run a single test file
npx jest -t "some test name"      # run tests matching a name
There is no lint/build script — npm test is the only checked command.

Architecture
legacy.js is a facade only; real logic lives in src/, layered as:

src/db.js — data access. In-memory tables (customers, products, orders, orderLines) keyed by single-letter table codes (c, p, o, l) in a tables map. getById(t, k) / getAllRows(t) / getOrderLines(orderId) do linear scans and increment a module-level queryCount (exposed via getQueryCount) — this counter is how N+1 query behavior is made visible/testable, so any change to lookup patterns changes counts tests may assert on.

src/orders.js — business logic: calculateOrderTotal, validateOrder, updateOrderStatus. Depends on db.js only.

src/reports.js — reporting/listing built on db.js, orders.js, and format.js (listOrdersByStatus, topSellingProducts, generateMonthlyReport).

src/format.js — pure display formatting (formatMoney, comma-grouped $ amounts). Do not change its output shape — accounting depends on the current format.

Dependency direction is strictly reports -> orders -> db and reports -> format; db.js and format.js have no internal dependencies. Keep new code within this layering rather than reaching across it.

Data field abbreviations (src/db.js)
Records use short field names carried over from the original data import: n=name, t=tier, d=discount, ct=city, pr=price, st=stock, cid=customer id, dt=date, s=status, oid/pid=order/product id, q=qty.

Business rules encoded in src/orders.js
Order total = sum(line qty × product price), minus discount (customer tier discount d, plus an extra 3% if total quantity across the order is ≥500 units), plus 8% tax — but tax is skipped for cancelled orders.

validateOrder checks: order exists, not cancelled, has order lines, all products exist, all quantities are positive and within stock.

updateOrderStatus allows transitions except: no reopening a DONE order back to OPEN, and no changes to an already-CANCELed order. Returns a pipe-delimited audit log string (OK|id|old->new|customerName or ERR|id|reason) — format is relied upon by callers/tests, don't change it silently.

Working in this repo
Naming Convention: Use camelCase for variables and functions, and kebab-case for routes and file names.

Testing: All tests must be placed in the /tests directory and can be executed by running npm test.

Since this is a refactoring-lab repo, when asked to make further changes, follow the same discipline already established in history: characterization tests (or reuse of existing ones) before behavior changes, small commits, npm test green after every step.

legacy.js's public API and src/format.js's output format are behavior contracts other code/tests depend on — treat changes to their shape as breaking unless explicitly asked for.