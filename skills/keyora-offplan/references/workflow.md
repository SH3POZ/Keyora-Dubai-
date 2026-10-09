# Workflow

Work through these steps in order. Note the source, the period and today's date for every figure.

## 1. Identify the unit
Best input first: the developer's sales offer, then a brochure, then a listing or project page.
Collect: project, developer, community, unit type, unit reference, size in sqft, price, handover
date, the payment plan (each instalment as a percentage and when it is due), the admin fee, and
the service charge per sqft.

If the user gave only a project name, pick one real unit layout that has a published price and
say so in `assumptions` ("listed price, not a signed sales offer").

If two sources disagree on the handover date, or the date has already passed while the project is
still under construction, do not choose silently. Use the later credible date, and list the
conflict in `assumptions` so the user confirms it with the developer.

## 2. Area price and rent, same unit type
Get, for the same bedroom type in the same community:
- the price per sqft of comparable sales (`market.areaPsf`)
- the median annual rent from recent contracts (`market.areaRent`)

Prefer the last 3 months. If there are fewer than 5 deals, widen to 6 months, then 12. If there
are still fewer than 5, say the sample is thin in `assumptions`. Write the period and the sample
size into `market.psfNote` and `market.rentNote`.

## 3. Growth over the last 12 months
Get the 12-month change in price per sqft (`market.priceGrowth12m`) and in rent
(`market.rentGrowth12m`) for the community. If one is not available, set it to `null`. The page
then uses 0% for it, and you add a line to `assumptions`.

Do not adjust these figures yourself. The page turns them into the four scenarios.

## 4. Supply and demand
- `supply.salesByType`: how many units of each type sold in the community in the period. Mark the
  type that matches this unit with `"match": true`.
- `supply.project`: total units in the project and how many are sold.
- `supply.area`: units and projects still under construction in the community.
Leave out any part you could not source.

## 5. Location cards (optional)
Add a card to `location` only for things you actually checked, each with its source link:
distance to the nearest open metro station, distance to the airport, what the unit faces,
aircraft noise, flood history. An empty list hides the section.

## 6. Notes
Write 3 to 5 short `notes`: facts a buyer would want that the figures do not already show.
Do not repeat a number that appears elsewhere on the page more than once.

## 7. Check and build
```bash
node check.js data/<name>.json
python3 build.py data/<name>.json
```
Open `out/<name>.html`. Look at it at phone width and desktop width, in Arabic and in English.
Read every sentence once for contradictions.

## 8. PDF
Open the page in a browser and print to PDF, or run headless Chrome:
```bash
chrome --headless=new --no-pdf-header-footer --print-to-pdf="<name>.pdf" "file://$PWD/out/<name>.html#ar"
```
End the address with `#ar` or `#en` to choose the language. Printing uses a light layout and
opens the calculations automatically.

## 9. Hand over
Send the link or file with a short message: the verdict line, profit at handover in the base case,
net rent and net yield, and the list of things still to confirm with the developer.
