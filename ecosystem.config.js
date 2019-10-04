const { parsed } = require('dotenv/lib/main').config()

module.exports = {
  apps: [
    {
      name: parsed.NODE_ENV + '-run-' + parsed.PORT,
      script: '__sapper__/build/index.js',
      log_date_format: 'YYYY-MM-DD[T]HH:mm:ss.SSS[Z]',
      env: parsed,
    },
  ],
}
