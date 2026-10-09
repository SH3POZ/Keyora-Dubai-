#!/bin/bash
# KEYORA · (c) 2026 Hassan Abu El-Leil. See LICENSE.
# Links each calculator in skills/ into ~/.claude/skills. Run it again after `git pull` to update.
set -e
ROOT="$(cd "$(dirname "$0")" && pwd)"
mkdir -p "$HOME/.claude/skills"
for dir in "$ROOT"/skills/*/; do
  name="$(basename "$dir")"; target="$HOME/.claude/skills/$name"
  if [ -e "$target" ] && [ ! -L "$target" ]; then
    echo "kept     $name  (you already have a folder with this name; it was not changed)"
  else
    ln -sfn "${dir%/}" "$target"; echo "linked   $name"
  fi
done
echo "Finished. Open a new Claude session and ask for an off-plan report."
