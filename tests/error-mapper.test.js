import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { z } from 'zod'
import {
  createErrorMapper,
  defaultErrorMapper,
  setZodErrorMap,
  createZodErrorMap,
  ErrorCode,
  FormatType,
  buildInvalidTypeMessage,
  buildTooSmallMessage,
  buildTooBigMessage,
  createFormatMessageBuilder,
  createCustomMessageBuilder,
  getInputDescription,
  defaultFormatMessages,
} from '../src/index.js'

describe('getInputDescription', () => {
  it('returns "undefined" for undefined', () => {
    assert.equal(getInputDescription(undefined), 'undefined')
  })

  it('returns "null" for null', () => {
    assert.equal(getInputDescription(null), 'null')
  })

  it('returns "array" for arrays', () => {
    assert.equal(getInputDescription([]), 'array')
    assert.equal(getInputDescription([1, 2, 3]), 'array')
  })

  it('returns typeof for primitives', () => {
    assert.equal(getInputDescription('hello'), 'string')
    assert.equal(getInputDescription(123), 'number')
    assert.equal(getInputDescription(true), 'boolean')
    assert.equal(getInputDescription({}), 'object')
  })
})

describe('buildInvalidTypeMessage', () => {
  it('returns required message when input is undefined', () => {
    const issue = { code: 'invalid_type', path: ['email'], input: undefined, expected: 'string' }
    const label = { bare: 'email', quoted: "'email'" }
    assert.equal(buildInvalidTypeMessage(issue, label), 'The email is required')
  })

  it('returns type mismatch message for wrong types', () => {
    const issue = { code: 'invalid_type', path: ['age'], input: 'not a number', expected: 'number' }
    const label = { bare: 'age', quoted: "'age'" }
    assert.equal(buildInvalidTypeMessage(issue, label), "Expected number for 'age', received string")
  })

  it('handles null input', () => {
    const issue = { code: 'invalid_type', path: ['name'], input: null, expected: 'string' }
    const label = { bare: 'name', quoted: "'name'" }
    assert.equal(buildInvalidTypeMessage(issue, label), "Expected string for 'name', received null")
  })

  it('handles array input', () => {
    const issue = { code: 'invalid_type', path: ['data'], input: [], expected: 'object' }
    const label = { bare: 'data', quoted: "'data'" }
    assert.equal(buildInvalidTypeMessage(issue, label), "Expected object for 'data', received array")
  })
})

describe('buildTooSmallMessage', () => {
  it('returns minimum characters message', () => {
    const issue = { code: 'too_small', path: ['password'], minimum: 8 }
    const label = { bare: 'password', quoted: "'password'" }
    assert.equal(buildTooSmallMessage(issue, label), "The 'password' must contain at least 8 characters")
  })

  it('handles zero minimum', () => {
    const issue = { code: 'too_small', path: ['field'], minimum: 0 }
    const label = { bare: 'field', quoted: "'field'" }
    assert.equal(buildTooSmallMessage(issue, label), "The 'field' must contain at least 0 characters")
  })

  it('handles missing minimum', () => {
    const issue = { code: 'too_small', path: ['field'] }
    const label = { bare: 'field', quoted: "'field'" }
    assert.equal(buildTooSmallMessage(issue, label), "The 'field' must contain at least 0 characters")
  })
})

describe('buildTooBigMessage', () => {
  it('returns maximum characters message', () => {
    const issue = { code: 'too_big', path: ['bio'], maximum: 500 }
    const label = { bare: 'bio', quoted: "'bio'" }
    assert.equal(buildTooBigMessage(issue, label), "The 'bio' must contain at most 500 characters")
  })

  it('handles missing maximum', () => {
    const issue = { code: 'too_big', path: ['field'] }
    const label = { bare: 'field', quoted: "'field'" }
    assert.equal(buildTooBigMessage(issue, label), "The 'field' must contain at most 0 characters")
  })
})

