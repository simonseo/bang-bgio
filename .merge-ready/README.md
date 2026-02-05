# Merge Ready Directory

This directory contains marker files indicating branches ready for review and merge.

## Marker File Format

Each marker file is named `{branch-name}.ready` and contains:
```json
{
  "branch": "agent-1/feature/character-abilities",
  "agent": "agent-1",
  "timestamp": "2026-02-05T21:00:00Z",
  "summary": "Implemented all 16 character abilities with tests",
  "testsPass": true,
  "conflicts": false
}
```

## Usage

Mark branch as ready for merge:
```bash
echo '{"branch":"agent-1/feature/foo","agent":"agent-1","timestamp":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","summary":"Completed foo","testsPass":true,"conflicts":false}' > .merge-ready/agent-1-feature-foo.ready
```

Check ready branches:
```bash
ls .merge-ready/*.ready
```
