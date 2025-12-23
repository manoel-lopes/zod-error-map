/**
 * Zod error codes
 * @readonly
 * @enum {string}
 */
export const ErrorCode = /** @type {const} */ ({
  INVALID_TYPE: 'invalid_type',
  TOO_SMALL: 'too_small',
  TOO_BIG: 'too_big',
  INVALID_FORMAT: 'invalid_format',
  CUSTOM: 'custom',
})

/**
 * Format types for invalid_format errors
 * @readonly
 * @enum {string}
 */
export const FormatType = /** @type {const} */ ({
  EMAIL: 'email',
  UUID: 'uuid',
  URL: 'url',
  REGEX: 'regex',
  CUID: 'cuid',
  CUID2: 'cuid2',
  ULID: 'ulid',
  IP: 'ip',
  EMOJI: 'emoji',
  DATE: 'date',
  DATETIME: 'datetime',
  TIME: 'time',
})
