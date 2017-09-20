import { version } from '../../package.json'
import { Router } from 'express'
import users from './users'
import trips from './trips'

export default ({ config, db }) => {
  const api = Router()

  api.use('/users', users({ config, db }))
  api.use('/trips', trips({ config, db }))

  api.get('/', (req, res) => {
    res.json({ version })
  })

  return api
}