describe('createFormatMessageBuilder', () => {
  it('returns email format message', () => {
    const builder = createFormatMessageBuilder()
    const issue = { code: 'invalid_format', path: ['email'], format: 'email' }
    const label = { bare: 'email', quoted: "'email'" }
    assert.equal(builder(issue, label), "The 'email' must be a valid email address")
  })

  it('returns uuid format message', () => {
    const builder = createFormatMessageBuilder()
    const issue = { code: 'invalid_format', path: ['id'], format: 'uuid' }
    const label = { bare: 'id', quoted: "'id'" }
    assert.equal(builder(issue, label), "The 'id' must be a valid UUID")
  })

  it('returns url format message', () => {
    const builder = createFormatMessageBuilder()
    const issue = { code: 'invalid_format', path: ['website'], format: 'url' }
    const label = { bare: 'website', quoted: "'website'" }
    assert.equal(builder(issue, label), "The 'website' must be a valid URL")
  })

  it('returns generic format message for unknown formats', () => {
    const builder = createFormatMessageBuilder()
    const issue = { code: 'invalid_format', path: ['field'], format: 'unknown' }
    const label = { bare: 'field', quoted: "'field'" }
    assert.equal(builder(issue, label), "The 'field' has an invalid format")
  })

  it('returns generic format message when format is missing', () => {
    const builder = createFormatMessageBuilder()
    const issue = { code: 'invalid_format', path: ['field'] }
    const label = { bare: 'field', quoted: "'field'" }
    assert.equal(builder(issue, label), "The 'field' has an invalid format")
  })

  it('uses custom format messages', () => {
    const customMessages = {
      email: (label) => `${label.bare} is not a valid email`,
    }
    const builder = createFormatMessageBuilder(customMessages)
    const issue = { code: 'invalid_format', path: ['email'], format: 'email' }
    const label = { bare: 'email', quoted: "'email'" }
    assert.equal(builder(issue, label), 'email is not a valid email')
  })
})

describe('createCustomMessageBuilder', () => {
  it('returns issue message when present', () => {
    const builder = createCustomMessageBuilder('Default error')
    const issue = { code: 'custom', path: ['field'], message: 'Custom validation failed' }
    const label = { bare: 'field', quoted: "'field'" }
    assert.equal(builder(issue, label), 'Custom validation failed')
  })

  it('returns default error when message is missing', () => {
    const builder = createCustomMessageBuilder('Default error')
    const issue = { code: 'custom', path: ['field'] }
    const label = { bare: 'field', quoted: "'field'" }
    assert.equal(builder(issue, label), 'Default error')
  })
})

describe('defaultFormatMessages', () => {
  it('has all format types defined', () => {
    const label = { bare: 'field', quoted: "'field'" }
    assert.ok(defaultFormatMessages[FormatType.EMAIL])
    assert.ok(defaultFormatMessages[FormatType.UUID])
    assert.ok(defaultFormatMessages[FormatType.URL])
    assert.ok(defaultFormatMessages[FormatType.DATE])
    assert.ok(defaultFormatMessages[FormatType.DATETIME])
    assert.ok(defaultFormatMessages[FormatType.TIME])
    assert.ok(defaultFormatMessages[FormatType.IP])
  })
})

