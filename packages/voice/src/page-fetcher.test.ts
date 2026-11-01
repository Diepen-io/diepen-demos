import { describe, expect, it, vi } from "vitest";
import { createPageFetcher, PageFetchError, type Resolver } from "./page-fetcher.ts";
import { isPublicAddress } from "./public-address.ts";

describe("isPublicAddress", () => {
  it.each([
    "10.1.2.3",
    "172.16.0.1",
    "172.31.255.255",
    "192.168.1.1",
    "127.0.0.1",
    "0.0.0.0",
    "169.254.169.254",
    "100.64.0.1",
    "224.0.0.1",
    "255.255.255.255",
    "::1",
    "::",
    "fe80::1",
    "fc00::1",
    "fd12:3456::1",
    "ff02::1",
    "::ffff:127.0.0.1",
    "::ffff:10.0.0.1",
    "::ffff:7f00:1",
    "::ffff:192.168.1.1",
    "::ffff:a9fe:a9fe",
    "::127.0.0.1",
    "::7f00:1",
    "::10.0.0.1",
    "::ffff:0:127.0.0.1",
    "::ffff:0:a00:1",
    "0:0:0:0:0:ffff:a9fe:a9fe",
    "64:ff9b::a00:1",
    "not-an-ip",
  ])("refuses %s", (address) => {
    expect(isPublicAddress(address)).toBe(false);
  });

  it.each(["93.184.215.14", "1.1.1.1", "172.32.0.1", "2606:4700::1111", "2a00:1450:4001:80b::200e"])(
    "allows %s",
    (address) => {
      expect(isPublicAddress(address)).toBe(true);
    },
  );
});

describe("createPageFetcher", () => {
  const resolverFor = (address: string, family = 4): Resolver => vi.fn(() => Promise.resolve([{ address, family }]));

  it("refuses a host that resolves to a private address", async () => {
    const resolve = resolverFor("10.0.0.5");
    const fetchPage = createPageFetcher({ resolve });
    await expect(fetchPage("http://intranet.acme.example/")).rejects.toThrow("not a public website");
    expect(resolve).toHaveBeenCalledWith("intranet.acme.example");
  });

  it("refuses a host when any resolved address is private", async () => {
    const resolve: Resolver = () =>
      Promise.resolve([
        { address: "93.184.215.14", family: 4 },
        { address: "127.0.0.1", family: 4 },
      ]);
    await expect(createPageFetcher({ resolve })("https://rebind.example/")).rejects.toBeInstanceOf(PageFetchError);
  });

  it("refuses IPv6 loopback and link-local answers", async () => {
    await expect(createPageFetcher({ resolve: resolverFor("::1", 6) })("https://six.example/")).rejects.toThrow(
      "not a public website",
    );
    await expect(createPageFetcher({ resolve: resolverFor("fe80::1", 6) })("https://six.example/")).rejects.toThrow(
      "not a public website",
    );
  });

  it("refuses private IP literals without a lookup", async () => {
    const resolve = resolverFor("93.184.215.14");
    const fetchPage = createPageFetcher({ resolve });
    await expect(fetchPage("http://127.0.0.1/")).rejects.toThrow("not a public website");
    await expect(fetchPage("http://[::1]/")).rejects.toThrow("not a public website");
    await expect(fetchPage("http://169.254.169.254/latest/meta-data")).rejects.toThrow("not a public website");
    expect(resolve).not.toHaveBeenCalled();
  });

  it("refuses other protocols, odd ports and non-URLs", async () => {
    const fetchPage = createPageFetcher({ resolve: resolverFor("93.184.215.14") });
    await expect(fetchPage("file:///etc/passwd")).rejects.toThrow("http or https");
    await expect(fetchPage("ftp://acme.example/")).rejects.toThrow("http or https");
    await expect(fetchPage("http://acme.example:6379/")).rejects.toThrow("standard web ports");
    await expect(fetchPage("acme")).rejects.toThrow("not a website address");
  });

  it("reports a host that does not resolve", async () => {
    const resolve: Resolver = () => Promise.reject(new Error("ENOTFOUND"));
    await expect(createPageFetcher({ resolve })("https://missing.example/")).rejects.toThrow("could not find");
  });
});
