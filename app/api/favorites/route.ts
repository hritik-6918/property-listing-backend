import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import Favorite from "@/lib/favorite"
import { requireAuth } from "@/lib/auth"

// GET - Get all favorites for the authenticated user
export async function GET(req: NextRequest) {
  const authResult = await requireAuth(req)

  if (!authResult.user) {
    return authResult.response
  }

  try {
    await connectToDatabase()

    const favorites = await Favorite.find({ user: authResult.user.id }).populate({
      path: "property",
      populate: {
        path: "createdBy",
        select: "name email",
      },
    })

    return NextResponse.json(favorites)
  } catch (error) {
    console.error("Error fetching favorites:", error)
    return NextResponse.json({ error: "Failed to fetch favorites" }, { status: 500 })
  }
}
