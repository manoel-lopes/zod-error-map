# zod-error-map

Type-safe, customizable error message mapping for Zod validation.

## Installation

```bash
npm install zod-error-map
```

## Usage

### Basic Usage (Zod v4)

```js
import { z } from 'zod'
import { setZodErrorMap } from 'zod-error-map'

setZodErrorMap(z)

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

schema.parse({ email: 'invalid', password: '123' })
// Error: The 'email' must be a valid email address
```

### Custom Configuration

```js
import { z } from 'zod'
import { setZodErrorMap, ErrorCode } from 'zod-error-map'

setZodErrorMap(z, {
  defaultError: 'Validation failed',
  formatMessages: {
    email: (label) => `Please enter a valid email for ${label.quoted}`,
  },
  builders: {
    [ErrorCode.TOO_SMALL]: (issue, label) =>
      `${label.bare} needs at least ${issue.minimum} characters`,
  },
})
```

### Using the Error Mapper Directly

```js
import { createErrorMapper } from 'zod-error-map'

const mapper = createErrorMapper({
  defaultError: 'Invalid input',
})

const message = mapper.format({
  code: 'invalid_type',
  path: ['email'],
  input: undefined,
  expected: 'string',
})
// "The email is required"
```

### Zod v3 Compatibility

```js
import { z } from 'zod'
import { createZodErrorMap } from 'zod-error-map'

z.setErrorMap(createZodErrorMap())
```

## API

### `setZodErrorMap(z, config?)`

Sets the global Zod error map using `z.config()` (Zod v4).

### `createZodErrorMap(config?)`

Creates a Zod error map compatible with `z.setErrorMap()` (Zod v3).

### `createErrorMapper(config?)`

Creates an error mapper instance with custom configuration.

### Configuration Options

| Option | Type | Description |
|--------|------|-------------|
| `defaultError` | `string` | Default error message when no builder matches |
| `builders` | `Record<string, MessageBuilder>` | Custom message builders by error code |
| `formatMessages` | `Record<string, (label) => string>` | Custom messages for format validation errors |

### Error Codes

- `ErrorCode.INVALID_TYPE` - Type mismatch or missing required field
- `ErrorCode.TOO_SMALL` - Value below minimum length/value
- `ErrorCode.TOO_BIG` - Value above maximum length/value
- `ErrorCode.INVALID_FORMAT` - Invalid format (email, uuid, url, etc.)
- `ErrorCode.CUSTOM` - Custom validation errors

### Format Types

`FormatType.EMAIL`, `FormatType.UUID`, `FormatType.URL`, `FormatType.REGEX`, `FormatType.CUID`, `FormatType.CUID2`, `FormatType.ULID`, `FormatType.IP`, `FormatType.DATE`, `FormatType.DATETIME`, `FormatType.TIME`

## License

MIT
