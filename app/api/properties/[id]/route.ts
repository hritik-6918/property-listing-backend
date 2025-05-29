import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import Property from "@/lib/property"
import { getCache, setCache, deleteCache, invalidatePattern } from "@/lib/cache"
import { requireAuth } from "@/lib/auth"

// GET - Get a specific property by ID
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    // Try to get from cache first
    const cacheKey = `property:${id}`
    const cachedProperty = await getCache(cacheKey)

    if (cachedProperty) {
      return NextResponse.json(cachedProperty)
    }

    await connectToDatabase()

    const property = await Property.findOne({ id }).populate("createdBy", "name email")

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 })
    }

    // Cache the result
    await setCache(cacheKey, property)

    return NextResponse.json(property)
  } catch (error) {
    console.error("Error fetching property:", error)
    return NextResponse.json({ error: "Failed to fetch property" }, { status: 500 })
  }
}

// PUT - Update a property
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const authResult = await requireAuth(req)

  if (!authResult.user) {
    return authResult.response
  }

  try {
    const { id } = params
    const updateData = await req.json()

    await connectToDatabase()

    // Find the property
    const property = await Property.findOne({ id })

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 })
    }

    // Check if the user is the owner
    if (property.createdBy.toString() !== authResult.user.id) {
      return NextResponse.json({ error: "Not authorized to update this property" }, { status: 403 })
    }

    // Process arrays if they are strings
    if (typeof updateData.amenities === "string") {
      updateData.amenities = updateData.amenities.split("|")
    }

    if (typeof updateData.tags === "string") {
      updateData.tags = updateData.tags.split("|")
    }

    // Update the property
    const updatedProperty = await Property.findOneAndUpdate({ id }, { $set: updateData }, { new: true }).populate(
      "createdBy",
      "name email",
    )

    // Invalidate cache
    await deleteCache(`property:${id}`)
    await invalidatePattern("properties:*")

    return NextResponse.json(updatedProperty)
  } catch (error) {
    console.error("Error updating property:", error)
    return NextResponse.json({ error: "Failed to update property" }, { status: 500 })
  }
}

// DELETE - Delete a property
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const authResult = await requireAuth(req)

  if (!authResult.user) {
    return authResult.response
  }

  try {
    const { id } = params

    await connectToDatabase()

    // Find the property
    const property = await Property.findOne({ id })

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 })
    }

    // Check if the user is the owner
    if (property.createdBy.toString() !== authResult.user.id) {
      return NextResponse.json({ error: "Not authorized to delete this property" }, { status: 403 })
    }

    // Delete the property
    await Property.deleteOne({ id })

    // Invalidate cache
    await deleteCache(`property:${id}`)
    await invalidatePattern("properties:*")

    return NextResponse.json({ message: "Property deleted successfully" })
  } catch (error) {
    console.error("Error deleting property:", error)
    return NextResponse.json({ error: "Failed to delete property" }, { status: 500 })
  }
}
