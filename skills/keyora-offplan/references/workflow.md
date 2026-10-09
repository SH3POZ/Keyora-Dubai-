# Workflow

Work through these steps in order. Note the source, the period and today's date for every figure.

## 1. Identify the unit
Best input first: the developer's sales offer, then a brochure, then a listing or project page.
Collect: project, developer, community, unit type, unit reference, size in sqft, price, handover
date, the payment plan (each instalment as a percentage and when it is due), the admin fee, the
service charge per sqft, and whether it comes furnished.

If the user gave only a project name, pick one real unit layout that has a published price and
say so in `assumptions` ("listed price, not a signed sales offer").

If two sources disagree on the handover date, or the date has already passed while the project is
still under construction, do not choose silently. Use the later credible date, and list the
conflict in `assumptions` so the user confirms it with the developer.

## 2. Market sources (one to three)
For each source the user can open, add one entry to `market.sources`, for the same unit type in
the same community:
- `rent`: median or average annual rent from recent contracts, new contracts only where the
  source separates them
- `psfHigh`: price per sqft of first sales (off-plan sales from developers). This is the
  optimistic case
- `psfLow`: price per sqft of resales. This is the conservative case
- `period` and `sample`: the dates covered and how many deals

The normal case is the midpoint, calculated by the page. If a source has no resale figure, leave
`psfLow` out; that source then shows a single case.

Prefer the last 3 months. With fewer than 5 deals, widen to 6 months, then 12. If it is still
fewer than 5, say the sample is thin in `assumptions`.

Mark one source `"main": true`. Choose the one whose comparables are closest to this unit: a
source matched on size (Property Monitor, within about 10% of the unit size) beats one that mixes
all sizes.

## 3. Growth over the last 12 months
Get the 12-month change in price per sqft (`market.priceGrowth12m`) and in rent
(`market.rentGrowth12m`) for that unit type in the community. If one is not available, set it to
`null`: the page uses 0% and you add a line to `assumptions`. Do not adjust these figures
yourself. The page turns them into the four scenarios.

## 4. Premiums
Go through `config/premiums.json`. For each factor, check the evidence:
- metro: measure the straight-line distance on Google Maps to a station that is open or under
  construction. Announced-only lines do not count. Use `metro_walk` or `metro_near`, never both
- view: confirm what the unit faces and whether an empty plot in front could be built on
- the others: confirm from the developer or the area data
Add each confirmed factor to `premiums` with a one-line `why` in both languages. Skip a factor
when the comparables already include it (for example, every comparable is in the same waterfront
community).

## 5. Supply and demand
- `supply.salesByType`: units of each type sold in the community in the period. Use the same
  types as the building mix so the two charts compare. Mark this unit's type `"match": true`
- `supply.buildingMix`: units of each type in the project
- `supply.project`: total units and units sold
- `supply.handovers`: units handing over in the community by year. Mark the project's year
  `"mark": true`. Stop at the last year a source lists
- `supply.area`: units and projects under construction
Leave out any part you could not source.

## 6. Location and comfort cards
Add a card to `location` only for what you checked. Each has `title`, a short `headline`,
`text`, and a `source` link.

| Card | How to check |
|---|---|
| Facing | Google Maps satellite view: what is in front of the unit's side of the building |
| Sun | suncalc.org at the project pin, for 21 June and 21 December: which sides get afternoon sun |
| Shade | shademap.app for built-up areas. In a new area, estimate from the planned height of the neighbours and say it is an estimate |
| Road noise | Google Maps: distance from the unit's side to the nearest highway |
| Aircraft noise | noise-map.com near the project: the average level in dB |
| Wind and sea | Google Maps for the distance to the coast; windy.com for beachfront units |
| Flooding | News reports of the April 2024 floods for that community. Say how strong the evidence is |
| Distances | Google Maps: metro station, airport, main road |

These cards are notes. They never change a figure.

## 7. Photos
Ask before downloading. Save up to about 20 images in `data/<name>-photos/`, no wider than
1920 px, and list them in `photos` with a caption in both languages. Order: exterior, amenities,
lobby, interiors, location map. Credit the source in the caption.

## 8. Notes
Write 3 to 6 short `notes`: facts a buyer would want that the figures do not already show.
Do not repeat a number that is shown elsewhere on the page.

## 9. Check and build
```bash
node check.js data/<name>.json
python3 build.py data/<name>.json
```
Open `out/<name>.html`. Look at it at phone width and desktop width, in Arabic and in English.
Tap every source, case and scenario button once. Read every sentence for contradictions.

## 10. PDF
Use the "Save as PDF" button on the page, or run headless Chrome:
```bash
chrome --headless=new --no-pdf-header-footer --print-to-pdf="<name>.pdf" "file://$PWD/out/<name>.html#ar"
```
End the address with `#ar` or `#en` to choose the language. Printing switches to a light layout,
resets to the recommended view, and opens the calculations.

## 11. Hand over
Send the page with the "Summary to send" text from the bottom of the report, plus the list of
things still to confirm with the developer.
