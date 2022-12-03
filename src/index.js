// Require the framework and instantiate it
const fastify = require('fastify')({ logger: true })
const fs = require('fs')

// Declare a route
fastify.get('/api', async (request, reply) => {
	  return { hello: 'Server 2' }
})

// Run the server!
const start = async () => {
  try {
    await fastify.listen({ port: 5050 })
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}
start()
