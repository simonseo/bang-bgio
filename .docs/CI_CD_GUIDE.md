# CI/CD Pipeline Guide

This document explains the continuous integration and deployment pipeline for the Bang! Boardgame.io project.

## Overview

The project uses GitHub Actions for automated testing, quality checks, and deployment. The CI/CD pipeline enforces code quality, test coverage, and multi-agent coordination protocols.

## Workflows

### 1. Main CI Pipeline (`ci.yml`)

**Triggers:** Push to `main` or `agent-**` branches, Pull Requests to `main`

**Jobs:**

#### Test Job
- Runs on Node.js 18.x and 20.x
- Executes unit, E2E, and integration tests
- Generates test coverage reports
- Uploads coverage to Codecov (Node 20 only)

```bash
# Local equivalent:
npm test -- --run
npm run test:coverage
```

#### Lint & Type Check Job
- Validates TypeScript types
- Ensures code compiles without errors

```bash
# Local equivalent:
npm run build  # Will fail on type errors
npx tsc --noEmit
```

#### Build Job
- Creates production build
- Uploads build artifacts for 7 days
- Verifies deployment-ready bundle

```bash
# Local equivalent:
npm run build
```

#### Multi-Agent Coordination Checks
- **Check File Locks**: Warns if PR modifies locked files
- **Verify Intent**: Ensures agent branches have declared intent
- **Conventional Commits**: Validates commit message format

### 2. PR Validation (`pr-checks.yml`)

**Triggers:** Pull request events (opened, synchronized, ready_for_review)

**Checks:**

#### PR Title Validation
Enforces conventional commit format:
```
feat(scope): description
fix(scope): description
docs: description
```

Examples:
- ✅ `feat(server): Add auto port finding`
- ✅ `fix(ui): Resolve card display issue`
- ❌ `Added new feature`

#### Test Coverage Check
Warns if code changes lack corresponding test updates.

#### Documentation Updates
Reminds to update docs when adding features.

#### Branch Naming Convention
Expected format: `agent-{n}/{type}/{description}`
- Types: `feature`, `fix`, `refactor`, `test`, `docs`, `ui`
- Example: `agent-4/feature/cicd-setup`

#### PR Size Warning
- Small: < 500 lines changed ✅
- Medium: 500-1000 lines ⚠️
- Large: > 1000 lines ⚠️ (consider splitting)

#### Merge Conflict Detection
Automatically checks for conflicts with main branch.

### 3. Code Quality (`code-quality.yml`)

**Triggers:** Push to branches, Pull Requests

**Checks:**

#### Code Quality
- Console.log detection (warns if found in production code)
- TODO/FIXME tracking (creates issue reminders)
- File size monitoring (warns on files > 500KB)
- Duplicate code detection

#### Security
- `npm audit` for vulnerabilities (high/critical only)
- Dependency freshness check

#### Test Quality
- Test coverage threshold: 80% target
- Skipped test detection
- Focused test detection (fails if `.only` found)

### 4. Deployment (`deploy.yml`)

**Triggers:**
- Release published
- Manual workflow dispatch

**Environments:**
- Staging (for testing)
- Production (for releases)

**Process:**
1. Checkout code
2. Install dependencies
3. Run full test suite
4. Build for production
5. Deploy (configure for your hosting service)

## Local Development

### Running CI Checks Locally

Before pushing, run these commands to catch issues:

```bash
# Run all tests
npm test -- --run

# Check test coverage
npm run test:coverage

# Type check
npx tsc --noEmit

# Build
npm run build

# Security audit
npm audit
```

### Pre-Push Checklist

- [ ] All tests passing locally
- [ ] No console.log in production code
- [ ] Test coverage > 80% for new code
- [ ] No `.only` in tests
- [ ] Conventional commit messages
- [ ] Branch follows naming convention
- [ ] Intent declared (agent branches)

## Multi-Agent Coordination

The CI pipeline enforces coordination protocols:

### File Locks
```bash
# Before modifying a file
./scripts/check-locks.sh src/path/to/file.ts

# Lock a file
./scripts/create-lock.sh agent-4 branch-name src/path/to/file.ts "reason"
```

CI will warn if you modify a locked file.

### Intent Declaration
```bash
# Declare what you're working on
./scripts/declare-intent.sh agent-4 agent-4/feature/name "Description"
```

CI verifies intent exists for agent branches.

### Branch Naming
Follow convention: `agent-{n}/{type}/{description}`
- Agent number (1-4)
- Type: feature, fix, refactor, test, docs, ui
- Short kebab-case description

## Troubleshooting

### CI Failing: "conventional commit format"
Your commit messages must follow the format:
```
type(scope): description

feat(server): add auto port finding
fix(ui): resolve card layout issue
docs: update README
```

### CI Failing: "No intent declared"
Run:
```bash
./scripts/declare-intent.sh agent-4 your-branch "What you're doing"
git add .agent-intents.json
git commit --amend --no-edit
git push --force
```

### CI Failing: "Coverage below threshold"
Add tests for your changes:
```bash
npm run test:coverage
# Check which lines need coverage
```

### CI Failing: "File locked by another agent"
Coordinate with the other agent or wait for them to finish. Check:
```bash
cat .agent-locks/agent-*/your-file.lock
```

### CI Failing: "Focused tests detected"
Remove `.only` from tests:
```bash
git grep '\.only' src/test/
# Remove all .only occurrences
```

## Configuration

### Adding Secrets

For Codecov, deployment, etc.:
1. Go to GitHub Settings > Secrets and variables > Actions
2. Add required secrets:
   - `CODECOV_TOKEN` (optional, for coverage reports)
   - Deployment credentials (depends on hosting service)

### Customizing Workflows

Edit `.github/workflows/*.yml` files:
- Adjust Node.js versions in `ci.yml`
- Change coverage thresholds in `code-quality.yml`
- Configure deployment in `deploy.yml`

### Disabling Checks

To skip CI on a commit:
```bash
git commit -m "docs: update README [skip ci]"
```

**Note:** Only use for documentation-only changes.

## Status Badges

Add to README:
```markdown
![CI](https://github.com/username/repo/actions/workflows/ci.yml/badge.svg)
![Coverage](https://codecov.io/gh/username/repo/branch/main/graph/badge.svg)
```

## Best Practices

1. **Small PRs**: Keep changes focused and < 500 lines
2. **Test First**: Write tests before implementation (TDD)
3. **Conventional Commits**: Use structured commit messages
4. **Documentation**: Update docs with feature changes
5. **Green Main**: Never merge failing tests to main
6. **Agent Coordination**: Declare intent, lock files, follow conventions

## Related Documentation

- `.docs/AGENT_COORDINATION_PLAN.md` - Multi-agent workflow
- `.docs/DEPLOYMENT.md` - Production deployment
- `CLAUDE.md` - Golden rules and patterns
- `CONTRIBUTING.md` - Contribution guidelines (if exists)

## Support

If CI is blocking your work:
1. Check this guide for troubleshooting
2. Review workflow logs in GitHub Actions tab
3. Coordinate with other agents
4. Create an issue if CI appears broken
