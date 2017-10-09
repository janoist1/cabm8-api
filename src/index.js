import http from 'http'
import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import bodyParser from 'body-parser'
import initializeDs from './datastore'
import middleware from './middleware'
import api from './api'
import config from '../project.config'

const app = express()
app.server = http.createServer(app)

app.use(morgan(config.env === 'development' ? 'dev' : 'common'))
app.use(cors({
  exposedHeaders: config.corsHeaders,
}))
app.use(bodyParser.json({
  limit: config.bodyLimit,
}))

export default initializeDs({ config })
  .then(ds => {
    app.use(middleware({ config, ds }))
    app.use('/api', api({ config, ds }))

    app.server.listen(config.port, () => {
      console.log(`Started on port ${app.server.address().port}`)
    })

    return app
  })
  .catch(error => {
    console.error('Could not start server', error)
  })
