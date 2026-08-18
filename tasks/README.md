# Tasks System — How This Works

The `tasks/` folder is the coordination layer for the whole team (humans + AI agents). It is updated in EVERY session, in the same commit as the code you write.

## Files

| File | Purpose |
|---|---|
| `backlog.md` | All work not yet started (pending). |
| `in-progress.md` | Work being actively developed RIGHT NOW. |
| `completed.md` | Finished work — append, never rewrite history. |
| `handoffs/` | One file per interrupted task (`TASK-XXX.md`). |

## Task entry format

Every task entry MUST have an owner stamp:

```text
## TASK-001: <short title>
OWNER: <agent-id>
STARTED: <YYYY-MM-DD HH:MM>
STATUS: pending | in_progress | completed | blocked
```

## Agent Registry

Register your unique ID here when you first start work. `<tool>/<handle>` format. Your ID must be differentiable from all others.

| Agent ID | Tool | Person | Started |
|---|---|---|---|
| `opencode/manvar` | opencode | Manvar Pushkar | 2026-08-17 |
| `opencode/nishant` | opencode | Nishant | 2026-08-18 |

## Claim protocol

Strict order — the ownership claim must exist in Git BEFORE implementation:

1. `git pull` latest `main`.
2. Check `tasks/in-progress.md` + `tasks/handoffs/` — confirm the task is unclaimed. If claimed by another agent, STOP.
3. Register/confirm your agent ID above.
4. Create feature branch `feat/task-XXX` from `main`.
5. Move the task into `in-progress.md`: add `OWNER` + `STARTED` + one-line plan.
6. Commit the claim change, push the branch.
7. Implement on the branch.
8. Done? Move entry to `completed.md`, add `DONE: <date>` + one-line summary, commit with code.
9. Push branch, open PR, get review + CI pass, merge to `main`.
10. Cannot finish? Write `handoffs/TASK-XXX.md` and set `in-progress.md` STATUS to `blocked`.

## Conflict rule

- If your area appears in `in-progress.md` owned by someone else → STOP, ask the team lead. Never overwrite.
- Check `in-progress.md` and `handoffs/` BEFORE starting anything.
- One task = one owner at a time.
