export const CONFIG = {
  port: Number(process.env.API_PORT || 4000),
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-me',
  jwtExpiresIn: '7d',
  cacheTtlMs: 60_000,
  bootstrapAdminEmail: process.env.ADMIN_EMAIL || 'admin@kranes.market',
  bootstrapAdminPassword: process.env.ADMIN_PASSWORD || 'Admin123!',
  bootstrapAdminName: process.env.ADMIN_NAME || 'Store Owner',
}
