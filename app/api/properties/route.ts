import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import Property from "@/lib/property"
import { getCache, setCache } from "@/lib/cache"
import { requireAuth } from "@/lib/auth"
import mongoose from "mongoose"

// GET - Get all properties with filtering
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const params = Object.fromEntries(url.searchParams.entries())

    // Build filter object
    const filter: any = {}

    // Apply filters based on query parameters
    if (params.type) filter.type = params.type
    if (params.state) filter.state = params.state
    if (params.city) filter.city = params.city
    if (params.listingType) filter.listingType = params.listingType
    if (params.furnished) filter.furnished = params.furnished
    if (params.isVerified) filter.isVerified = params.isVerified === "true"

    // Numeric filters
    if (params.minPrice) filter.price = { $gte: Number.parseInt(params.minPrice) }
    if (params.maxPrice) filter.price = { ...filter.price, $lte: Number.parseInt(params.maxPrice) }

    if (params.minBedrooms) filter.bedrooms = { $gte: Number.parseInt(params.minBedrooms) }
    if (params.maxBedrooms) filter.bedrooms = { ...filter.bedrooms, $lte: Number.parseInt(params.maxBedrooms) }

    if (params.minBathrooms) filter.bathrooms = { $gte: Number.parseInt(params.minBathrooms) }
    if (params.maxBathrooms) filter.bathrooms = { ...filter.bathrooms, $lte: Number.parseInt(params.maxBathrooms) }

    if (params.minAreaSqFt) filter.areaSqFt = { $gte: Number.parseInt(params.minAreaSqFt) }
    if (params.maxAreaSqFt) filter.areaSqFt = { ...filter.areaSqFt, $lte: Number.parseInt(params.maxAreaSqFt) }

    // Array filters
    if (params.amenities) {
      const amenitiesList = params.amenities.split(",")
      filter.amenities = { $all: amenitiesList }
    }

    if (params.tags) {
      const tagsList = params.tags.split(",")
      filter.tags = { $all: tagsList }
    }

    // Pagination
    const page = Number.parseInt(params.page || "1")
    const limit = Number.parseInt(params.limit || "10")
    const skip = (page - 1) * limit

    // Sorting
    const sortField = params.sortField || "createdAt"
    const sortOrder = params.sortOrder === "asc" ? 1 : -1
    const sort: any = {}
    sort[sortField] = sortOrder

    // Generate cache key based on query parameters
    const cacheKey = `properties:${JSON.stringify({ filter, page, limit, sort })}`

    // Try to get from cache first
    const cachedData = await getCache(cacheKey)
    if (cachedData) {
      return NextResponse.json(cachedData)
    }

    await connectToDatabase()

    // Execute query
    const properties = await Property.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate("createdBy", "name email")

    // Get total count for pagination
    const total = await Property.countDocuments(filter)

    const result = {
      properties,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    }

    // Cache the result
    await setCache(cacheKey, result)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching properties:", error)
    return NextResponse.json({ error: "Failed to fetch properties" }, { status: 500 })
  }
}

// POST - Create a new property
export async function POST(req: NextRequest) {
  const authResult = await requireAuth(req)

  if (!authResult.user) {
    return authResult.response
  }

  try {
    const propertyData = await req.json()

    // Validate required fields
    const requiredFields = [
      "title",
      "type",
      "price",
      "state",
      "city",
      "areaSqFt",
      "bedrooms",
      "bathrooms",
      "furnished",
      "availableFrom",
      "listedBy",
      "listingType",
    ]

    for (const field of requiredFields) {
      if (!propertyData[field]) {
        return NextResponse.json({ error: `${field} is required` }, { status: 400 })
      }
    }

    await connectToDatabase()

    // Generate a unique property ID
    const propertyCount = await Property.countDocuments()
    const propertyId = `PROP${(propertyCount + 1).toString().padStart(4, "0")}`

    // Process arrays
    if (typeof propertyData.amenities === "string") {
      propertyData.amenities = propertyData.amenities.split("|")
    }

    if (typeof propertyData.tags === "string") {
      propertyData.tags = propertyData.tags.split("|")
    }

    // Create new property
    const property = new Property({
      ...propertyData,
      id: propertyId,
      createdBy: new mongoose.Types.ObjectId(authResult.user.id),
    })

    await property.save()

    return NextResponse.json(property, { status: 201 })
  } catch (error) {
    console.error("Error creating property:", error)
    return NextResponse.json({ error: "Failed to create property" }, { status: 500 })
  }
}
