import http from 'http'
import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import bodyParser from 'body-parser'
import initializeDb from './db'
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

initializeDb({ config: config.esConfig }).then(db => {
  app.use(middleware({ config, db }))
  app.use('/api', api({ config, db }))

  app.server.listen(config.port, () => {
    console.log(`Started on port ${app.server.address().port}`)
  })
})

export default app
