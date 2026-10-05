# Live production UX audit baseline

Production URL: https://fuelvoice.vercel.app
Records: 40
Rendered states: 36

| Signal | Count |
| --- | ---: |
| Document overflow | 0 |
| Page errors | 0 |
| Console errors | 4 |
| Failed requests | 0 |
| HTTP 4xx/5xx responses | 4 |
| Axe violations | 0 |
| Visible targets below 24px in either dimension | 42 |

## Overflow
None.

## Axe findings
None in audited states.

## Console/page/network signals
~~~json
{
  "pageErrors": [],
  "consoleErrors": [
    {
      "project": "live-1280",
      "scenario": "not-found",
      "error": "Failed to load resource: the server responded with a status of 404 ()"
    },
    {
      "project": "live-1920",
      "scenario": "not-found",
      "error": "Failed to load resource: the server responded with a status of 404 ()"
    },
    {
      "project": "live-375",
      "scenario": "not-found",
      "error": "Failed to load resource: the server responded with a status of 404 ()"
    },
    {
      "project": "live-768",
      "scenario": "not-found",
      "error": "Failed to load resource: the server responded with a status of 404 ()"
    }
  ],
  "failedRequests": [],
  "badResponses": [
    {
      "project": "live-1280",
      "scenario": "not-found",
      "error": "404 https://fuelvoice.vercel.app/live-ux-audit-not-a-route"
    },
    {
      "project": "live-1920",
      "scenario": "not-found",
      "error": "404 https://fuelvoice.vercel.app/live-ux-audit-not-a-route"
    },
    {
      "project": "live-375",
      "scenario": "not-found",
      "error": "404 https://fuelvoice.vercel.app/live-ux-audit-not-a-route"
    },
    {
      "project": "live-768",
      "scenario": "not-found",
      "error": "404 https://fuelvoice.vercel.app/live-ux-audit-not-a-route"
    }
  ]
}
~~~

