/**
 * @typedef {object} Label
 * @property {string} bare - The field name without quotes
 * @property {string} quoted - The field name with quotes
 */

/**
 * @typedef {object} RawIssue
 * @property {string} code - The error code from Zod
 * @property {Array<string | number>} path - The path to the field
 * @property {unknown} [input] - The input value that caused the error
 * @property {string} [expected] - The expected type
 * @property {number} [minimum] - Minimum value/length constraint
 * @property {number} [maximum] - Maximum value/length constraint
 * @property {string} [format] - Format type (email, uuid, url, etc.)
 * @property {string} [message] - Custom error message
 */

/**
 * @callback MessageBuilder
 * @param {RawIssue} issue - The raw Zod issue
 * @param {Label} label - The field label
 * @returns {string} The formatted error message
 */

/**
 * @typedef {(label: Label) => string} FormatMessageBuilder
 */

/**
 * @typedef {object} ErrorMapConfig
 * @property {string} [defaultError] - Default error message
 * @property {Record<string, MessageBuilder>} [builders] - Custom message builders by error code
 * @property {Record<string, FormatMessageBuilder>} [formatMessages] - Custom messages for format errors
 */

export {}
