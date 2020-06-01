# @schwarm/fetcher_browser_database

Written in typescript, useable in JavaScript, this library allows you to generate random headers based on a country and http version.

## Installation

```sh
yarn add @schwarm/fetcher_browser_database
```

## Usage

```js
import { sample, HttpVersion } from '@schwarm/fetcher_browser_database';

const headers = sample("de", HttpVersion.V2);

// headers = { Accept:
//  'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
//  'Accept-Encoding': 'gzip, deflate, sdch, br',
//  'Accept-Language': 'de-DE,de;q=0.8,en-US;q=0.6,en;q=0.4',
//  'Connection': 'keep-alive',
//  'Upgrade-Insecure-Requests': '1',
//  'Cache-Control': 'no-cache',
//  'User-Agent': 'Mozilla/5.0 (X11; RemixOS; CrOS x86_64) AppleWebKit/537.36 ...
// }

```
