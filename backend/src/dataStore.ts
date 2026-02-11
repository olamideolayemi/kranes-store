import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { DatabaseShape } from './types'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const dataRoot = path.resolve(__dirname, '../data')

const files = {
  products: path.join(dataRoot, 'products.json'),
  users: path.join(dataRoot, 'users.json'),
  orders: path.join(dataRoot, 'orders.json'),
  returns: path.join(dataRoot, 'returns.json'),
  analytics: path.join(dataRoot, 'analytics.json'),
}

const readArray = <T>(filePath: string): T[] => {
  const raw = fs.readFileSync(filePath, 'utf-8')
  return JSON.parse(raw) as T[]
}

const writeArray = <T>(filePath: string, data: T[]): void => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
}

export const db = {
  read(): DatabaseShape {
    return {
      products: readArray(files.products),
      users: readArray(files.users),
      orders: readArray(files.orders),
      returns: readArray(files.returns),
      analytics: readArray(files.analytics),
    }
  },

  saveUsers(users: DatabaseShape['users']) {
    writeArray(files.users, users)
  },

  saveOrders(orders: DatabaseShape['orders']) {
    writeArray(files.orders, orders)
  },

  saveReturns(returnsList: DatabaseShape['returns']) {
    writeArray(files.returns, returnsList)
  },

  saveProducts(products: DatabaseShape['products']) {
    writeArray(files.products, products)
  },

  saveAnalytics(events: DatabaseShape['analytics']) {
    writeArray(files.analytics, events)
  },
}
