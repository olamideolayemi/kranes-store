import type { NextFunction, Request, Response } from 'express'
import jwt, { type SignOptions } from 'jsonwebtoken'
import { CONFIG } from './config'
import { db } from './dataStore'
import type { AuthTokenPayload } from './types'

export const signToken = (payload: AuthTokenPayload): string => {
  const options: SignOptions = { expiresIn: CONFIG.jwtExpiresIn as SignOptions['expiresIn'] }
  return jwt.sign(payload, CONFIG.jwtSecret, options)
}

export const parseToken = (token: string): AuthTokenPayload | null => {
  try {
    return jwt.verify(token, CONFIG.jwtSecret) as AuthTokenPayload
  } catch {
    return null
  }
}

export const authMiddleware = (request: Request, response: Response, next: NextFunction) => {
  const header = request.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    response.status(401).json({ message: 'Unauthorized' })
    return
  }

  const token = header.replace('Bearer ', '')
  const payload = parseToken(token)

  if (!payload) {
    response.status(401).json({ message: 'Invalid token' })
    return
  }

  const user = db.read().users.find((entry) => entry.id === payload.userId)

  if (!user) {
    response.status(401).json({ message: 'User not found' })
    return
  }

  request.user = user
  next()
}

export const adminMiddleware = (request: Request, response: Response, next: NextFunction) => {
  if (!request.user) {
    response.status(401).json({ message: 'Unauthorized' })
    return
  }

  if (request.user.role !== 'admin') {
    response.status(403).json({ message: 'Admin access required' })
    return
  }

  next()
}
