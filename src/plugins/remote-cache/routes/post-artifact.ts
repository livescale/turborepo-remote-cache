import type { RawReplyDefaultExpression, RawRequestDefaultExpression, RouteOptions } from 'fastify'
import type { Server } from 'http'
import { Readable } from 'stream'

import { preconditionFailed } from '@hapi/boom'

import logger from '../../../logger'
import { artifactsRouteSchema, type Params, type Querystring } from './schema'

export const postArtifact: RouteOptions<
  Server,
  RawRequestDefaultExpression,
  RawReplyDefaultExpression,
  {
    Querystring: Querystring
    Params: Params
    Body: Buffer
  }
> = {
  url: '/artifacts/:id',
  method: 'POST',
  schema: artifactsRouteSchema,
  async handler(req, reply) {
    const artifactId = req.params.id
    const teamId = req.query.slug || req.query.teamId || '-'
    if (artifactId === 'events') {
      logger.warn(req.body)
      reply.send(200)
    } else {
      try {
        await this.location.createCachedArtifact(artifactId, teamId, Readable.from(req.body))

        reply.send({ urls: [`${teamId}/${artifactId}`] })
      } catch (err) {
        // we need this error throw since turbo retries if the error is in 5xx range
        throw preconditionFailed(`Error during the artifact creation`, err)
      }
    }
  },
}
