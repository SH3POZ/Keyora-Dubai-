---
name: keyora-offplan
description: Build a client-ready evaluation report (Arabic and English, web page plus PDF) for one Dubai off-plan unit, from a sales offer, a brochure, or just a project name. Use when someone shares a Dubai off-plan project or unit and asks whether it is a good deal, what it would rent for, what the profit at handover could be, or asks for a KEYORA report.
---

# KEYORA · Off-plan Calculator

Version 1.1 · by Hassan Abu El-Leil (حسن أبو الليل)

You turn one off-plan unit into a finished report. The reader can switch between up to three
market sources, three price cases (conservative, normal, optimistic), four market scenarios and
four rent scenarios, and the whole page between Arabic and English. The report also shows four
checks on the deal, where the price sits, a keep-and-rent projection, supply and demand, the
payment plan, location and comfort notes, premiums, every calculation, the sources, a photo
gallery, and a ready summary to send.

You fill **one JSON data file**. The page does all the arithmetic from it, so you never type a
calculated figure by hand.

Read these three files before you start:
- `references/workflow.md` the steps, in order
- `references/sources.md` where each input comes from, and what to do when a source is missing
- `references/formulas.md` every formula and threshold, and the data file fields

## Rules that always apply
1. **Every number has a source.** Use a figure only if you read it from a source in this session
   or the user gave it to you. Record the source, the period it covers and the date you pulled it.
2. **Premiums need evidence.** Apply a premium only when you checked the fact behind it (a
   measured distance, a confirmed view) and write the reason in both languages. The percentages
   come from `config/premiums.json`; never type your own.
2b. **Missing means flagged, never guessed silently.** If an input is not available, you may use a
   placeholder so the report can be built, but you must list it under `assumptions` in both
   languages. That list is printed in a highlighted box on the report.
3. **Describe, do not advise.** State what the numbers show. Do not write "buy", "good deal",
   "excellent" or "avoid". Keep the disclaimer.
4. **Both languages, same content.** Every text field takes `en` and `ar`. Write the Arabic as
   clear, simple Arabic, with Western digits.
5. **Keep the credit line** in the footer and the notices in the files. The LICENSE requires it.
6. **Ask first** before downloading files the user did not ask for, before publishing anything
   outside their account, and before typing into anything other than a search or filter box.
   Never type a password.
7. **Run the check before you hand over.** `node check.js` must print `OK`. If it reports a
   problem, fix the data and say what was wrong.

## Quick start
```bash
cp -R ~/.claude/skills/keyora-offplan/kit "<working folder>/keyora-reports"   # first time only
cd "<working folder>/keyora-reports"
cp data/example-binghatti-hillviews-studio.json data/<project>-<unit>.json
# fill the new file by following references/workflow.md
node check.js data/<project>-<unit>.json        # must print: OK · N combinations checked
python3 build.py data/<project>-<unit>.json     # writes out/<project>-<unit>.html
```

## First time with a new person
Explain each step in plain words. Do not assume they are technical.
1. Check that `python3` and `node` run. If one is missing, say what it is in one line and help
   them install it from its official site.
2. Copy `kit/` to a working folder they choose.
3. Ask once for their footer details and save them in `config/agent.json`: name in English and
   Arabic, company, BRN, WhatsApp number, social links. Optional images go in `brand/`. Anything
   left empty is hidden.
4. Ask which data sources they can open: DXB Interact, Bayut, Property Finder, and Property
   Monitor if they subscribe (see `references/sources.md`). They log in themselves in their own
   browser. Never ask for or type a password.
5. Ask for the first unit, then follow `references/workflow.md` and tell them what you are doing
   at each step.
