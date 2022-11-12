export class FetchError extends Error {
  constructor (msg: string) {
    super(msg)

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, FetchError)
    }

    this.name = 'FetchError'
    this.message = msg
  }
}

export class BackendError extends Error {
  constructor (msg: string) {
    super(msg)

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, BackendError)
    }

    this.name = 'BackendError'
    this.message = msg
  }
}

export class ConfigError extends Error {
  constructor (msg: string) {
    super(msg)

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ConfigError)
    }

    this.name = 'ConfigError'
    this.message = msg
  }
}

export class MalformedError extends Error {
  constructor (msg: string) {
    super(msg)

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, MalformedError)
    }

    this.name = 'MalformedError'
    this.message = msg
  }
}
