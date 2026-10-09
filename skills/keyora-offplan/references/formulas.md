# Formulas and data fields

All of this is implemented in `kit/calc.js`. `kit/check.js` re-derives the main figures a second
way and compares.

## Buying
- DLD fee = price × `dldPct` (4% in Dubai)
- Total cost = price + DLD fee + `adminFee`
- Unit price per sqft = price ÷ size
- Price against the area = (unit price per sqft − `areaPsf`) ÷ `areaPsf`

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

## Selling at handover
- Value today = `areaPsf` × size
- Sale price = value today × (1 + price growth) ^ years
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
- Gross rent = `areaRent` × (1 + rent growth) ^ years
- Net rent = gross rent − vacancy (`vacancyPct`) − management (`managementPct`) − `serviceChargePsf` × size
- Net yield = net rent ÷ total cost

## Labels on the report
| Check | Strong | Moderate | Weak |
|---|---|---|---|
| Net yield | 6% or more | 4.5% to 6% | under 4.5% |
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
| `costs` | `dldPct`, `adminFee`, `serviceChargePsf`, `managementPct`, `vacancyPct`, `sellCommissionPct`, `vatPct` |
| `plan` | list of instalments: `label`, `pct`, `when`, `beforeHandover`. Must add up to 100 |
| `market` | `areaPsf`, `areaRent`, `priceGrowth12m`, `rentGrowth12m` (number or `null`), `psfNote`, `rentNote` |
| `supply` | optional: `salesByType`, `salesPeriod`, `project`, `area` |
| `location` | optional cards: `title`, `text`, `source` (https link) |
| `notes` | short facts |
| `assumptions` | everything that is a placeholder, derived, or unconfirmed |
| `sources` | `name`, `what`, `period`, `pulled` (date), `url` |
