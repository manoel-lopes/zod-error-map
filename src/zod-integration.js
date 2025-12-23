/**
 * @typedef {import('./types.js').ErrorMapConfig} ErrorMapConfig
 */

import { createErrorMapper } from './error-mapper.js'

/**
 * Sets the global Zod error map using z.config()
 * @param {import('zod')} z - The Zod instance
 * @param {ErrorMapConfig} [config] - Optional configuration
 * @returns {void}
 */
export function setZodErrorMap(z, config) {
  const mapper = createErrorMapper(config)
  z.config({
    customError: (issue) => mapper.format(issue),
  })
}

/**
 * Creates a Zod error map function compatible with z.setErrorMap() (Zod v3)
 * @param {ErrorMapConfig} [config] - Optional configuration
 * @returns {(issue: unknown, ctx: unknown) => { message: string }}
 */
export function createZodErrorMap(config) {
  const mapper = createErrorMapper(config)
  return (issue, _ctx) => {
    const message = mapper.format(issue)
    return { message }
  }
}
