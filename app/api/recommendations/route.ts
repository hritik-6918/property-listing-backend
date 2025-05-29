import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import Recommendation from "@/lib/recommendation"
import Property from "@/lib/property"
import User from "@/lib/user"
import { requireAuth } from "@/lib/auth"
import mongoose from "mongoose"

// GET - Get all recommendations received by the authenticated user
export async function GET(req: NextRequest) {
  const authResult = await requireAuth(req)

  if (!authResult.user) {
    return authResult.response
  }

  try {
    await connectToDatabase()

    const recommendations = await Recommendation.find({ to: authResult.user.id })
      .populate("from", "name email")
      .populate({
        path: "property",
        populate: {
          path: "createdBy",
          select: "name email",
        },
      })

    return NextResponse.json(recommendations)
  } catch (error) {
    console.error("Error fetching recommendations:", error)
    return NextResponse.json({ error: "Failed to fetch recommendations" }, { status: 500 })
  }
}

// POST - Recommend a property to another user
export async function POST(req: NextRequest) {
  const authResult = await requireAuth(req)

  if (!authResult.user) {
    return authResult.response
  }

  try {
    const { propertyId, recipientEmail, message } = await req.json()

    if (!propertyId || !recipientEmail) {
      return NextResponse.json({ error: "Property ID and recipient email are required" }, { status: 400 })
    }

    await connectToDatabase()

    // Find the property
    const property = await Property.findOne({ id: propertyId })

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 })
    }

    // Find the recipient user
    const recipient = await User.findOne({ email: recipientEmail })

    if (!recipient) {
      return NextResponse.json({ error: "Recipient user not found" }, { status: 404 })
    }

    // Check if already recommended
    const existingRecommendation = await Recommendation.findOne({
      from: authResult.user.id,
      to: recipient._id,
      property: property._id,
    })

    if (existingRecommendation) {
      return NextResponse.json({ error: "You have already recommended this property to this user" }, { status: 409 })
    }

    // Create recommendation
    const recommendation = new Recommendation({
      from: new mongoose.Types.ObjectId(authResult.user.id),
      to: recipient._id,
      property: property._id,
      message,
    })

    await recommendation.save()

    return NextResponse.json({ message: "Property recommended successfully" }, { status: 201 })
  } catch (error) {
    console.error("Error recommending property:", error)
    return NextResponse.json({ error: "Failed to recommend property" }, { status: 500 })
  }
}