describe('createErrorMapper', () => {
  it('creates a mapper with default configuration', () => {
    const mapper = createErrorMapper()
    assert.ok(mapper.format)
    assert.ok(mapper.createErrorMap)
  })

  it('formats invalid_type errors', () => {
    const mapper = createErrorMapper()
    const message = mapper.format({
      code: 'invalid_type',
      path: ['email'],
      input: undefined,
      expected: 'string',
    })
    assert.equal(message, 'The email is required')
  })

  it('formats too_small errors', () => {
    const mapper = createErrorMapper()
    const message = mapper.format({
      code: 'too_small',
      path: ['password'],
      minimum: 8,
    })
    assert.equal(message, "The 'password' must contain at least 8 characters")
  })

  it('formats too_big errors', () => {
    const mapper = createErrorMapper()
    const message = mapper.format({
      code: 'too_big',
      path: ['bio'],
      maximum: 500,
    })
    assert.equal(message, "The 'bio' must contain at most 500 characters")
  })

  it('formats invalid_format errors', () => {
    const mapper = createErrorMapper()
    const message = mapper.format({
      code: 'invalid_format',
      path: ['email'],
      format: 'email',
    })
    assert.equal(message, "The 'email' must be a valid email address")
  })

  it('formats custom errors', () => {
    const mapper = createErrorMapper()
    const message = mapper.format({
      code: 'custom',
      path: ['field'],
      message: 'Custom error message',
    })
    assert.equal(message, 'Custom error message')
  })

  it('returns default error for unknown codes', () => {
    const mapper = createErrorMapper()
    const message = mapper.format({
      code: 'unknown_code',
      path: ['field'],
    })
    assert.equal(message, 'Invalid input')
  })

  it('returns default error for invalid issues', () => {
    const mapper = createErrorMapper()
    assert.equal(mapper.format(null), 'Invalid input')
    assert.equal(mapper.format(undefined), 'Invalid input')
    assert.equal(mapper.format('string'), 'Invalid input')
    assert.equal(mapper.format(123), 'Invalid input')
    assert.equal(mapper.format({}), 'Invalid input')
    assert.equal(mapper.format({ code: 'test' }), 'Invalid input')
    assert.equal(mapper.format({ path: [] }), 'Invalid input')
  })

  it('uses custom default error', () => {
    const mapper = createErrorMapper({ defaultError: 'Validation failed' })
    const message = mapper.format({
      code: 'unknown_code',
      path: ['field'],
    })
    assert.equal(message, 'Validation failed')
  })

  it('uses custom builders', () => {
    const mapper = createErrorMapper({
      builders: {
        [ErrorCode.INVALID_TYPE]: (issue, label) => `${label.bare} is missing`,
      },
    })
    const message = mapper.format({
      code: 'invalid_type',
      path: ['email'],
      input: undefined,
    })
    assert.equal(message, 'email is missing')
  })

  it('uses custom format messages', () => {
    const mapper = createErrorMapper({
      formatMessages: {
        email: (label) => `Invalid email in ${label.bare}`,
      },
    })
    const message = mapper.format({
      code: 'invalid_format',
      path: ['email'],
      format: 'email',
    })
    assert.equal(message, 'Invalid email in email')
  })

  it('handles numeric path elements', () => {
    const mapper = createErrorMapper()
    const message = mapper.format({
      code: 'invalid_type',
      path: ['items', 0],
      input: undefined,
      expected: 'string',
    })
    assert.equal(message, 'The value is required')
  })

  it('handles empty path', () => {
    const mapper = createErrorMapper()
    const message = mapper.format({
      code: 'invalid_type',
      path: [],
      input: undefined,
      expected: 'object',
    })
    assert.equal(message, 'The value is required')
  })
})

describe('defaultErrorMapper', () => {
  it('is a pre-configured error mapper', () => {
    assert.ok(defaultErrorMapper.format)
    assert.ok(defaultErrorMapper.createErrorMap)
  })

  it('formats errors correctly', () => {
    const message = defaultErrorMapper.format({
      code: 'invalid_type',
      path: ['name'],
      input: undefined,
      expected: 'string',
    })
    assert.equal(message, 'The name is required')
  })
})

describe('setZodErrorMap', () => {
  it('sets the global error map on Zod', () => {
    setZodErrorMap(z)

    const schema = z.object({
      email: z.string(),
    })

    try {
      schema.parse({})
    } catch (error) {
      assert.ok(error instanceof z.ZodError)
      assert.equal(error.issues[0].message, 'The email is required')
    }
  })

  it('accepts custom configuration', () => {
    setZodErrorMap(z, {
      builders: {
        [ErrorCode.INVALID_TYPE]: (issue, label) => `Missing: ${label.bare}`,
      },
    })

    const schema = z.object({
      name: z.string(),
    })

    try {
      schema.parse({})
    } catch (error) {
      assert.ok(error instanceof z.ZodError)
      assert.equal(error.issues[0].message, 'Missing: name')
    }
  })
})

