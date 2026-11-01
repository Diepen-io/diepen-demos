---
name: reuse-first
description: Search this project for what already exists before you write a new component, hook, query or helper. Use before any change that adds a file or touches more than one file.
---

# reuse-first

The shortest path for an agent is a new file in the folder it already reads.
That is how a codebase gets three date formatters.

## Search by behavior, not by the name you planned

```bash
rg -n "<what it does>" apps packages
rg -n "<the vendor or channel it touches>" packages
ls packages/ui/src packages/voice/src packages/ai/src
```

Before a new channel mockup or film part, read `packages/ui/src` first: the mockups and film components live there and every demo shares them.

## Decide in this order

1. Reuse: it exists and fits.
2. Extend: it nearly fits. Add a parameter only if every caller still reads well.
3. Compose: two things exist. Combine them at the call site.
4. Extract: the same logic has a second real caller now. Move it to the shared kernel.
5. Create: nothing fits. Say in one line why the closest thing does not.

Never extract for one caller.

## Output

Notes in the chat, three lines is usually enough:

```text
Reuse:   <path> <symbol> already does <what>
Extend:  <path> needs <parameter>, callers unaffected
Create:  no <thing> exists, closest is <path> which <why not>
```
