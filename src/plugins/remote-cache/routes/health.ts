import type { RawReplyDefaultExpression, RawRequestDefaultExpression, RouteOptions } from 'fastify'
import type { Server } from 'http'

import { preconditionFailed } from '@hapi/boom'

export const health: RouteOptions<Server, RawRequestDefaultExpression, RawReplyDefaultExpression> =
  {
    url: '/health',
    method: 'GET',
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
          },
        },
      },
    },
    async handler(req, reply) {
      try {
        // had to add this route for ECS deployement healthcheck

        reply.send({ status: 'OK' })
      } catch (err) {
        // we need this error throw since turbo retries if the error is in 5xx range
        throw preconditionFailed(`Error during healthcheck`)
      }
    },
  }
