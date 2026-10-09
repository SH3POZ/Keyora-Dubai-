# Formulas and data fields

All of this is implemented in `kit/calc.js`. `kit/check.js` runs every combination of source,
case and scenario, re-derives the main figures a second way and compares.
`kit/data/test-all-features.json` is made-up data that switches every feature on, for testing the page.

## Buying
- DLD fee = price × `dldPct` (4% in Dubai)
- Total cost = price + DLD fee + `adminFee`
- Unit price per sqft = price ÷ size
- Price against the area = (unit price per sqft − case price per sqft) ÷ case price per sqft

## Scenarios
Years to handover = days between the report date and the handover date ÷ 365.25.
The 12-month change `g` becomes four yearly growth rates:

| Scenario | Yearly rate |
|---|---|
| Market falls | −5% |
| Market stays flat | 0% |
| Base case | half of `g`, no lower than 0% and no higher than 6% |
| Strong market | `g`, no lower than 0% and no higher than 10% |

The same rule is applied separately to price growth and to rent growth. A missing `g` counts as 0.

## Price cases
Each market source can carry two prices per sqft:
- Conservative = `psfLow`, the resale price
- Optimistic = `psfHigh`, the first-sale price
- Normal = the midpoint of the two
A source with only one of them shows a single case.

## Premiums
Each confirmed factor in `premiums` adds its rent % and its price % from `config/premiums.json`.
The totals are capped (`caps.rent`, `caps.price`). The table is KEYORA's own judgement and can be
edited.

## Selling at handover
- Value today = case price per sqft × size
- Sale price = value today × (1 + price growth) ^ years × (1 + price premiums)
- Resale commission = sale price × `sellCommissionPct` × (1 + `vatPct`)   (2% plus 5% VAT = 2.1%)
- Profit = sale price − resale commission − total cost
- Return on total cost = profit ÷ total cost
- Cash paid before handover = price × sum of instalments marked `beforeHandover` + DLD fee + admin fee
- Return on cash = profit ÷ cash paid before handover
- Break-even sale price = total cost ÷ (1 − 2.1%)
- Safety margin = (value today − break-even) ÷ value today

Selling before handover usually also carries a developer transfer (NOC) fee. It is not in the
figures. Mention it in the notes when relevant.

## Renting out
- Gross rent = source rent × (1 + rent growth) ^ years × (1 + rent premiums) + `furnishedPremium`
- Net rent = gross rent − vacancy (`vacancyPct`) − management (`managementPct`) − `serviceChargePsf` × size − `otherYearly`
- Net yield = net rent ÷ total cost
- Price that gives the target yield = (net rent ÷ `targetYield` − admin fee) ÷ (1 + DLD %)

## Keeping it for N years after handover (`holdYears`, default 5)
- Rent collected = net rent, growing each year at the rent scenario rate, summed over N years
- Sale price then = sale price at handover × (1 + price growth) ^ N
- Total profit = sale price then × (1 − 2.1%) + rent collected − total cost

## Labels on the report
| Check | Strong | Moderate | Weak |
|---|---|---|---|
| Net yield | `targetYield` (6%) or more | within 1.5 points below it | lower |
| Safety margin | 5% or more | 0% to 5% | under 0% |

Price against the area: 3% or more below = "below the area", within 3% = "in line", more than 3%
above = "above the area".

Headline: profit above zero and safety margin of 5% or more → "Profitable if sold at handover".
Profit above zero with a smaller margin → "thin margin". Otherwise → "A loss if sold at handover
in this scenario".

## Data file fields
Start from `kit/data/example-binghatti-hillviews-studio.json`. Text fields are `{"en": "...", "ar": "..."}`.

| Field | Meaning |
|---|---|
| `lang` | language the page opens in: `ar` or `en` |
| `date`, `handover` | report date and handover date, `YYYY-MM-DD` |
| `project` | `name`, `developer`, `area`, `city` |
| `unit` | `type`, `ref`, `size` (sqft), `price` (AED) |
| `costs` | `dldPct`, `adminFee`, `serviceChargePsf`, `managementPct`, `vacancyPct`, `sellCommissionPct`, `vatPct`, `furnishedPremium`, `otherYearly` |
| `plan` | list of instalments: `label`, `pct`, `when`, `beforeHandover`. Must add up to 100 |
| `market` | `priceGrowth12m`, `rentGrowth12m` (number or `null`), and `sources`: each with `name`, `main`, `rent`, `psfHigh`, `psfLow`, `period`, `sample` |
| `premiums` | confirmed factors: `key` (from `config/premiums.json`) and `why` |
| `photos` | optional: `file` (inside `data/<name>-photos/`) and `caption` |
| `supply` | optional: `salesByType`, `salesPeriod`, `buildingMix`, `handovers`, `project`, `area` |
| `location` | optional cards: `title`, `headline`, `text`, `source` (https link), `sourceName` |
| `notes` | short facts |
| `assumptions` | everything that is a placeholder, derived, or unconfirmed |
| `sources` | `name`, `what`, `period`, `pulled` (date), `url` |
