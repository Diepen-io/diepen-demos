import { BlockList, isIP } from "node:net";

/**
 * Addresses a server-side fetch must never reach: private, loopback, link-local, unique-local,
 * multicast and other special ranges, for IPv4 and IPv6. Node's BlockList matches an IPv4-mapped
 * IPv6 address against the IPv4 ranges, so `::ffff:127.0.0.1` is refused like `127.0.0.1`. Other
 * IPv6 forms that embed an IPv4 address (NAT64, 6to4, Teredo) are refused whole.
 */
const blocked = new BlockList();

const ipv4Ranges: [string, number][] = [
  ["0.0.0.0", 8], // "this network"
  ["10.0.0.0", 8], // private
  ["100.64.0.0", 10], // carrier-grade NAT
  ["127.0.0.0", 8], // loopback
  ["169.254.0.0", 16], // link-local, includes cloud metadata endpoints
  ["172.16.0.0", 12], // private
  ["192.0.0.0", 24], // protocol assignments
  ["192.0.2.0", 24], // documentation
  ["192.88.99.0", 24], // 6to4 relay
  ["192.168.0.0", 16], // private
  ["198.18.0.0", 15], // benchmarking
  ["198.51.100.0", 24], // documentation
  ["203.0.113.0", 24], // documentation
  ["224.0.0.0", 4], // multicast
  ["240.0.0.0", 4], // reserved and broadcast
];

const ipv6Ranges: [string, number][] = [
  ["::", 128], // unspecified
  ["::1", 128], // loopback
  ["64:ff9b::", 96], // NAT64
  ["100::", 64], // discard
  ["2001::", 32], // Teredo
  ["2001:db8::", 32], // documentation
  ["2002::", 16], // 6to4
  ["fc00::", 7], // unique-local
  ["fe80::", 10], // link-local
  ["fec0::", 10], // old site-local
  ["ff00::", 8], // multicast
];

for (const [network, prefix] of ipv4Ranges) blocked.addSubnet(network, prefix, "ipv4");
for (const [network, prefix] of ipv6Ranges) blocked.addSubnet(network, prefix, "ipv6");

/** True only for a valid IP literal outside every blocked range. */
export function isPublicAddress(address: string): boolean {
  const version = isIP(address);
  if (version === 0) return false;
  return !blocked.check(address, version === 4 ? "ipv4" : "ipv6");
}
