# Agent Lock Directory

This directory contains lock files for agent coordination.

## Lock File Format

Each lock file is named `{file-path}.lock` and contains:
```json
{
  "agent": "agent-1",
  "branch": "agent-1/feature/character-abilities",
  "timestamp": "2026-02-05T21:00:00Z",
  "intent": "Implementing character draw phase abilities"
}
```

## Usage

Before modifying a file, check for lock files:
```bash
ls .agent-locks/ | grep "path/to/file"
```

Create a lock before starting work:
```bash
echo '{"agent":"agent-1","branch":"agent-1/feature/foo","timestamp":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","intent":"Working on foo"}' > .agent-locks/src-game-moves.ts.lock
```

Remove lock when done:
```bash
rm .agent-locks/src-game-moves.ts.lock
```
