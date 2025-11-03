module.exports = {
  apps : [{
    name: 'dexiware-backend',
    append_env_to_name: true,
    script: 'backend/app.js',

    // Options reference: https://pm2.keymetrics.io/docs/usage/application-declaration/
    args: 'one two',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    time: true,
    env_production: {
      NODE_ENV: 'production',
      'PORT': '5000',
      'DB_NAME': 'truedb'
    },
    env_staging: {
      NODE_ENV: 'staging',
      'PORT': '5001',
      'DB_NAME': 'truedb_staging'
    }
  },
  {
    name: 'dexiware-frontend',
    append_env_to_name: true,
    script: 'serve',
    args: '',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      PM2_SERVE_PATH: './frontend/dist/true/',
      PM2_SERVE_PORT: 4200,
      PM2_SERVE_SPA: 'true',
      PM2_SERVE_HOMEPAGE: '/index.html'
    },
    env_production: {
      PM2_SERVE_PATH: './frontend/dist/true/browser',
      PM2_SERVE_PORT: 4200,
      PM2_SERVE_SPA: 'true',
      PM2_SERVE_HOMEPAGE: '/index.html'
    },
    env_staging: {
      PM2_SERVE_PATH: './frontend/dist/true/browser',
      PM2_SERVE_PORT: 4201,
      PM2_SERVE_SPA: 'true',
      PM2_SERVE_HOMEPAGE: '/index.html'
    }
  }],

  deploy : {
    production : {
      user : 'true',
      host : 'pathfinder.ijs.si',
      ref  : 'origin/true',
      repo : 'git@repo.ijs.si:environmental/true-interface.git',
      path : '/srv/true/production',
      "pre-setup": 'npm install -g pm2 && npm install -g @angular/cli',
      "post-deploy" : 'cd backend && npm install && cd ../frontend &&  npm install && npm run build -- --configuration=production --base-href=/true/ && cd .. && pm2 startOrRestart ecosystem.config.js --env production',
      env  : {
        'NODE_ENV': 'production',
        'PORT': '5000'
      }
    },
    staging: {
      user : 'true',
      host : 'pathfinder.ijs.si',
      ref  : 'origin/true',
      repo : 'git@repo.ijs.si:environmental/true-interface.git',
      path : '/srv/true/staging',
      "pre-setup": 'npm install -g pm2 && npm install -g @angular/cli',
      "post-deploy" : 'cd backend && npm install && cd ../frontend &&  npm install && npm run build -- --configuration=staging --base-href=/true/stag/ && cd .. && pm2 startOrRestart ecosystem.config.js --env staging',
      env  : {
        'NODE_ENV': 'staging',
        'PORT': '5001'
      }
    }
  }
};
