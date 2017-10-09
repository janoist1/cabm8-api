import Sequelize from 'sequelize'
import Pg from 'pg'
import initSearch from './initSearch'

Pg.defaults.ssl = true

const INDEX = 'cabm8'
const USERS_TYPE = 'users'
const TRIPS_TYPE = 'trips'

export default async ({ config, log = console.log }) => {
  const db = new Sequelize(config.dbUrl)

  try {
    db.authenticate()
  } catch (error) {
    log('Unable to connect to the database:', error)
  }

  const User = db.define('user', {
    username: Sequelize.STRING,
    birthday: Sequelize.DATE
  })

  await db.sync({ force: false })

  console.log('szink ok')

  const user = await User.create({
    username: 'janedoe',
    birthday: new Date(1980, 6, 20)
  })

  console.log(user.get({
    plain: true
  }))

  return init()
}