## Undersized visible targets
~~~json
[
  {
    "project": "live-1280",
    "scenario": "admin-signed-out",
    "tag": "a",
    "role": null,
    "name": "FuelVoice",
    "width": 67.5,
    "height": 17,
    "x": 32,
    "y": 828
  },
  {
    "project": "live-1280",
    "scenario": "home-default",
    "tag": "a",
    "role": null,
    "name": "FuelVoice",
    "width": 67.5,
    "height": 17,
    "x": 32,
    "y": 2497
  },
  {
    "project": "live-1280",
    "scenario": "home-theme-toggled",
    "tag": "a",
    "role": null,
    "name": "FuelVoice",
    "width": 67.5,
    "height": 17,
    "x": 32,
    "y": 2497
  },
  {
    "project": "live-1280",
    "scenario": "keyboard-search-arrival",
    "tag": "a",
    "role": null,
    "name": "FuelVoice",
    "width": 67.5,
    "height": 17,
    "x": 32,
    "y": 938
  },
  {
    "project": "live-1280",
    "scenario": "not-found",
    "tag": "a",
    "role": null,
    "name": "FuelVoice",
    "width": 67.5,
    "height": 17,
    "x": 32,
    "y": 828
  },
  {
    "project": "live-1280",
    "scenario": "search-focused",
    "tag": "a",
    "role": null,
    "name": "FuelVoice",
    "width": 67.5,
    "height": 17,
    "x": 32,
    "y": 938
  },
  {
    "project": "live-1280",
    "scenario": "search-query",
    "tag": "a",
    "role": null,
    "name": "FuelVoice",
    "width": 67.5,
    "height": 17,
    "x": 32,
    "y": 938
  },
  {
    "project": "live-1280",
    "scenario": "station-default",
    "tag": "a",
    "role": null,
    "name": "Directions ↗",
    "width": 74,
    "height": 16,
    "x": 1014,
    "y": 1803
  },
  {
    "project": "live-1280",
    "scenario": "station-default",
    "tag": "a",
    "role": null,
    "name": "FuelVoice",
    "width": 67.5,
    "height": 17,
    "x": 32,
    "y": 2340
  },
  {
    "project": "live-1280",
    "scenario": "station-reviews",
    "tag": "a",
    "role": null,
    "name": "Directions ↗",
    "width": 74,
    "height": 16,
    "x": 1014,
    "y": 1803
  },
  {
    "project": "live-1280",
    "scenario": "station-reviews",
    "tag": "a",
    "role": null,
    "name": "FuelVoice",
    "width": 67.5,
    "height": 17,
    "x": 32,
    "y": 2340
  },
  {
    "project": "live-1920",
    "scenario": "admin-signed-out",
    "tag": "a",
    "role": null,
    "name": "FuelVoice",
    "width": 67.5,
    "height": 17,
    "x": 320,
    "y": 1008
  },
  {
    "project": "live-1920",
    "scenario": "home-default",
    "tag": "a",
    "role": null,
    "name": "FuelVoice",
    "width": 67.5,
    "height": 17,
    "x": 320,
    "y": 2677
  },
  {
    "project": "live-1920",
    "scenario": "home-theme-toggled",
    "tag": "a",
    "role": null,
    "name": "FuelVoice",
    "width": 67.5,
    "height": 17,
    "x": 320,
    "y": 2677
  },
  {
    "project": "live-1920",
    "scenario": "keyboard-search-arrival",
    "tag": "a",
    "role": null,
    "name": "FuelVoice",
    "width": 67.5,
    "height": 17,
    "x": 320,
    "y": 1118
  },
  {
    "project": "live-1920",
    "scenario": "not-found",
    "tag": "a",
    "role": null,
    "name": "FuelVoice",
    "width": 67.5,
    "height": 17,
    "x": 320,
    "y": 1008
  },
  {
    "project": "live-1920",
    "scenario": "search-focused",
    "tag": "a",
    "role": null,
    "name": "FuelVoice",
    "width": 67.5,
    "height": 17,
    "x": 320,
    "y": 1118
  },
  {
    "project": "live-1920",
    "scenario": "search-query",
    "tag": "a",
    "role": null,
    "name": "FuelVoice",
    "width": 67.5,
    "height": 17,
    "x": 320,
    "y": 1118
  },
  {
    "project": "live-1920",
    "scenario": "station-default",
    "tag": "a",
    "role": null,
    "name": "Directions ↗",
    "width": 74,
    "height": 16,
    "x": 1334,
    "y": 1803
  },
  {
    "project": "live-1920",
    "scenario": "station-default",
    "tag": "a",
    "role": null,
    "name": "FuelVoice",
    "width": 67.5,
    "height": 17,
    "x": 320,
    "y": 2340
  },
  {
    "project": "live-1920",
    "scenario": "station-reviews",
    "tag": "a",
    "role": null,
    "name": "Directions ↗",
    "width": 74,
    "height": 16,
    "x": 1334,
    "y": 1803
  },
  {
    "project": "live-1920",
    "scenario": "station-reviews",
    "tag": "a",
    "role": null,
    "name": "FuelVoice",
    "width": 67.5,
    "height": 17,
    "x": 320,
    "y": 2340
  },
  {
    "project": "live-375",
    "scenario": "admin-signed-out",
    "tag": "a",
    "role": null,
    "name": "FuelVoice",
    "width": 67.5,
    "height": 17,
    "x": 16,
    "y": 660
  },
  {
    "project": "live-375",
    "scenario": "home-default",
    "tag": "a",
    "role": null,
    "name": "FuelVoice",
    "width": 67.5,
    "height": 17,
    "x": 16,
    "y": 2517
  },
  {
    "project": "live-375",
    "scenario": "home-theme-toggled",
    "tag": "a",
    "role": null,
    "name": "FuelVoice",
    "width": 67.5,
    "height": 17,
    "x": 16,
    "y": 2517
  },
  {
    "project": "live-375",
    "scenario": "keyboard-search-arrival",
    "tag": "a",
    "role": null,
    "name": "FuelVoice",
    "width": 67.5,
    "height": 17,
    "x": 16,
    "y": 905
  },
  {
    "project": "live-375",
    "scenario": "not-found",
    "tag": "a",
    "role": null,
    "name": "FuelVoice",
    "width": 67.5,
    "height": 17,
    "x": 16,
    "y": 660
  },
  {
    "project": "live-375",
    "scenario": "search-focused",
    "tag": "a",
    "role": null,
    "name": "FuelVoice",
    "width": 67.5,
    "height": 17,
    "x": 16,
    "y": 905
  },
  {
    "project": "live-375",
    "scenario": "search-query",
    "tag": "a",
    "role": null,
    "name": "FuelVoice",
    "width": 67.5,
    "height": 17,
    "x": 16,
    "y": 905
  },
  {
    "project": "live-375",
    "scenario": "station-default",
    "tag": "a",
    "role": null,
    "name": "FuelVoice",
    "width": 67.5,
    "height": 17,
    "x": 16,
    "y": 3016
  },
  {
    "project": "live-375",
    "scenario": "station-reviews",
    "tag": "a",
    "role": null,
    "name": "FuelVoice",
    "width": 67.5,
    "height": 17,
    "x": 16,
    "y": 3016
  },
  {
    "project": "live-768",
    "scenario": "admin-signed-out",
    "tag": "a",
    "role": null,
    "name": "FuelVoice",
    "width": 67.5,
    "height": 17,
    "x": 24,
    "y": 952
  },
  {
    "project": "live-768",
    "scenario": "home-default",
    "tag": "a",
    "role": null,
    "name": "FuelVoice",
    "width": 67.5,
    "height": 17,
    "x": 24,
    "y": 3216
  },
  {
    "project": "live-768",
    "scenario": "home-theme-toggled",
    "tag": "a",
    "role": null,
    "name": "FuelVoice",
    "width": 67.5,
    "height": 17,
    "x": 24,
    "y": 3216
  },
  {
    "project": "live-768",
    "scenario": "keyboard-search-arrival",
    "tag": "a",
    "role": null,
    "name": "FuelVoice",
    "width": 67.5,
    "height": 17,
    "x": 24,
    "y": 1062
  },
  {
    "project": "live-768",
    "scenario": "not-found",
    "tag": "a",
    "role": null,
    "name": "FuelVoice",
    "width": 67.5,
    "height": 17,
    "x": 24,
    "y": 952
  },
  {
    "project": "live-768",
    "scenario": "search-focused",
    "tag": "a",
    "role": null,
    "name": "FuelVoice",
    "width": 67.5,
    "height": 17,
    "x": 24,
    "y": 1062
  },
  {
    "project": "live-768",
    "scenario": "search-query",
    "tag": "a",
    "role": null,
    "name": "FuelVoice",
    "width": 67.5,
    "height": 17,
    "x": 24,
    "y": 1062
  },
  {
    "project": "live-768",
    "scenario": "station-default",
    "tag": "a",
    "role": null,
    "name": "Directions ↗",
    "width": 74,
    "height": 16,
    "x": 670,
    "y": 1962
  },
  {
    "project": "live-768",
    "scenario": "station-default",
    "tag": "a",
    "role": null,
    "name": "FuelVoice",
    "width": 67.5,
    "height": 17,
    "x": 24,
    "y": 2550
  },
  {
    "project": "live-768",
    "scenario": "station-reviews",
    "tag": "a",
    "role": null,
    "name": "Directions ↗",
    "width": 74,
    "height": 16,
    "x": 670,
    "y": 1962
  },
  {
    "project": "live-768",
    "scenario": "station-reviews",
    "tag": "a",
    "role": null,
    "name": "FuelVoice",
    "width": 67.5,
    "height": 17,
    "x": 24,
    "y": 2550
  }
]
~~~
