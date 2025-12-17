const db = require('../config/database');
const { migrationSync } = require('../../dbutils');
const { ensureAdminUser } = require('./create_user');

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

function parseBool(value) {
  if (value == null) return null;
  if (typeof value === 'boolean') return value;
  const normalized = String(value).trim().toLowerCase();
  if (['1', 'true', 'yes', 'y', 'on'].includes(normalized)) return true;
  if (['0', 'false', 'no', 'n', 'off'].includes(normalized)) return false;
  return null;
}

function getBoolEnv(name, defaultValue) {
  const parsed = parseBool(process.env[name]);
  if (parsed == null) return defaultValue;
  return parsed;
}

function runNodeScript(scriptFilename) {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, scriptFilename);
    const child = spawn(process.execPath, [scriptPath], {
      stdio: 'inherit',
      env: process.env
    });

    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${scriptFilename} exited with code ${code}`));
    });
  });
}

function getExpectedIndicatorCount() {
  try {
    const indicatorsPath = process.env.INDICATORS_JSON_PATH || path.join(__dirname, 'indicators.json');
    const raw = fs.readFileSync(indicatorsPath, 'utf8');
    const data = JSON.parse(raw);
    let count = 0;
    for (const pillar of Object.keys(data)) {
      const pillarIndicators = data?.[pillar]?.INDICATORS;
      if (Array.isArray(pillarIndicators)) {
        count += pillarIndicators.length;
      }
    }
    return count;
  } catch (err) {
    console.warn('Unable to determine expected indicator count from indicators JSON', err);
    return null;
  }
}

async function initDb() {
  await db.sequelize.authenticate();
  await migrationSync();
  await ensureAdminUser();

  const seedExampleData = getBoolEnv('SEED_EXAMPLE_DATA', true);
  if (!seedExampleData) {
    return;
  }

  const expectedIndicatorCount = getExpectedIndicatorCount();
  const indicatorCount = await db.indicators.count();
  const indicatorDescriptionCount = await db.indicator_descriptions.count();
  const shouldSeedIndicators =
    indicatorDescriptionCount === 0 ||
    (expectedIndicatorCount != null &&
      (indicatorCount < expectedIndicatorCount || indicatorDescriptionCount < expectedIndicatorCount));

  if (shouldSeedIndicators) {
    await runNodeScript('import_data_script.js');
  }

  const assessmentTypeCount = await db.assessment_types.count();
  const assessmentTypeDescriptionCount = await db.assessment_type_description.count();
  if (assessmentTypeCount === 0 || assessmentTypeDescriptionCount === 0) {
    await runNodeScript('add_assessments.js');
  }
}

if (require.main === module) {
  initDb()
    .then(() => db.sequelize.close())
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      return db.sequelize.close()
        .catch(() => undefined)
        .finally(() => process.exit(1));
    });
}

module.exports = { initDb };
