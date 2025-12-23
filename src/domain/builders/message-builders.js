import { ErrorCode, FormatType } from '../../core/constants/index.js'

/**
 * @typedef {import('../../core/types/index.js').RawIssue} RawIssue
 * @typedef {import('../../core/types/index.js').Label} Label
 * @typedef {import('../../core/types/index.js').MessageBuilder} MessageBuilder
 */

/**
 * Gets a human-readable description of the input type
 * @param {unknown} input
 * @returns {string}
 */
export function getInputDescription(input) {
  if (input === undefined) return 'undefined'
  if (input === null) return 'null'
  if (Array.isArray(input)) return 'array'
  return typeof input
}

/**
 * Default format error messages
 * @type {Record<string, (label: Label) => string>}
 */
export const defaultFormatMessages = {
  [FormatType.EMAIL]: (label) => `The ${label.quoted} must be a valid email address`,
  [FormatType.UUID]: (label) => `The ${label.quoted} must be a valid UUID`,
  [FormatType.URL]: (label) => `The ${label.quoted} must be a valid URL`,
  [FormatType.REGEX]: (label) => `The ${label.quoted} has an invalid format`,
  [FormatType.CUID]: (label) => `The ${label.quoted} must be a valid CUID`,
  [FormatType.CUID2]: (label) => `The ${label.quoted} must be a valid CUID2`,
  [FormatType.ULID]: (label) => `The ${label.quoted} must be a valid ULID`,
  [FormatType.IP]: (label) => `The ${label.quoted} must be a valid IP address`,
  [FormatType.DATE]: (label) => `The ${label.quoted} must be a valid date`,
  [FormatType.DATETIME]: (label) => `The ${label.quoted} must be a valid datetime`,
  [FormatType.TIME]: (label) => `The ${label.quoted} must be a valid time`,
}

/**
 * Builds error message for invalid_type errors
 * @type {MessageBuilder}
 */
export function buildInvalidTypeMessage(issue, label) {
  const received = getInputDescription(issue.input)
  if (received === 'undefined') {
    return `The ${label.bare} is required`
  }
  return `Expected ${issue.expected} for ${label.quoted}, received ${received}`
}

/**
 * Builds error message for too_small errors
 * @type {MessageBuilder}
 */
export function buildTooSmallMessage(issue, label) {
  const min = Number(issue.minimum) || 0
  return `The ${label.quoted} must contain at least ${min} characters`
}

/**
 * Builds error message for too_big errors
 * @type {MessageBuilder}
 */
export function buildTooBigMessage(issue, label) {
  const max = Number(issue.maximum) || 0
  return `The ${label.quoted} must contain at most ${max} characters`
}

/**
 * Creates a format message builder with custom format messages
 * @param {Record<string, (label: Label) => string>} [formatMessages]
 * @returns {MessageBuilder}
 */
export function createFormatMessageBuilder(formatMessages = defaultFormatMessages) {
  return (issue, label) => {
    const format = issue.format || ''
    const messageBuilder = formatMessages[format]
    if (messageBuilder) {
      return messageBuilder(label)
    }
    return `The ${label.quoted} has an invalid format`
  }
}

/**
 * Builds error message for custom errors
 * @param {string} defaultError
 * @returns {MessageBuilder}
 */
export function createCustomMessageBuilder(defaultError) {
  return (issue, _label) => issue.message || defaultError
}

/**
 * Creates the default message builders map
 * @param {string} defaultError
 * @param {Record<string, (label: Label) => string>} [formatMessages]
 * @returns {Record<string, MessageBuilder>}
 */
export function createDefaultBuilders(defaultError, formatMessages) {
  return {
    [ErrorCode.INVALID_TYPE]: buildInvalidTypeMessage,
    [ErrorCode.TOO_SMALL]: buildTooSmallMessage,
    [ErrorCode.TOO_BIG]: buildTooBigMessage,
    [ErrorCode.INVALID_FORMAT]: createFormatMessageBuilder(formatMessages),
    [ErrorCode.CUSTOM]: createCustomMessageBuilder(defaultError),
  }
}
