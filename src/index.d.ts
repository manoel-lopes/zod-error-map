import type { z } from 'zod'

export interface Label {
  bare: string
  quoted: string
}

export interface RawIssue {
  code: string
  path: Array<string | number>
  input?: unknown
  expected?: string
  minimum?: number
  maximum?: number
  format?: string
  message?: string
}

export type MessageBuilder = (issue: RawIssue, label: Label) => string

export type FormatMessageBuilder = (label: Label) => string

export interface ErrorMapConfig {
  defaultError?: string
  builders?: Record<string, MessageBuilder>
  formatMessages?: Record<string, FormatMessageBuilder>
}

export interface ErrorMapper {
  format: (issue: unknown) => string
  createErrorMap: () => (issue: unknown) => string
}

export declare const ErrorCode: {
  readonly INVALID_TYPE: 'invalid_type'
  readonly TOO_SMALL: 'too_small'
  readonly TOO_BIG: 'too_big'
  readonly INVALID_FORMAT: 'invalid_format'
  readonly CUSTOM: 'custom'
}

export declare const FormatType: {
  readonly EMAIL: 'email'
  readonly UUID: 'uuid'
  readonly URL: 'url'
  readonly REGEX: 'regex'
  readonly CUID: 'cuid'
  readonly CUID2: 'cuid2'
  readonly ULID: 'ulid'
  readonly IP: 'ip'
  readonly EMOJI: 'emoji'
  readonly DATE: 'date'
  readonly DATETIME: 'datetime'
  readonly TIME: 'time'
}

export declare function createErrorMapper(config?: ErrorMapConfig): ErrorMapper
export declare const defaultErrorMapper: ErrorMapper

export declare function getInputDescription(input: unknown): string
export declare const defaultFormatMessages: Record<string, (label: Label) => string>
export declare function buildInvalidTypeMessage(issue: RawIssue, label: Label): string
export declare function buildTooSmallMessage(issue: RawIssue, label: Label): string
export declare function buildTooBigMessage(issue: RawIssue, label: Label): string
export declare function createFormatMessageBuilder(
  formatMessages?: Record<string, (label: Label) => string>
): MessageBuilder
export declare function createCustomMessageBuilder(defaultError: string): MessageBuilder
export declare function createDefaultBuilders(
  defaultError: string,
  formatMessages?: Record<string, (label: Label) => string>
): Record<string, MessageBuilder>

export declare function setZodErrorMap(z: typeof import('zod').z, config?: ErrorMapConfig): void
export declare function createZodErrorMap(
  config?: ErrorMapConfig
): (issue: unknown, ctx: unknown) => { message: string }
