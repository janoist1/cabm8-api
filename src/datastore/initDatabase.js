import Sequelize from 'sequelize'
import Pg from 'pg'

Pg.defaults.ssl = true

const updateOptions = {
  returning: true,
  plain: true,
}

export default async ({ config, log = console.log }) => {
  const client = new Sequelize(config.dbUrl)
  let models

  const init = async ({ force = false }) => {
    client.authenticate()

    models = defineModels()

    await client.sync({ force })
  }

  const defineModels = () => {
    // models definition may go to src/models
    const user = client.define('user', {
      id: { type: Sequelize.STRING, unique: true, primaryKey: true },
      profile: { type: Sequelize.JSON },
    }, {
      timestamps: true,
      paranoid: true,
    })
    const trip = client.define('trip', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      origin: { type: Sequelize.Sequelize.JSON }, // todo: consider GEOMETRY('POINT')
      destination: { type: Sequelize.Sequelize.JSON },
      time: { type: Sequelize.DATE },
    }, {
      timestamps: true,
      paranoid: true,
    })

    return { user, trip }
  }

  const health = async () => 'To be implemented'
  const insertUser = user => models.user.create(user)
  const findUser = where => models.user.findOne({ where })
  const updateUser = (user, id) => models.user.update(user, { where: { id }, ...updateOptions })
  const deleteUser = async () => 'To be implemented'
  const countUsers = async () => 'To be implemented'
  const insertTrip = trip => models.trip.create(trip)
  const findTrip = where => models.trip.findOne({ where })
  const updateTrip = (trip, id) => models.trip.update(trip, { where: { id }, ...updateOptions })
  const deleteTrip = async () => 'To be implemented'
  const countTrips = async () => 'To be implemented'

  await init({})

  return {
    health,
    insertUser,
    findUser,
    updateUser,
    deleteUser,
    countUsers,
    insertTrip,
    findTrip,
    updateTrip,
    deleteTrip,
    countTrips,
    getClient: () => client,
  }
}
