export const CONFIG = {
  port: Number(process.env.API_PORT || 4000),
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-me',
  jwtExpiresIn: '7d',
  cacheTtlMs: 60_000,
}
