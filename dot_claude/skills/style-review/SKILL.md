---
name: style-review
description: Review code style and quality: precise types, named constants, guard clauses, extraction, narrow inputs, file structure, and coupling. Use when auditing a module, file, or PR for style and quality before publishing or merging. Returns a prioritized list of findings with file:line references.
---

# Code Review: Publish-Readiness

Review code against the principles below. For each finding, cite `file:line`, name the principle violated, and suggest the fix in one sentence. Group findings by severity: **blocking** (would embarrass a published crate/library), **important** (degrades long-term maintainability), **minor** (style or polish).

Stop after findings — do not implement fixes unless asked.

---

## Principles (ordered: most foundational first)

### 1. Precise types

Every value has a type that describes its structure. Avoid `any`, `object`, raw `String` for structured data, or untagged `i32`/`f64` for domain values with units.

- If a value has multiple meaningful components, it is a struct with named fields — not a string with an implicit format.
- Unit-qualify numeric field names: `weight_lb`, `price_usd`, `timeout_ms`.
- Booleans named `is_X` / `has_X`; avoid flag integers.
- Use `readonly` / `&` / immutable wrappers where mutation is not intended.

**Smell**: `.split(' ')` on a name field; `price: f64` without denomination; `status: i32` encoding an enum.

### 2. Discriminated return types for fallible functions

Functions that can fail meaningfully return a discriminated union (Rust: `Result<T, E>` with a typed error enum; TypeScript: `{ kind: 'ok', ... } | { kind: 'err', reason: ... }`). Avoid:
- `Option<String>` where `None` could mean several different things
- sentinel values (`-1`, `""`, `"error"`)
- `anyhow::Error` at internal boundaries (fine at the top; too coarse inside)

### 3. Guard clauses — preconditions at the top

Validate at the top with early returns. The happy path runs at indentation level 1. Invert any `} else { return err; }` at the bottom of a long block.

**Smell**: more than 2 levels of nesting for validation logic.

### 4. Extract until the top reads like a summary

A function body should read like a paragraph: what this operation *means*, not how it works. Arithmetic, loops, magic numbers, and string formatting belong in named helpers.

**Test**: can you describe what the function does by reading only its body, without opening any helper? If no, keep extracting.

**Smell**: a comment labeling a block (`// calculate subtotal`) — that comment is a function name in disguise.

### 5. Names describe meaning, not mechanism

- Functions: `calculate_subtotal`, not `process_items`
- Variables: `member_discount`, not `d` or `disc`
- Avoid abbreviations unless they are universally unambiguous in the domain (`url`, `id`, `rgb`)
- Boolean functions: `is_supported_country`, not `check_country`

### 6. Named constants; non-obvious constants get a *why* comment

Every magic number becomes a named constant. Constants that encode a non-obvious decision get a comment explaining *why* — not *what* (the name does that), but the history, tradeoff, or source.

**Good comment target**: a tax rate frozen for a compliance reason, an exponent fit to empirical data, a timeout derived from a postmortem.

**Bad comment target**: `// the multiplier` above `const MULTIPLIER`.

### 7. Delete comments that restate the code

`// calculate subtotal` above `calculate_subtotal(items)` is noise. Keep comments that record decisions a future reader could not reconstruct from the code alone.

### 8. One file per concept; folder when a concept has 3+ files

- Each file holds one idea and its helpers.
- Concepts with internal structure become folders with a public re-export at the root (`mod.rs` / `index.ts`).
- Consumers import from the folder root, never from internal submodules.

**Smell**: a 600-line file mixing validation, calculation, formatting, and display logic.

### 9. Narrow inputs — functions take the least they need

A function that takes `Order` when it only uses `order.customer.name` is falsely coupled to the whole `Order`. Declare the narrowest shape the function actually uses. In Rust: take `&PersonName` not `&Customer`; pattern-match in the signature where helpful.

**Smell**: `fn format_greeting(order: &Order)` — reaches three levels deep to get a name.

### 10. Value drilling happens at the boundary, exactly once

One place in the codebase — the orchestrator / entry point — knows the full shape of the outer type. Everything downstream receives pre-extracted pieces. If `order.customer.name.first` appears in more than one file, that's a signal drilling has escaped the boundary.

### 11. Test structure: nested modules over banner comments

Banner comments (`// -------`) used to divide test sections are a code smell. Use nested `mod` blocks instead — they create named, navigable scopes and make the test structure visible to tooling.

**Smell**: `// --- Cycle 1: enter returning Err ---` dividing a flat list of `#[test]` functions.

**Fix**: `mod enter_error { ... }` containing the relevant tests.

### 12. Test structure: parametric helpers over duplicated test bodies

When several `#[test]` functions share the same shape and differ only in inputs or expected values, extract a non-test helper that accepts those values as parameters. Each `#[test]` then calls the helper with one concrete scenario. This keeps test names as the specification and eliminates copy-paste drift.

**Smell**: three `#[test]` functions with identical bodies except for one literal.

**Fix**: `fn check(input: X, expected: Y) { ... }` called from three slim `#[test]` wrappers.

---

## Severity definitions

| Level | Meaning |
|---|---|
| **Blocking** | A reader would distrust the codebase; would flag in a crate review; hides bugs |
| **Important** | Makes the code harder to change safely; will compound over time |
| **Minor** | Polish; matters for a published library but won't cause bugs |

---

## Output format

```
## Blocking

- `src/foo.rs:42` — **Precise types**: `name: String` parsed with `.split(' ')` at line 87; split into `first_name`/`last_name` fields.

## Important

- `src/bar.rs:12` — **Named constants**: `0.08` appears inline; extract as `TAX_RATE` with a comment on why it's flat.

## Minor

- `src/baz.rs:3` — **Names**: `fn do_calc()` → `fn calculate_subtotal()`.
```