describe('createZodErrorMap', () => {
  it('creates a Zod error map function', () => {
    const errorMap = createZodErrorMap()
    assert.equal(typeof errorMap, 'function')
  })

  it('returns message object', () => {
    const errorMap = createZodErrorMap()
    const result = errorMap(
      { code: 'invalid_type', path: ['field'], input: undefined, expected: 'string' },
      {}
    )
    assert.deepEqual(result, { message: 'The field is required' })
  })

  it('accepts custom configuration', () => {
    const errorMap = createZodErrorMap({ defaultError: 'Custom default' })
    const result = errorMap({ code: 'unknown', path: ['field'] }, {})
    assert.deepEqual(result, { message: 'Custom default' })
  })
})

describe('ErrorCode constants', () => {
  it('has all error codes', () => {
    assert.equal(ErrorCode.INVALID_TYPE, 'invalid_type')
    assert.equal(ErrorCode.TOO_SMALL, 'too_small')
    assert.equal(ErrorCode.TOO_BIG, 'too_big')
    assert.equal(ErrorCode.INVALID_FORMAT, 'invalid_format')
    assert.equal(ErrorCode.CUSTOM, 'custom')
  })
})

describe('FormatType constants', () => {
  it('has all format types', () => {
    assert.equal(FormatType.EMAIL, 'email')
    assert.equal(FormatType.UUID, 'uuid')
    assert.equal(FormatType.URL, 'url')
    assert.equal(FormatType.REGEX, 'regex')
    assert.equal(FormatType.CUID, 'cuid')
    assert.equal(FormatType.CUID2, 'cuid2')
    assert.equal(FormatType.ULID, 'ulid')
    assert.equal(FormatType.IP, 'ip')
    assert.equal(FormatType.EMOJI, 'emoji')
    assert.equal(FormatType.DATE, 'date')
    assert.equal(FormatType.DATETIME, 'datetime')
    assert.equal(FormatType.TIME, 'time')
  })
})

describe('Integration with Zod schemas', () => {
  it('handles string validation', () => {
    setZodErrorMap(z)
    const schema = z.string().min(3).max(10)

    try {
      schema.parse('ab')
    } catch (error) {
      assert.ok(error instanceof z.ZodError)
      assert.match(error.issues[0].message, /at least 3 characters/)
    }
  })

  it('handles email validation', () => {
    setZodErrorMap(z)
    const schema = z.string().email()

    try {
      schema.parse('not-an-email')
    } catch (error) {
      assert.ok(error instanceof z.ZodError)
      assert.match(error.issues[0].message, /valid email/)
    }
  })

  it('handles object validation', () => {
    setZodErrorMap(z)
    const schema = z.object({
      name: z.string(),
      age: z.number(),
    })

    try {
      schema.parse({ name: 'John', age: 'not a number' })
    } catch (error) {
      assert.ok(error instanceof z.ZodError)
      assert.match(error.issues[0].message, /Expected number/)
    }
  })

  it('handles nested object validation', () => {
    setZodErrorMap(z)
    const schema = z.object({
      user: z.object({
        email: z.string().email(),
      }),
    })

    try {
      schema.parse({ user: { email: 'invalid' } })
    } catch (error) {
      assert.ok(error instanceof z.ZodError)
      assert.match(error.issues[0].message, /valid email/)
    }
  })

  it('handles array validation', () => {
    setZodErrorMap(z)
    const schema = z.array(z.string())

    try {
      schema.parse([1, 2, 3])
    } catch (error) {
      assert.ok(error instanceof z.ZodError)
      assert.match(error.issues[0].message, /Expected string/)
    }
  })
})
