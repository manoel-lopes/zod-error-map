import { createDefaultBuilders } from '../builders/index.js'

/**
 * @typedef {import('../../core/types/index.js').RawIssue} RawIssue
 * @typedef {import('../../core/types/index.js').Label} Label
 * @typedef {import('../../core/types/index.js').MessageBuilder} MessageBuilder
 * @typedef {import('../../core/types/index.js').ErrorMapConfig} ErrorMapConfig
 */

const DEFAULT_ERROR = 'Invalid input'

/**
 * Checks if the issue is a valid RawIssue
 * @param {unknown} issue
 * @returns {issue is RawIssue}
 */
function isRawIssue(issue) {
  return (
    typeof issue === 'object' &&
    issue !== null &&
    'code' in issue
  )
}

/**
 * Gets the label from the issue path
 * @param {RawIssue} issue
 * @returns {Label}
 */
function getLabel(issue) {
  const path = issue.path ?? []
  const field = path[path.length - 1]
  if (typeof field === 'string') {
    return { bare: field, quoted: `'${field}'` }
  }
  return { bare: 'value', quoted: 'value' }
}

/**
 * Creates a Zod error mapper with customizable message builders
 * @param {ErrorMapConfig} [config]
 * @returns {{ format: (issue: unknown) => string, createErrorMap: () => (issue: unknown) => string }}
 */
export function createErrorMapper(config = {}) {
  const defaultError = config.defaultError ?? DEFAULT_ERROR
  const defaultBuilders = createDefaultBuilders(defaultError, config.formatMessages)
  const builders = { ...defaultBuilders, ...config.builders }

  /**
   * Builds the error message for a Zod issue
   * @param {RawIssue} issue
   * @returns {string}
   */
  function buildMessage(issue) {
    const label = getLabel(issue)
    const builder = builders[issue.code]
    if (builder) {
      return builder(issue, label)
    }
    return issue.message || defaultError
  }

  /**
   * Formats a Zod issue into a human-readable message
   * @param {unknown} issue
   * @returns {string}
   */
  function format(issue) {
    if (!isRawIssue(issue)) return defaultError
    return buildMessage(issue)
  }

  /**
   * Creates an error map function for Zod
   * @returns {(issue: unknown) => string}
   */
  function createErrorMap() {
    return format
  }

  return { format, createErrorMap }
}

/**
 * Default error mapper instance
 */
export const defaultErrorMapper = createErrorMapper()
