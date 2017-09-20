import ES from 'elasticsearch'

const INDEX = 'cabm8'
const USERS_TYPE = 'users'
const TRIPS_TYPE = 'trips'

export default ({ config, debug = console.log }) => {
  const client = new ES.Client(config)
  const getDb = () => ({
    health,
    search,
    insertUser,
    getUser,
    updateUser,
    deleteUser,
    findUsers,
    countUsers,
    insertTrip,
    getTrip,
    updateTrip,
    deleteTrip,
    searchTrips,
    searchTripsByDistance,
    countTrips,
    getClient: () => client,
  })

  // general shit

  const getHits = result => result.hits.hits.map(getSource)

  const getSource = hit => hit._source

  const search = q => client.search({ index: INDEX, q })

  const init = () => indexExists()
    .then(exists => {
      if (exists) {
        return getDb()
        // debug('Index does exist, deleting & creating it')
        //
        // return deleteIndex()
        //   .then(() => createIndex())
        //   .then(getDb)
      }

      debug('Index does not exist, creating it')

      return createIndex()
        .then(getDb)
    })

  const health = params => client.cluster.health(params)

  const createIndex = () =>
    client.indices.create({
      index: INDEX,
      body: {
        mappings: {
          [USERS_TYPE]: {
            properties: {
              id: {
                type: 'text', // integer ?
              },
              profile: {
                type: 'object',
              },
              created: {
                type: 'date',
              },
              seen: {
                type: 'date',
              },
            }
          },
          [TRIPS_TYPE]: {
            _parent: {
              type: USERS_TYPE,
            },
            properties: {
              origin: {
                type: 'geo_point'
              },
              destination: {
                type: 'geo_point'
              },
              created: {
                type: 'date',
              },
            }
          },
        }
      }
    })
      .then(response => {
        debug('Index is created')
        return response
      })
      .catch(err => {
        debug('Error creating index', err)
      })

  const indexExists = () => client.indices.exists({ index: INDEX })

  const deleteIndex = () => client.indices.delete({ index: INDEX })
  // .then(response => {
  //   debug('delete index ' + JSON.stringify(response, null, 2))
  // })
  // .catch(err => {
  //   debug('delete index err ' + JSON.stringify(err, null, 2))
  // })

  // const createTripsMapping = () => client.indices.putMapping({
  //   index: INDEX,
  //   type: TRIPS_TYPE,
  //   body: {
  //     properties: {
  //       title: {type: "string"},
  //       content: {type: "string"},
  //       suggest: {
  //         type: "completion",
  //         analyzer: "simple",
  //         search_analyzer: "simple",
  //         payloads: true
  //       }
  //     }
  //   }
  // })

  // USER stuff

  const insertUser = user => client.index({
    index: INDEX,
    type: USERS_TYPE,
    id: user.id,
    body: user,
  })

  const updateUser = user => client.update({
    index: INDEX,
    type: USERS_TYPE,
    id: user.id,
    body: { doc: user },
  })

  const deleteUser = ({ id }) => client.delete({
    index: INDEX,
    type: USERS_TYPE,
    id,
  })

  const findUsers = (match = {}) => client.search({
    index: INDEX,
    type: USERS_TYPE,
    body: {
      query: {
        match_all: match,
      },
    },
  }).then(getHits)

  const getUser = id => client.get({
    index: INDEX,
    type: USERS_TYPE,
    id,
  }).then(getSource)

  const countUsers = () => client.count({
    index: INDEX,
    type: USERS_TYPE,
  })

  // TRIP stuff

  const insertTrip = (trip, user) => client.index({
    index: INDEX,
    type: TRIPS_TYPE,
    parent: user.id,
    body: trip,
  })

  const updateTrip = trip => client.update({
    index: INDEX,
    type: TRIPS_TYPE,
    id: trip.id,
    body: { doc: trip },
  })

  const deleteTrip = ({ id }) => client.delete({
    index: INDEX,
    type: TRIPS_TYPE,
    id,
  })

  const searchTrips = body => client.search({
    index: INDEX,
    type: TRIPS_TYPE,
    body,
  }).then(getHits)

  const searchTripsByDistance = ({ distance, origin, destination, match = {} }) => client.search({
    index: INDEX,
    type: TRIPS_TYPE,
    body: {
      query: {
        bool: {
          must: {
            match_all: match,
          },
          filter: {
            geo_distance: {
              ...(origin ? { origin } : {}),
              ...(destination ? { destination } : {}),
              distance,
            }
          }
        }
      }
    }
  })

  const getTrip = id => client.get({
    index: INDEX,
    type: TRIPS_TYPE,
    id,
  }).then(getSource)

  const countTrips = () => client.count({
    index: INDEX,
    type: TRIPS_TYPE,
  })

  return init()
}
