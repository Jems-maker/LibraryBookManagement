# AI Development Guidelines

## General Principles

- Generate concise, maintainable solutions for new modules and features.
- Prefer simplicity over clever or overly abstract implementations.
- Avoid over-engineering.
- Watch for oversized files that should be refactored.
- Maintain consistent coding style, formatting, and naming across the project.
- Identify and fix obvious bugs when encountered.
- Keep code and documentation concise and precise.
- Use no emojis or decorative characters in comments or documentation.
- Create or update `/docs/activity-log.md` after significant development changes.
- Maintain a `/docs/todo.md` for pending work and technical debt.
- Propose major architectural or breaking changes before implementing them.
- Review existing files before modifying or refactoring them.
- Markdown files must use kebab-case filenames (e.g. `authentication-design.md`).
- Never auto-commit documentation or activity logs.
- Comments should be one line and one sentence whenever possible.

---

# Architecture

## Project Structure

- Keep modules focused on a single responsibility.
- Separate business logic from presentation and infrastructure.
- Organize code by feature rather than by file type where practical.
- Avoid circular dependencies.
- Keep public interfaces minimal.
- Favor composition over inheritance.

## Scalability

- Design for future growth without unnecessary complexity.
- Use pagination for large datasets.
- Avoid loading unnecessary data.
- Optimize database queries.
- Prefer lazy loading when appropriate.
- Cache only where measurable performance benefits exist.
- Minimize network requests.
- Avoid premature optimization.

## Data Design

- Choose appropriate data structures and algorithms.
- Normalize data unless denormalization provides measurable benefits.
- Validate data at application boundaries.
- Keep models cohesive.
- Avoid duplicated sources of truth.
- Follow the principle of least privilege when exposing data.

---

# Code Quality

- Write readable code before clever code.
- Prefer small functions with one responsibility.
- Remove dead code.
- Avoid duplicated logic.
- Minimize nesting by using early returns.
- Keep files reasonably small.
- Use meaningful variable and function names.
- Follow existing project conventions.
- Do not introduce external libraries unless absolutely necessary.
- Use versions defined by the project's dependency management files.
- Add tests for new functionality whenever practical.

---

# Security

- Never expose credentials.
- Never store passwords, API keys, tokens, secrets, or connection strings in source code.
- Never expose customer personal information unless explicitly approved.
- Sanitize and validate all external input.
- Use parameterized database queries.
- Follow the principle of least privilege.
- Log security-sensitive events without exposing confidential information.

---

# Performance

- Avoid unnecessary loops.
- Avoid repeated database queries (N+1 problems).
- Reduce memory usage where practical.
- Profile before optimizing.
- Prefer efficient algorithms over micro-optimizations.

---

# Documentation

- Update documentation when behavior changes.
- Keep README and API documentation current.
- Document architectural decisions when introducing new patterns.
- Record significant development work in `/docs/activity-log.md`.
- Track remaining work in `/docs/todo.md`.

---

# Version Control

- Make focused, atomic commits.
- Write clear commit messages.
- Never auto-push to any branch.
- Never auto-merge pull requests.
- Ask before performing destructive Git operations.
- Do not rewrite Git history unless explicitly requested.

---

# AI Restrictions

- Access only these repositories:
  - `connections-client-micro-site`
  - `connections-service-micro-site`
- Never fabricate data or API responses.
- Never invent requirements.
- Ask for clarification when requirements are ambiguous.
- Explain significant architectural decisions before implementation.
- Do not perform major refactoring without approval.
- Preserve backward compatibility unless instructed otherwise.

---

# Decision Priority

When making implementation decisions, prioritize in this order:

1. Correctness
2. Security
3. Maintainability
4. Simplicity
5. Scalability
6. Performance
7. Developer convenience
