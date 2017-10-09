const NODE_ENV = process.env.NODE_ENV || 'development'

module.exports = {
  env: NODE_ENV,
  port: process.env.PORT || 8080,
  bodyLimit: '100kb',
  corsHeaders: ['Link'],
  dbUrl: process.env.DATABASE_URL,
  esUrl: process.env.ES_URL,
}
