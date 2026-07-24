import type { FastifyRequest } from "fastify";
import geoip from "geoip-lite";

const COUNTRY_NAMES: Record<string, string> = {
  CN: "中国",
  US: "美国",
  JP: "日本",
  HK: "中国香港",
  TW: "中国台湾",
  SG: "新加坡",
  KR: "韩国",
  GB: "英国",
  DE: "德国",
  FR: "法国",
};

function normalizeIp(raw: string): string | null {
  const ip = raw.trim();
  if (!ip) return null;
  if (ip.startsWith("::ffff:")) return ip.slice(7);
  return ip;
}

export function getClientIp(request: FastifyRequest): string | null {
  const forwarded = request.headers["x-forwarded-for"];
  if (typeof forwarded === "string") {
    return normalizeIp(forwarded.split(",")[0] || "");
  }
  if (Array.isArray(forwarded) && forwarded[0]) {
    return normalizeIp(forwarded[0].split(",")[0] || "");
  }

  const realIp = request.headers["x-real-ip"];
  if (typeof realIp === "string") return normalizeIp(realIp);

  return request.ip ? normalizeIp(request.ip) : null;
}

function isPrivateIp(ip: string): boolean {
  if (ip === "127.0.0.1" || ip === "::1") return true;
  if (ip.startsWith("10.") || ip.startsWith("192.168.")) return true;
  const match = ip.match(/^172\.(\d+)\./);
  if (match) {
    const second = Number(match[1]);
    if (second >= 16 && second <= 31) return true;
  }
  return false;
}

export function lookupRegion(ip: string | null): string | null {
  if (!ip || isPrivateIp(ip)) return "本地/内网";

  const geo = geoip.lookup(ip);
  if (!geo) return null;

  const country = COUNTRY_NAMES[geo.country] || geo.country;
  const parts = [country, geo.city].filter(Boolean);
  return parts.join(" · ") || null;
}

export function resolveGuestGeo(request: FastifyRequest) {
  const ip = getClientIp(request);
  return { ip, region: lookupRegion(ip) };
}
