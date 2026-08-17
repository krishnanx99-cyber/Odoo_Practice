# Handoffs

One file per interrupted/blocked task, named `TASK-XXX.md`.

Template — copy this:

```markdown
# Handoff: TASK-XXX

## Task
## Status
## Completed
## Not Completed
## Files Changed
## Important Decisions
## Tests Run
## Known Problems
## Next Step
## Warnings
```

Rules:
- Write a handoff if a session ends before the task is complete.
- Set the task STATUS to `blocked` in `tasks/in-progress.md`.
- The next agent MUST read the handoff before touching anything.
