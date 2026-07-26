# The Bake Off Effect

A data-driven look at how The Great British Bake Off's technical challenges shape what real-world bakers search for and bake, using Google Trends and Reddit as proxies for viewer behavior.

**[Read the piece →](#)** *(add live link once published)*

## Overview

Every season, GBBO's technical challenges send fans in search of everything from fondant fancies to kouign-amann. This project asks three questions:

1. Does a technical challenge airing measurably move search interest in that bake's recipe?
2. Do technicals with historically low/no baseline search interest ("forgotten bakes") see a bigger resurgence than well-known ones?
3. Does search interest translate into people actually baking — and where do they show that work?

The findings suggest the effect is real, but concentrated: search interest reliably spikes after air, and it's most visible within GBBO's own fandom community (r/bakeoff), rather than diffusing into the broader baking public (r/baking).

## Data sources

- **Episode & technical challenge metadata** — [Great British Bake Off Results, Seasons 1–14](https://www.kaggle.com/datasets/sarahvitvitskiy/great-british-bake-off-results-seasons-1-14) (Kaggle, maintained by Sarah Vitvitskiy)
- **Episode data enrichment** Enriched against the [official GBBO recipe archive](https://thegreatbritishbakeoff.co.uk/recipes/all/?collection=Technical+bakes&showFilter=false); scraped using Playwright browser automation and xpath.
- **Search interest** — [Google Trends](https://trends.google.com/), pulled via [pytrends](https://github.com/GeneralMills/pytrends), restricted to Great Britain.
- **Community baking activity** — Reddit posts from r/baking and r/bakeoff, pulled using [arctic shift](https://arctic-shift.photon-reddit.com/)

## Pipeline

1. **Clean technical challenge names** — strip embedded quantities (e.g. `"12 custard creams"` → `"custard creams"`) and normalize whitespace/casing so names match consistently across every data source.
2. **Build a stable `technical_id`** (`gbbo_s{season}_e{episode}`) as the join key across all tables, rather than relying on free-text bake names.
3. **Pull Google Trends data** for each technical's recipe name, comparing a 30-day pre-air baseline against a 7-day post-air average, restricted to Great Britain and anchored to the UK Channel 4 air date.
4. **Pull Reddit post data** for r/baking and r/bakeoff, comparing the share of posts mentioning each technical in the 21 days after air against a 30-day pre-air baseline.
5. **Merge** all sources into a single master dataframe, keyed on `technical_id`.
6. **Visualize** with D3.js, styled with [Rough.js](https://roughjs.com/) for a hand-illustrated, sketchbook aesthetic.

## Repo structure

```
├── data/               # any data files not organized in the folders indicated below are those output throughout the analysis process for posterity
│   ├── raw/            # unprocessed pulls (Kaggle export, pytrends output, Reddit pulls)
│   └── complete/        # cleaned, merged CSVs used by the site
├── notebooks/           # data cleaning, merging, and analysis notebooks
    └── unused/         # notebooks used to pursue some analysis threads that ultimately weren't used in the final piece
├── index.html            # main site
├── bakeoffLineChart.js   # hero line chart + small multiples grid
├── bakeoffBarChart.js    # historical bakes bar chart
├── bakeoffRedditChart.js # r/baking vs r/bakeoff comparison chart
├── bakeoffScatterChart.js # bake-along leaderboard scatterplot
└── README.md
```

## Methodology notes

- GBBO airs on different dates in the U.K. (Channel 4) versus the U.S. (Netflix). This analysis uses UK air dates throughout, and search data is restricted to Great Britain accordingly.
- A technical was classified as a "historical bake" if it had negligible or no measurable search interest in the 30 days prior to air, excluding generic/well-known bakes (e.g. red velvet cake) that simply lacked strong recent search activity for unrelated reasons.
- Full methodology is also documented on the [published piece](#) itself.

## Built with

- [D3.js](https://d3js.org/) for data visualization
- [Rough.js](https://roughjs.com/) for hand-drawn chart styling
- [pytrends](https://github.com/GeneralMills/pytrends) for Google Trends data
- Python / pandas for data cleaning and analysis

## Author

[Rachel Vice](https://www.linkedin.com/in/rachel-vice/)