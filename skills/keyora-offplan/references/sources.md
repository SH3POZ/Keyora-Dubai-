# Sources

Read pages in the browser. Respect each site's terms of use. Do not bulk-export data.

| Input | First choice | If that is not available |
|---|---|---|
| Unit price, size, payment plan, fees | Developer's sales offer (from the user) | Brochure, then the project page on DXB Interact, Property Finder or Bayut |
| Handover date | Sales offer | Developer's website, then DXB Interact project page |
| Area price per sqft, same unit type | DXB Interact | Bayut market analysis, Property Finder transactions |
| Area rent, same unit type | DXB Interact rent contracts (new contracts) | Bayut market analysis |
| 12-month price and rent change | DXB Interact area report | Bayut market analysis |
| Sales by unit type | DXB Interact | Property Finder transactions |
| Project units and units sold | DXB Interact project page | Developer |
| Units under construction in the area | DXB Interact supply | Leave the block out |
| Distances | Google Maps | Leave the card out |
| Service charge | Sales offer or developer | Dubai Land Department service charge index, else a flagged placeholder |

## Notes on the sources
- **DXB Interact** (dxbinteract.com) shows Dubai Land Department transactions. If Claude has a
  DXB Interact connector, use it. Otherwise open the site in the browser.
- **Bayut market analysis** and **Property Finder transactions** are public pages.
- A project page often lists a median price per sqft for all sizes together. Small units sell for
  more per sqft than large ones, so always compare the same unit type.
- The lowest input that still gives a useful report is: a unit price and size, an area price per
  sqft, and an area rent. Everything else improves it.

## When a source fails
Tell the user which source failed and why, and ask whether to continue without it. Never drop a
source without saying so.
