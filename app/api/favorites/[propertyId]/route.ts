import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import Favorite from "@/lib/favorite"
import Property from "@/lib/property"
import { requireAuth } from "@/lib/auth"
import mongoose from "mongoose"

// POST - Add a property to favorites
export async function POST(req: NextRequest, { params }: { params: { propertyId: string } }) {
  const authResult = await requireAuth(req)

  if (!authResult.user) {
    return authResult.response
  }

  try {
    const { propertyId } = params

    await connectToDatabase()

    // Find the property
    const property = await Property.findOne({ id: propertyId })

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 })
    }

    // Check if already favorited
    const existingFavorite = await Favorite.findOne({
      user: authResult.user.id,
      property: property._id,
    })

    if (existingFavorite) {
      return NextResponse.json({ error: "Property already in favorites" }, { status: 409 })
    }

    // Add to favorites
    const favorite = new Favorite({
      user: new mongoose.Types.ObjectId(authResult.user.id),
      property: property._id,
    })

    await favorite.save()

    return NextResponse.json({ message: "Property added to favorites" }, { status: 201 })
  } catch (error) {
    console.error("Error adding to favorites:", error)
    return NextResponse.json({ error: "Failed to add property to favorites" }, { status: 500 })
  }
}

// DELETE - Remove a property from favorites
export async function DELETE(req: NextRequest, { params }: { params: { propertyId: string } }) {
  const authResult = await requireAuth(req)

  if (!authResult.user) {
    return authResult.response
  }

  try {
    const { propertyId } = params

    await connectToDatabase()

    // Find the property
    const property = await Property.findOne({ id: propertyId })

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 })
    }

    // Remove from favorites
    const result = await Favorite.deleteOne({
      user: authResult.user.id,
      property: property._id,
    })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Property not found in favorites" }, { status: 404 })
    }

    return NextResponse.json({ message: "Property removed from favorites" })
  } catch (error) {
    console.error("Error removing from favorites:", error)
    return NextResponse.json({ error: "Failed to remove property from favorites" }, { status: 500 })
  }
}
