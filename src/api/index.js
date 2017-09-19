import { version } from '../../package.json'
import { Router } from 'express'
import users from './users'

export default ({ config, db }) => {
  const api = Router()

  api.use('/users', users({ config, db }))

  api.get('/', (req, res) => {
    res.json({ version })
  })

  return api
}
