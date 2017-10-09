import ES from 'elasticsearch'

const INDEX = 'cabm8'
const USERS_TYPE = 'users'
const TRIPS_TYPE = 'trips'

export default ({ config, log = console.log }) => {
  const client = new ES.Client({ host: config.esUrl })

  // general shit

  const getHits = result => result.hits.hits

  const init = ({ force = false }) => indexExists()
    .then(exists => {
      if (!exists) {
        log('Index does not exist, creating it')

        return createIndex()
      }

      if (force) {
        log('Index does exist, deleting & creating it')

        return deleteIndex()
          .then(createIndex)
      }
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
        log('Index is created')
        return response
      })
      .catch(err => {
        log('Error creating index', err)
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

  const search = q => client.search({ index: INDEX, q })

  // USER stuff

  const insertUser = (user, id) => client.index({
    index: INDEX,
    type: USERS_TYPE,
    id,
    body: user,
  })

  const updateUser = (user, id) => client.update({
    index: INDEX,
    type: USERS_TYPE,
    id,
    body: { doc: user },
  })

  const deleteUser = id => client.delete({
    index: INDEX,
    type: USERS_TYPE,
    id,
  })

  const searchUsers = (match = {}) => client.search({
    index: INDEX,
    type: USERS_TYPE,
    body: {
      query: {
        match_all: match,
      },
    },
  }).then(getHits)

  const findUser = id => client.get({
    index: INDEX,
    type: USERS_TYPE,
    id,
  })

  const countUsers = () => client.count({
    index: INDEX,
    type: USERS_TYPE,
  })

  // TRIP stuff

  const insertTrip = (trip, id, parent) => client.index({
    index: INDEX,
    type: TRIPS_TYPE,
    id,
    parent,
    body: trip,
  })

  const updateTrip = (trip, id, parent) => client.update({
    index: INDEX,
    type: TRIPS_TYPE,
    id,
    parent,
    body: { doc: trip },
  })

  const deleteTrip = (id, parent) => client.delete({
    index: INDEX,
    type: TRIPS_TYPE,
    id,
    parent,
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

  const findTrip = (id, parent) => client.get({
    index: INDEX,
    type: TRIPS_TYPE,
    id,
    parent,
  })

  const countTrips = () => client.count({
    index: INDEX,
    type: TRIPS_TYPE,
  })

  return init({})
    .then(() => ({
      health,
      search,
      insertUser,
      findUser,
      updateUser,
      deleteUser,
      searchUsers,
      countUsers,
      insertTrip,
      findTrip,
      updateTrip,
      deleteTrip,
      searchTrips,
      searchTripsByDistance,
      countTrips,
      getClient: () => client,
    }))
}
