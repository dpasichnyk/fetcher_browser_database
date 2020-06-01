import { readDBCached } from "./db_cache";
import { random, fromArrayToObject, assertUnreachable } from "./util";
import CountryLanguage from "country-language";

export enum Browser {
  CHROME = "chrome",
  SAFARI = "safari",
  FIREFOX = "firefox"
}

export enum HttpVersion {
  V1,
  V2
}

interface BrowserFormatArgs {
  applekit?: string,
  platform: string,
  version: string,
}

interface CommonHeaders {
  [key: string]: string;
}

export const BROWSER_HEADERS = [
  "Accept",
  "Accept-Encoding",
  "Accept-Language",
  "Connection",
  "Dnt",
  "Sec-Fetch-Mode",
  "Sec-Fetch-Site",
  "Te",
  "Upgrade-Insecure-Requests",
  "Cache-Control",
  "User-Agent",
  // Chrome, starting from version 60 has lowercase headers.
  "accept",
  "accept-encoding",
  "accept-language",
  "connection",
  "dnt",
  "sec-fetch-mode",
  "sec-fetch-site",
  "te",
  "upgrade-insecure-requests",
  "cache-control",
  "user-agent"
];

export async function sample(country: string, httpVersion: HttpVersion): Promise<CommonHeaders> {
  const browser = sampleBrowser();

  const browserVersion = await readDBCached(`versions_${browser}.txt`)
      .then(versions => versions.filter(byVersion(browser, httpVersion)))
      .then(random);

  const userAgent = await sampleUserAgent(browser, browserVersion);
  return await generateHeaders(browser, browserVersion, userAgent, country, httpVersion);
}

export async function sampleUserAgent(browser: Browser, browserVersion: string) {
  const browserFormat = sampleFormat(browser);
  const platform = await samplePlatform(browser);

  return browserFormat({ platform, version: browserVersion, applekit: await applekit(browser, browserVersion)})
}

export function sampleBrowser(): Browser {
  const rand = Math.random();
  if(rand <= 0.82) return Browser.CHROME;
  if(rand <= 0.93) return Browser.FIREFOX;
  return Browser.SAFARI;
}

export function sampleFormat(browser: Browser): (infos: BrowserFormatArgs) => string {
  switch(browser) {
    case Browser.CHROME:
      return ({ applekit, platform, version }) =>
        `Mozilla/5.0 (${platform}) AppleWebKit/${applekit} (KHTML, like Gecko) Chrome/${version} Safari/${applekit}`;
    case Browser.FIREFOX:
      return ({ platform, version }) =>
        `Mozilla/5.0 (${platform}; rv:${version}) Gecko/20100101 Firefox/${version}`;
    case Browser.SAFARI:
      return ({ platform, version, applekit }) =>
        `Mozilla/5.0 (${platform}) AppleWebKit/${applekit} (KHTML, like Gecko) Version/${version} Safari/${applekit}`;
    default:
      return assertUnreachable(browser);
  }
}

export async function samplePlatform(browser: Browser): Promise<string> {
  const lines = await Promise.all([
    readDBCached(`platform_mac_${browser}.txt`),
    readDBCached(`platform_windows.txt`),
    readDBCached(`platform_linux.txt`)
  ]).then((a) => a.flat());

  return random(lines);
}

function byVersion(browser: Browser, httpVersion: HttpVersion): (version: string) => boolean {
  if(httpVersion != HttpVersion.V2) {
    return (v: string) => true;
  }

  switch(browser) {
    case Browser.CHROME:
      return (v: string) => parseInt(v) >= 67;
    case Browser.FIREFOX:
      return (v: string) => parseInt(v) >= 60;
    case Browser.SAFARI:
      return (v: string) => parseInt(v) >= 13;
    default:
      return assertUnreachable(browser);
  }
}

let applekitCache: { [key: string]: string };

async function applekit(browser: Browser, version: string): Promise<string | undefined> {
  switch(browser) {
    case Browser.CHROME:
      return "537.36";
    case Browser.SAFARI:
      if(!applekitCache) {
        applekitCache = await readDBCached('applekit_safari.txt')
          .then(lines => lines.map(line => line.split('=')))
          .then(fromArrayToObject)
      }
      return applekitCache[version];
  }
  return undefined;
}

async function generateHeaders(browser: Browser, browserVersion: string, userAgent: string, country: string, httpVersion: HttpVersion): Promise<CommonHeaders> {
  const headers: any = await generateCommonHeaders(browser, browserVersion, userAgent, country, httpVersion);

  if (httpVersion != HttpVersion.V2) {
    if (browser === Browser.CHROME) {
      headers.connection = 'keep-alive';
    } else {
      headers.Connection = 'keep-alive';
    }
  }

  return headers;
}

async function generateCommonHeaders(browser: Browser, browserVersion: string, userAgent: string, country: string, httpVersion: HttpVersion): Promise<CommonHeaders> {
  const browserVersionNumber: number = parseInt(browserVersion);

  switch(browser) {
    case Browser.CHROME:
      const chromeHeaders = {
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
        "accept-encoding": "gzip, deflate, br",
        "accept-language": await acceptLanguage(browser, country),
        "upgrade-insecure-requests": "1",
        "cache-control": "no-cache",
        "user-agent": userAgent
      };

      if (browserVersionNumber >= 73) {
        const accept = chromeHeaders.accept;
        chromeHeaders.accept = accept + ',application/signed-exchange;v=b3';
      }

      return chromeHeaders;
    case Browser.FIREFOX:
      const headers: CommonHeaders = {
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Encoding": "gzip, deflate, br",
        "Accept-Language": await acceptLanguage(browser, country),
        "Upgrade-Insecure-Requests": "1",
        "Cache-Control": "no-cache",
        "User-Agent": userAgent
      };

      if(httpVersion === HttpVersion.V2) {
        headers.Te = "trailers"
      }

      return headers;
    case Browser.SAFARI:
      return {
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Encoding": "gzip, deflate, br",
        "Accept-Language": await acceptLanguage(browser, country),
        "Cache-Control": "no-cache",
        "User-Agent": userAgent
      };
    default:
      return assertUnreachable(browser);
  }
}

async function acceptLanguage(browser: Browser, country: string): Promise<string> {
  return new Promise((resolve, reject) => {
    CountryLanguage.getCountry(country, (err: any, countryObj: any) => {
      if(err) {
        reject(`Unsupported Country detected: ${country}`);
      }

      const { languages: [{ iso639_1 },], code_2 } = countryObj;

      let acceptLanguage = "";
      switch(browser) {
        case Browser.CHROME:
          if(country === 'de') {
            acceptLanguage = 'de-DE,de;q=0.8,en-US;q=0.6,en;q=0.4';
          } else {
            acceptLanguage = `${iso639_1}-${code_2},${iso639_1};q=0.8`;
            if(iso639_1 !== 'en') {
              acceptLanguage = `${acceptLanguage},en;q=0.6`;
            }
          }
          break;
        case Browser.FIREFOX:
          if(country === 'de') {
            acceptLanguage = 'de,en-US;q=0.7,en;q=0.3'
          } else {
            const fallback = iso639_1 === 'en' ? `-${code_2}` : '';
            acceptLanguage = `${iso639_1}${fallback},en;q=0.5`
          }
          break;
        case Browser.SAFARI:
          acceptLanguage = `${iso639_1}-${code_2.toLowerCase()}`;
          break;
      }
      return resolve(acceptLanguage);
    })
  })
}
