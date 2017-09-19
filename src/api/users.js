import resource from 'resource-router-middleware'

export default ({ config, db }) => resource({
  id : 'user',

  /** For requests with an `id`, you can auto-load the entity.
   *  Errors terminate the request, success sets `req[id] = data`.
   */
  async load (req, id, callback) {
    try {
      callback(null, await db.getUser(id))
    } catch (error) {
      callback(error.message)
    }
  },

  /** GET / - List all entities */
  async index ({ params }, res) {
    const users = await db.findUsers()

    res.json(users)
  },

  /** POST / - Create a new entity */
  create ({ body }, res) {
    db.insertUser({
      ...body,
      created: new Date().toISOString(),
      // seen: new Date().toISOString(),
    })

    res.json(body)
  },

  /** GET /:id - Return a given entity */
  read ({ user }, res) {
    res.json(user)
  },

  /** PUT /:id - Update a given entity */
  update ({ user, body }, res) {
    db.updateUser(body)

    res.sendStatus(204)
  },

  /** DELETE /:id - Delete a given entity */
  delete ({ user }, res) {
    db.deleteUser(user)

    res.sendStatus(204)
  }
})
