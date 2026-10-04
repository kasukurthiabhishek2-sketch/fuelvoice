# Live production UX audit baseline

Production URL: https://fuelvoice.vercel.app
Records: 40
Rendered states: 36

| Signal | Count |
| --- | ---: |
| Document overflow | 0 |
| Page errors | 0 |
| Console errors | 4 |
| Failed requests | 18 |
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
  "failedRequests": [
    {
      "project": "live-375",
      "scenario": "station-default",
      "error": "GET https://firestore.googleapis.com/google.firestore.v1.Firestore/Listen/channel?gsessionid=3QuwN3DqpQ-hzFEJQF-MYUotGdPt0X88CRV9R7dXuhEwsP60WmuqpQ&VER=8&database=projects%2Fbunk-review%2Fdatabases%2F(default)&RID=rpc&SID=PhsUul7whz1X7y5VcQrLvA&AID=0&CI=0&TYPE=xmlhttp&zx=ekasdi8kepar&t=1 :: net::ERR_ABORTED"
    },
    {
      "project": "live-375",
      "scenario": "station-default",
      "error": "GET https://firestore.googleapis.com/google.firestore.v1.Firestore/Listen/channel?gsessionid=3QuwN3DqpQ-hzFEJQF-MYUotGdPt0X88CRV9R7dXuhEwsP60WmuqpQ&VER=8&database=projects%2Fbunk-review%2Fdatabases%2F(default)&RID=rpc&SID=PhsUul7whz1X7y5VcQrLvA&AID=7&CI=1&TYPE=xmlhttp&zx=u6ewrrhm83fz&t=1 :: net::ERR_ABORTED"
    },
    {
      "project": "live-375",
      "scenario": "station-default",
      "error": "GET https://firestore.googleapis.com/google.firestore.v1.Firestore/Listen/channel?gsessionid=3QuwN3DqpQ-hzFEJQF-MYUotGdPt0X88CRV9R7dXuhEwsP60WmuqpQ&VER=8&database=projects%2Fbunk-review%2Fdatabases%2F(default)&RID=rpc&SID=PhsUul7whz1X7y5VcQrLvA&AID=9&CI=1&TYPE=xmlhttp&zx=h06g8za9ghj8&t=1 :: net::ERR_ABORTED"
    },
    {
      "project": "live-375",
      "scenario": "station-default",
      "error": "GET https://firestore.googleapis.com/google.firestore.v1.Firestore/Listen/channel?gsessionid=3QuwN3DqpQ-hzFEJQF-MYUotGdPt0X88CRV9R7dXuhEwsP60WmuqpQ&VER=8&database=projects%2Fbunk-review%2Fdatabases%2F(default)&RID=rpc&SID=PhsUul7whz1X7y5VcQrLvA&AID=11&CI=1&TYPE=xmlhttp&zx=pcvwu0uce8ib&t=1 :: net::ERR_ABORTED"
    },
    {
      "project": "live-375",
      "scenario": "station-default",
      "error": "GET https://firestore.googleapis.com/google.firestore.v1.Firestore/Listen/channel?gsessionid=3QuwN3DqpQ-hzFEJQF-MYUotGdPt0X88CRV9R7dXuhEwsP60WmuqpQ&VER=8&database=projects%2Fbunk-review%2Fdatabases%2F(default)&RID=rpc&SID=PhsUul7whz1X7y5VcQrLvA&AID=16&CI=1&TYPE=xmlhttp&zx=63ojdgn8e3uj&t=1 :: net::ERR_ABORTED"
    },
    {
      "project": "live-375",
      "scenario": "station-reviews",
      "error": "GET https://firestore.googleapis.com/google.firestore.v1.Firestore/Listen/channel?gsessionid=3QuwN3DqpQ-hzFEJQF-MYUotGdPt0X88CRV9R7dXuhEwsP60WmuqpQ&VER=8&database=projects%2Fbunk-review%2Fdatabases%2F(default)&RID=rpc&SID=PhsUul7whz1X7y5VcQrLvA&AID=0&CI=0&TYPE=xmlhttp&zx=ekasdi8kepar&t=1 :: net::ERR_ABORTED"
    },
    {
      "project": "live-375",
      "scenario": "station-reviews",
      "error": "GET https://firestore.googleapis.com/google.firestore.v1.Firestore/Listen/channel?gsessionid=3QuwN3DqpQ-hzFEJQF-MYUotGdPt0X88CRV9R7dXuhEwsP60WmuqpQ&VER=8&database=projects%2Fbunk-review%2Fdatabases%2F(default)&RID=rpc&SID=PhsUul7whz1X7y5VcQrLvA&AID=7&CI=1&TYPE=xmlhttp&zx=u6ewrrhm83fz&t=1 :: net::ERR_ABORTED"
    },
    {
      "project": "live-375",
      "scenario": "station-reviews",
      "error": "GET https://firestore.googleapis.com/google.firestore.v1.Firestore/Listen/channel?gsessionid=3QuwN3DqpQ-hzFEJQF-MYUotGdPt0X88CRV9R7dXuhEwsP60WmuqpQ&VER=8&database=projects%2Fbunk-review%2Fdatabases%2F(default)&RID=rpc&SID=PhsUul7whz1X7y5VcQrLvA&AID=9&CI=1&TYPE=xmlhttp&zx=h06g8za9ghj8&t=1 :: net::ERR_ABORTED"
    },
    {
      "project": "live-375",
      "scenario": "station-reviews",
      "error": "GET https://firestore.googleapis.com/google.firestore.v1.Firestore/Listen/channel?gsessionid=3QuwN3DqpQ-hzFEJQF-MYUotGdPt0X88CRV9R7dXuhEwsP60WmuqpQ&VER=8&database=projects%2Fbunk-review%2Fdatabases%2F(default)&RID=rpc&SID=PhsUul7whz1X7y5VcQrLvA&AID=11&CI=1&TYPE=xmlhttp&zx=pcvwu0uce8ib&t=1 :: net::ERR_ABORTED"
    },
    {
      "project": "live-375",
      "scenario": "station-reviews",
      "error": "GET https://firestore.googleapis.com/google.firestore.v1.Firestore/Listen/channel?gsessionid=3QuwN3DqpQ-hzFEJQF-MYUotGdPt0X88CRV9R7dXuhEwsP60WmuqpQ&VER=8&database=projects%2Fbunk-review%2Fdatabases%2F(default)&RID=rpc&SID=PhsUul7whz1X7y5VcQrLvA&AID=16&CI=1&TYPE=xmlhttp&zx=63ojdgn8e3uj&t=1 :: net::ERR_ABORTED"
    },
    {
      "project": "live-768",
      "scenario": "station-default",
      "error": "GET https://firestore.googleapis.com/google.firestore.v1.Firestore/Listen/channel?gsessionid=Pwf1RsTUl9u98q3tjisWnKzf32Eo09N7dzxqh7FW7biQiEgbkKD5LQ&VER=8&database=projects%2Fbunk-review%2Fdatabases%2F(default)&RID=rpc&SID=zxYycfSN6LCGm-nXy1hqeQ&AID=0&CI=0&TYPE=xmlhttp&zx=ipen15r2don8&t=1 :: net::ERR_ABORTED"
    },
    {
      "project": "live-768",
      "scenario": "station-default",
      "error": "GET https://firestore.googleapis.com/google.firestore.v1.Firestore/Listen/channel?gsessionid=Pwf1RsTUl9u98q3tjisWnKzf32Eo09N7dzxqh7FW7biQiEgbkKD5LQ&VER=8&database=projects%2Fbunk-review%2Fdatabases%2F(default)&RID=rpc&SID=zxYycfSN6LCGm-nXy1hqeQ&AID=6&CI=1&TYPE=xmlhttp&zx=6n8tfbw5vp12&t=1 :: net::ERR_ABORTED"
    },
    {
      "project": "live-768",
      "scenario": "station-default",
      "error": "GET https://firestore.googleapis.com/google.firestore.v1.Firestore/Listen/channel?gsessionid=Pwf1RsTUl9u98q3tjisWnKzf32Eo09N7dzxqh7FW7biQiEgbkKD5LQ&VER=8&database=projects%2Fbunk-review%2Fdatabases%2F(default)&RID=rpc&SID=zxYycfSN6LCGm-nXy1hqeQ&AID=8&CI=1&TYPE=xmlhttp&zx=9v5zliwlfypg&t=1 :: net::ERR_ABORTED"
    },
    {
      "project": "live-768",
      "scenario": "station-default",
      "error": "GET https://firestore.googleapis.com/google.firestore.v1.Firestore/Listen/channel?gsessionid=Pwf1RsTUl9u98q3tjisWnKzf32Eo09N7dzxqh7FW7biQiEgbkKD5LQ&VER=8&database=projects%2Fbunk-review%2Fdatabases%2F(default)&RID=rpc&SID=zxYycfSN6LCGm-nXy1hqeQ&AID=14&CI=1&TYPE=xmlhttp&zx=xf959z4oqrlc&t=1 :: net::ERR_ABORTED"
    },
    {
      "project": "live-768",
      "scenario": "station-reviews",
      "error": "GET https://firestore.googleapis.com/google.firestore.v1.Firestore/Listen/channel?gsessionid=Pwf1RsTUl9u98q3tjisWnKzf32Eo09N7dzxqh7FW7biQiEgbkKD5LQ&VER=8&database=projects%2Fbunk-review%2Fdatabases%2F(default)&RID=rpc&SID=zxYycfSN6LCGm-nXy1hqeQ&AID=0&CI=0&TYPE=xmlhttp&zx=ipen15r2don8&t=1 :: net::ERR_ABORTED"
    },
    {
      "project": "live-768",
      "scenario": "station-reviews",
      "error": "GET https://firestore.googleapis.com/google.firestore.v1.Firestore/Listen/channel?gsessionid=Pwf1RsTUl9u98q3tjisWnKzf32Eo09N7dzxqh7FW7biQiEgbkKD5LQ&VER=8&database=projects%2Fbunk-review%2Fdatabases%2F(default)&RID=rpc&SID=zxYycfSN6LCGm-nXy1hqeQ&AID=6&CI=1&TYPE=xmlhttp&zx=6n8tfbw5vp12&t=1 :: net::ERR_ABORTED"
    },
    {
      "project": "live-768",
      "scenario": "station-reviews",
      "error": "GET https://firestore.googleapis.com/google.firestore.v1.Firestore/Listen/channel?gsessionid=Pwf1RsTUl9u98q3tjisWnKzf32Eo09N7dzxqh7FW7biQiEgbkKD5LQ&VER=8&database=projects%2Fbunk-review%2Fdatabases%2F(default)&RID=rpc&SID=zxYycfSN6LCGm-nXy1hqeQ&AID=8&CI=1&TYPE=xmlhttp&zx=9v5zliwlfypg&t=1 :: net::ERR_ABORTED"
    },
    {
      "project": "live-768",
      "scenario": "station-reviews",
      "error": "GET https://firestore.googleapis.com/google.firestore.v1.Firestore/Listen/channel?gsessionid=Pwf1RsTUl9u98q3tjisWnKzf32Eo09N7dzxqh7FW7biQiEgbkKD5LQ&VER=8&database=projects%2Fbunk-review%2Fdatabases%2F(default)&RID=rpc&SID=zxYycfSN6LCGm-nXy1hqeQ&AID=14&CI=1&TYPE=xmlhttp&zx=xf959z4oqrlc&t=1 :: net::ERR_ABORTED"
    }
  ],
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
    "y": 1639
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
    "y": 1639
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
    "y": 1819
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
    "y": 1819
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
    "y": 2284
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
    "y": 2284
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
    "y": 1836
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
    "y": 1836
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
