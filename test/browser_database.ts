import { sample, HttpVersion, sampleBrowser, Browser } from '../src/browser_database';

describe('.sample', () => {
  it('should produce useful headers', async () => {
    const headers = await sample('de', HttpVersion.V2);

    if (headers["User-Agent"]) {
      expect(headers["Accept-Language"]).toMatch(/de/);
      expect(headers["User-Agent"].length).not.toBe(0);
      expect(headers["Accept-Encoding"].length).not.toBe(0);
      expect(headers["Accept-Language"].length).not.toBe(0);
    } else {
      expect(headers["accept-language"]).toMatch(/de/);
      expect(headers["user-agent"].length).not.toBe(0);
      expect(headers["accept-encoding"].length).not.toBe(0);
      expect(headers["accept-language"].length).not.toBe(0);
    }
  });

  it('should not set Connection when HTTP2 is set', async () => {
    const headers = await sample('de', HttpVersion.V2);

    expect(headers.Connection).toBeUndefined();
  });

  it('should set Connection when HTTP1 is set', async () => {
    const headers = await sample('de', HttpVersion.V1);

    if (headers.Connection){
      expect(headers.Connection).not.toBeUndefined();
    } else {
      expect(headers.connection).not.toBeUndefined();
    }
  });
});

describe('.sampleBrowser', () => {
  it('produces one of chrome, firefox or safari', () => {
    for (const _ of Array(50)) {
      const browser = sampleBrowser();
      expect(Object.values(Browser)).toContain(browser);
    }
  })
});
