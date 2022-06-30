import { FastifyInstance } from 'fastify'

import { badRequest, unauthorized } from '@hapi/boom'

import { STORAGE_PROVIDERS } from '../../env'
import { getArtifact, health, postArtifact, putArtifact } from './routes'
import { createLocation } from './storage'

async function turboRemoteCache(
  instance: FastifyInstance,
  options: {
    allowedTokens: string[]
    bodyLimit?: number
    apiVersion?: `v${number}`
    provider?: STORAGE_PROVIDERS
  },
) {
  const {
    allowedTokens,
    bodyLimit = 104857600,
    apiVersion = 'v8',
    provider = STORAGE_PROVIDERS.LOCAL,
  } = options
  if (!(Array.isArray(allowedTokens) && allowedTokens.length)) {
    throw new Error(
      `'allowedTokens' options must be a string[], ${typeof allowedTokens} provided instead`,
    )
  }

  instance.addContentTypeParser<Buffer>(
    'application/octet-stream',
    { parseAs: 'buffer', bodyLimit },
    async function parser(request, payload) {
      return payload
    },
  )
  const tokens = new Set<string>(allowedTokens)
  instance.addHook('onRequest', async function (request) {
    if (request.url.includes('health')) return

    let authHeader = request.headers['authorization']
    authHeader = Array.isArray(authHeader) ? authHeader.join() : authHeader

    if (!authHeader) {
      throw badRequest(`Missing Authorization header`)
    }
    const [, token] = authHeader.split('Bearer ')
    if (!tokens.has(token)) {
      throw unauthorized(`Invalid authorization token`)
    }
  })

  instance.decorate(
    'location',
    createLocation(provider, {
      path: instance.config.STORAGE_PATH,
      endpoint: instance.config.S3_ENDPOINT,
    }),
  )

  await instance.register(
    async function (i) {
      i.route(getArtifact)
      i.route(putArtifact)
      i.route(postArtifact)
      i.route(health)
    },
    { prefix: `/${apiVersion}` },
  )
}

export default turboRemoteCache
