import type { UserRecord } from './types'

declare global {
  namespace Express {
    interface Request {
      user?: UserRecord
    }
  }
}

export {}
