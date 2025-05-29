import { connectToDatabase } from "@/lib/db"
import User from "@/lib/user"

export async function getUserById(id: string) {
  await connectToDatabase()
  return User.findById(id).select("-password")
}
