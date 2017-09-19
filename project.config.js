const NODE_ENV = process.env.NODE_ENV || 'development'

module.exports = {
  env: NODE_ENV,
  port: process.env.PORT || 8080,
  bodyLimit: '100kb',
  corsHeaders: ['Link'],
}
