import initDatabase from './initDatabase'
import initSearch from './initSearch'

const mergedFns = {
  insertUser: true,
  updateUser: true,
  deleteUser: true,
  findUser: false,
  insertTrip: true,
  updateTrip: true,
  deleteTrip: true,
  findTrip: false,
  search: false,
  searchTrips: false,
  searchTripsByDistance: false,
}

export default async ({ config, log = console.log }) => {
  const db = await initDatabase({ config, log })
  const es = await initSearch({ config, log })
  const ds = { es, db }

  for (let [fn, synchronized] of Object.entries(mergedFns)) {
    if (synchronized) {
      if (!db[fn] || !es[fn]) {
        throw Error(`Missing function to synchronize: ${fn}`)
      }

      ds[fn] = async (...args) => {
        const result = await db[fn](...args)
        await es[fn](...args)

        return result
      }

      continue
    }

    if (!db[fn] && !es[fn]) {
      throw Error(`Missing function to merge: ${fn}`)
    }

    ds[fn] = db[fn] || es[fn]
  }

  return ds
}
