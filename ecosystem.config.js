module.exports = {
  apps : [{
    name: 'emoji-sizeup-bot',
    script: 'index.js',
    watch: '.',
    autorestart: true,
  },
  {
    name: 'emoji-sizeup-bot-dev',
    script: 'index.js',
    args: ['--dev'],
    watch: '.',
    autorestart: true,
  }],

  deploy : {
    production : {
      user : 'SSH_USERNAME',
      host : 'SSH_HOSTMACHINE',
      ref  : 'origin/master',
      repo : 'GIT_REPOSITORY',
      path : 'DESTINATION_PATH',
      'pre-deploy-local': '',
      'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};