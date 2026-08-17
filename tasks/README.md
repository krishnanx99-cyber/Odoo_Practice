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

Register your unique ID here when you first start work. `<tool>/<handle>` format.

| Agent ID | Tool | Person | Started |
|---|---|---|---|
| (register yours) | | | |

## Claim protocol

1. Pick a task from `backlog.md`. If none fits, create a new entry using the next free TASK number.
2. Move it to `in-progress.md`. Add `OWNER` + `STARTED` + your one-line plan.
3. Implement. Update task files + code in the SAME commit.
4. Done? Move entry to `completed.md`, add `DONE: <date>` + one-line summary.
5. Cannot finish? Write `handoffs/TASK-XXX.md` and set `in-progress.md` STATUS to `blocked`.

## Conflict rule

- If your area appears in `in-progress.md` owned by someone else → STOP, ask the team lead. Never overwrite.
- Check `in-progress.md` and `handoffs/` BEFORE starting anything.
- One task = one owner at a time.
