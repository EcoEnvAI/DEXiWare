function parseBool(value) {
  if (value == null) return null;
  if (typeof value === 'boolean') return value;
  const normalized = String(value).trim().toLowerCase();
  if (['1', 'true', 'yes', 'y', 'on'].includes(normalized)) return true;
  if (['0', 'false', 'no', 'n', 'off'].includes(normalized)) return false;
  return null;
}

function requireEnv(name) {
  const value = process.env[name];
  if (value == null || String(value).trim() === '') {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function getBool(name, defaultValue) {
  const parsed = parseBool(process.env[name]);
  if (parsed == null) return defaultValue;
  return parsed;
}

function getInt(name, defaultValue) {
  const raw = process.env[name];
  if (raw == null || String(raw).trim() === '') return defaultValue;
  const parsed = Number.parseInt(raw, 10);
  if (Number.isNaN(parsed)) {
    throw new Error(`Invalid integer environment variable ${name}: ${raw}`);
  }
  return parsed;
}

function getAppBasePath() {
  return requireEnv('APP_BASE_PATH');
}

function getSmtpTransportConfig() {
  const host = requireEnv('SMTP_HOST');
  const port = getInt('SMTP_PORT');
  if (port == null) {
    throw new Error('Missing required environment variable: SMTP_PORT');
  }

  return {
    host,
    port,
    auth: {
      user: requireEnv('SMTP_USER'),
      pass: requireEnv('SMTP_PASS')
    }
  };
}

module.exports = {
  anonymous: getBool('ANONYMOUS', false),
  pillar_models: getBool('PILLAR_MODELS', false),
  registration: getBool('REGISTRATION_ENABLED', true),
  appBasePath: getAppBasePath(),
  emailFrom: requireEnv('EMAIL_FROM'),
  getSmtpTransportConfig
};
