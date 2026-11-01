#!/usr/bin/env bash
# Every suppression is a rule someone decided not to follow. The count may fall, never rise.
# The baseline lives in .suppressions. A lower count rewrites it, so the floor follows the cleanup.
set -euo pipefail

pattern='eslint-disable|@ts-expect-error|@ts-ignore|# *noqa|# *type: *ignore|# *pyright: *ignore|biome-ignore'
# git grep exits 1 when nothing matches, which pipefail would turn into a failure.
count="$({ git grep -E -c "$pattern" -- ':!*.md' ':!.suppressions' ':!scripts/check-suppressions.sh' || true; } |
  awk -F: '{ total += $NF } END { print total + 0 }')"
baseline="$(cat .suppressions 2>/dev/null || echo "$count")"

if [ "$count" -gt "$baseline" ]; then
  echo "Suppressions rose from $baseline to $count. Fix the code, or fix the rule (see the harden skill)." >&2
  git grep -n -E "$pattern" -- ':!*.md' ':!.suppressions' ':!scripts/check-suppressions.sh' >&2
  exit 1
fi
if [ "$count" -lt "$baseline" ] || [ ! -f .suppressions ]; then
  echo "$count" > .suppressions
fi
echo "suppressions: $count (baseline $baseline)"
