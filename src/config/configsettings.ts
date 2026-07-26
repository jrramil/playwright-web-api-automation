import fs from 'fs';
import path from 'path';

// Target keys supported by config and environment overrides. Any key ending in
// `_Web` or `_Api` can also be overridden by an environment variable of the same name.
export type PortalName = 'CheapFlights_Web' | 'RestfulBooker_Api';

// Credentials for token-authenticated API targets (restful-booker).
export interface ApiAuthUser {
  Username: string;
  Password: string;
}

// Runsettings loaded from config with optional overrides.
export interface ConfigSettings {
  Environment: string;
  Portals: Record<string, string>;
  ApiAuth?: Record<string, ApiAuthUser>;
}

// Cache settings to avoid re-reading files per test.
let cached: ConfigSettings | null = null;

function resolveEnv(): string {
  // Normalize to uppercase to match config structure.
  return (process.env.ENVIRONMENT ?? 'QA').toUpperCase();
}

function loadConfigSettingsFile(env: string): ConfigSettings {
  // Environment-specific config file name.
  const filename = `configsettings.${env.toLowerCase()}.json`;
  const filePath = path.resolve(process.cwd(), 'config', filename);

  if (!fs.existsSync(filePath)) {
    throw new Error(`Config settings file not found: ${filePath}. Create config/${filename}.`);
  }

  const raw = fs.readFileSync(filePath, 'utf-8');
  const parsed = JSON.parse(raw) as ConfigSettings;

  // Allow ENVIRONMENT override even if file has different casing.
  parsed.Environment = env;
  return parsed;
}

export function getConfigSettings(): ConfigSettings {
  if (cached) return cached;

  // Load and merge file settings with environment overrides.
  const env = resolveEnv();
  const file = loadConfigSettingsFile(env);

  const merged: ConfigSettings = {
    ...file,
    Environment: env,
    Portals: { ...(file.Portals ?? {}) },
  };

  const baseUrl = (process.env.BASE_URL ?? '').trim();

  // Collect portal keys dynamically.
  const portalKeys = new Set<string>(Object.keys(merged.Portals));

  for (const key of Object.keys(process.env)) {
    if (key.endsWith('_Portal') || key.endsWith('_Web') || key.endsWith('_Api')) {
      portalKeys.add(key);
    }
  }

  // Apply overrides + fallback.
  for (const portal of portalKeys) {
    const envValue = (process.env[portal] ?? '').trim();

    if (envValue) {
      merged.Portals[portal] = envValue;
    } else if (!merged.Portals[portal] && baseUrl) {
      merged.Portals[portal] = baseUrl;
    }
  }

  cached = merged;
  return cached;
}

export function getPortalUrl(portalName: string): string {
  // Resolve portal URL from merged config.
  const { Portals } = getConfigSettings();

  const url = Portals[portalName];
  if (!url) {
    throw new Error(`Portal '${portalName}' not found. Available: ${Object.keys(Portals).join(', ')}`);
  }

  return url;
}

export function getApiAuth(name: string): ApiAuthUser {
  // Resolve API credentials (non-Entra targets) from config.
  const { ApiAuth } = getConfigSettings();

  const user = ApiAuth?.[name];
  if (!user?.Username || !user?.Password) {
    throw new Error(`ApiAuth entry '${name}' not found or incomplete. Available: ${Object.keys(ApiAuth ?? {}).join(', ')}`);
  }

  return user;
}
