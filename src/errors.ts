abstract class CustomError extends Error {
  protected constructor (name: string, msg: string) {
    super(msg)

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CustomError)
    }

    this.name = name
    this.message = msg
  }
}

export class FetchError extends CustomError {
  constructor (msg: string) {
    super('FetchError', msg)
  }
}

export class BackendError extends CustomError {
  constructor (msg: string) {
    super('BackendError', msg)
  }
}

export class MalformedError extends CustomError {
  constructor (msg: string) {
    super('MalformedError', msg)
  }
}
