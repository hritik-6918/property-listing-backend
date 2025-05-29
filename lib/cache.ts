import { getRedisClient } from "./db"

const DEFAULT_EXPIRATION = 3600 // 1 hour in seconds

export async function getCache<T>(key: string): Promise<T | null> {
  try {
    const client = await getRedisClient()
    const data = await client.get(key)
    return data ? (JSON.parse(data) as T) : null
  } catch (error) {
    console.error("Redis get error:", error)
    return null
  }
}

export async function setCache<T>(key: string, data: T, expiration: number = DEFAULT_EXPIRATION): Promise<void> {
  try {
    const client = await getRedisClient()
    await client.set(key, JSON.stringify(data), { EX: expiration })
  } catch (error) {
    console.error("Redis set error:", error)
  }
}

export async function deleteCache(key: string): Promise<void> {
  try {
    const client = await getRedisClient()
    await client.del(key)
  } catch (error) {
    console.error("Redis delete error:", error)
  }
}

export async function invalidatePattern(pattern: string): Promise<void> {
  try {
    const client = await getRedisClient()
    const keys = await client.keys(pattern)

    if (keys.length > 0) {
      await client.del(keys)
    }
  } catch (error) {
    console.error("Redis invalidate pattern error:", error)
  }
}
