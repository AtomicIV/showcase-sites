#!/usr/bin/env bash
# Re-shoot every site on desktop + mobile and build contact sheets; summary goes to tools/shots/_qa-summary.txt
cd "$(dirname "$0")/.."
summary=tools/shots/_qa-summary.txt
: > "$summary"
for dir in sites/[0-9][0-9]-*/; do
  s=$(basename "$dir")
  for mode in desktop mobile; do
    node tools/shoot.cjs "$s" "$mode" 1 >> "$summary" 2>&1
    node tools/sheet.cjs "$s" "$mode" > /dev/null 2>&1
  done
done
echo DONE >> "$summary"
