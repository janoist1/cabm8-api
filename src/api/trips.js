import resource from 'resource-router-middleware'

export default ({ config, db }) => {
  const search = type => async (req, res) => {
    const coordinate = req.params.coordinate.split(',')
    const distance = req.param.distance

    const result = await db.searchTripsByDistance({
      distance,
      [type]: coordinate,
    })

    res.json(result)
  }

  return resource({
    id : 'trip',

    async load (req, id, callback) {
      try {
        callback(null, await db.getTrip(id))
      } catch (error) {
        callback(error.message)
      }
    },

    async index ({ params }, res) {
      const trips = await db.findTrips()

      res.json(trips)
    },

    create ({ body }, res) {
      db.insertTrip({
        ...body,
        created: new Date().toISOString(),
      })

      res.json(body)
    },

    read ({ trip }, res) {
      res.json(trip)
    },

    update ({ trip, body }, res) {
      db.updateTrip(body)

      res.sendStatus(204)
    },

    delete ({ trip }, res) {
      db.deleteTrip(trip)

      res.sendStatus(204)
    }
  })
    .post('/search', async (req, res) => {
      const { body } = req
      const result = await db.searchTrips(body)

      res.json(result)
    })
    .get('/search/origin/:coordinate/:distance', search('origin'))
    .get('/search/destination/:coordinate/:distance', search('destination'))
}
