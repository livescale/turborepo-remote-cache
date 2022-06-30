import { Static, Type } from '@sinclair/typebox'

const querystring = Type.Object(
  {
    slug: Type.Optional(Type.String()),
    teamId: Type.Optional(Type.String()),
  },
  { additionalParameters: false },
)
export type Querystring = Static<typeof querystring>

const params = Type.Object(
  {
    id: Type.String(),
  },
  { additionalParameters: false },
)
export type Params = Static<typeof params>

export const artifactsRouteSchema = {
  querystring,
  params,
}
