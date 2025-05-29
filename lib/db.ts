import mongoose from "mongoose"
import { createClient } from "redis"

// MongoDB connection
let isConnected = false

export const connectToDatabase = async () => {
  if (isConnected) {
    return
  }

  try {
    const db = await mongoose.connect(process.env.MONGODB_URI as string)
    isConnected = !!db.connections[0].readyState
    console.log("MongoDB connected successfully")
  } catch (error) {
    console.error("MongoDB connection error:", error)
    throw error
  }
}

// Redis connection
let redisClient: ReturnType<typeof createClient> | null = null

export const getRedisClient = async () => {
  if (!redisClient) {
    redisClient = createClient({
      url: process.env.REDIS_URL,
    })

    redisClient.on("error", (err) => console.log("Redis Client Error", err))
    await redisClient.connect()
    console.log("Redis connected successfully")
  }

  return redisClient
}

export const closeRedisConnection = async () => {
  if (redisClient) {
    await redisClient.quit()
    redisClient = null
  }
}
