/**
 * IP Geolocation service using local MaxMind GeoLite2 database
 * No API rate limits - unlimited lookups!
 */

import { Reader } from '@maxmind/geoip2-node';
import type { GeoLocation } from '../src/types';
import { join } from 'path';

/** Path to GeoLite2 database */
const DB_PATH = join(import.meta.dir, '../data/GeoLite2-City.mmdb');

/** MaxMind reader instance */
let reader: Reader | null = null;

/** Initialize the database reader */
async function initReader(): Promise<Reader | null> {
  if (reader) return reader;

  try {
    reader = await Reader.open(DB_PATH);
    console.log('GeoLite2 database loaded successfully');
    return reader;
  } catch (error) {
    console.error('Failed to load GeoLite2 database:', error);
    return null;
  }
}

// Initialize on startup
initReader();

/**
 * Generate a deterministic hash from a string identifier
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Generate unique coordinates from an identifier hash
 * Ensures each identifier gets a consistent but unique location on the globe
 * Uses a better distribution algorithm to avoid clustering and ensure realistic spread
 */
function generateLocationFromHash(identifier: string): { lat: number; lng: number } {
  const hash = hashString(identifier);
  // Use different parts of the hash for lat and lng to ensure good distribution
  // Split hash into two parts for better distribution
  const hash1 = hash & 0xFFFF; // Lower 16 bits
  const hash2 = (hash >> 16) & 0xFFFF; // Upper 16 bits
  
  // Generate lat/lng with better distribution
  // Use modulo to ensure valid ranges
  const lat = ((hash1 % 180) - 90); // -90 to 90 (latitude)
  const lng = ((hash2 % 360) - 180); // -180 to 180 (longitude)
  
  // Ensure coordinates are valid numbers
  if (isNaN(lat) || isNaN(lng) || !isFinite(lat) || !isFinite(lng)) {
    console.error(`[Geolocation] Invalid coordinates generated for ${identifier}: lat=${lat}, lng=${lng}`);
    return { lat: 0, lng: 0 };
  }
  
  console.log(`[Geolocation] Generated location for ${identifier}: lat=${lat}, lng=${lng} (hash=${hash}, hash1=${hash1}, hash2=${hash2})`);
  
  return { lat, lng };
}

/**
 * Look up geolocation data for an IP address
 * Uses local MaxMind database - no rate limits!
 */
export async function getGeolocation(ip: string, identifier?: string): Promise<GeoLocation | null> {
  // Skip localhost/private IPs (but log for debugging)
  if (isPrivateIP(ip)) {
    console.log(`[Geolocation] Skipping private IP: ${ip}`);
    // For development, return a unique location based on identifier hash
    if (process.env.NODE_ENV !== 'production') {
      if (identifier) {
        const { lat, lng } = generateLocationFromHash(identifier);
        return {
          lat,
          lng,
          city: 'Local',
          region: 'Development',
          country: 'Unknown',
          countryCode: 'XX',
          timezone: 'UTC',
          isp: 'Local Network',
          org: 'Development',
          as: 'Unknown',
        };
      }
      // Fallback to (0, 0) if no identifier provided
      return {
        lat: 0,
        lng: 0,
        city: 'Local',
        region: 'Development',
        country: 'Unknown',
        countryCode: 'XX',
        timezone: 'UTC',
        isp: 'Local Network',
        org: 'Development',
        as: 'Unknown',
      };
    }
    return null;
  }

  try {
    const db = await initReader();
    if (!db) {
      return null;
    }

    const result = db.city(ip);

    if (!result) {
      return null;
    }

    const geo: GeoLocation = {
      lat: result.location?.latitude || 0,
      lng: result.location?.longitude || 0,
      city: result.city?.names?.en || 'Unknown',
      region: result.subdivisions?.[0]?.names?.en || 'Unknown',
      country: result.country?.names?.en || 'Unknown',
      countryCode: result.country?.isoCode || 'XX',
      timezone: result.location?.timeZone || 'UTC',
      isp: result.traits?.isp || result.traits?.organization || 'Unknown',
      org: result.traits?.organization || 'Unknown',
      as: result.traits?.autonomousSystemOrganization || 'Unknown',
    };

    return geo;
  } catch (error) {
    // Silently handle lookup errors (invalid IPs, etc.)
    return null;
  }
}

/**
 * Check if an IP is private/localhost
 */
function isPrivateIP(ip: string): boolean {
  // IPv4 private ranges
  if (
    ip === '127.0.0.1' ||
    ip === 'localhost' ||
    ip === 'unknown' ||
    ip.startsWith('10.') ||
    ip.startsWith('172.16.') ||
    ip.startsWith('172.17.') ||
    ip.startsWith('172.18.') ||
    ip.startsWith('172.19.') ||
    ip.startsWith('172.20.') ||
    ip.startsWith('172.21.') ||
    ip.startsWith('172.22.') ||
    ip.startsWith('172.23.') ||
    ip.startsWith('172.24.') ||
    ip.startsWith('172.25.') ||
    ip.startsWith('172.26.') ||
    ip.startsWith('172.27.') ||
    ip.startsWith('172.28.') ||
    ip.startsWith('172.29.') ||
    ip.startsWith('172.30.') ||
    ip.startsWith('172.31.') ||
    ip.startsWith('192.168.') ||
    ip.startsWith('169.254.')
  ) {
    return true;
  }

  // IPv6 localhost
  if (ip === '::1' || ip === '::ffff:127.0.0.1') {
    return true;
  }

  return false;
}
