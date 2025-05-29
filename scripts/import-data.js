const fs = require("fs")
const path = require("path")
const { parse } = require("csv-parse")
const mongoose = require("mongoose")
require("dotenv").config()

// Simple User schema for the script
const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
  },
  { timestamps: true },
)

// Simple Property schema for the script
const PropertySchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    type: { type: String, required: true },
    price: { type: Number, required: true },
    state: { type: String, required: true },
    city: { type: String, required: true },
    areaSqFt: { type: Number, required: true },
    bedrooms: { type: Number, required: true },
    bathrooms: { type: Number, required: true },
    amenities: { type: [String], required: true },
    furnished: { type: String, required: true },
    availableFrom: { type: Date, required: true },
    listedBy: { type: String, required: true },
    tags: { type: [String], required: true },
    colorTheme: { type: String, required: false },
    rating: { type: Number, required: false },
    isVerified: { type: Boolean, default: false },
    listingType: { type: String, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
)

const User = mongoose.model("User", UserSchema)
const Property = mongoose.model("Property", PropertySchema)

// Connect to MongoDB
async function connectToDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log("MongoDB connected successfully")
  } catch (error) {
    console.error("MongoDB connection error:", error)
    process.exit(1)
  }
}

// Create admin user
async function createAdminUser() {
  try {
    const adminExists = await User.findOne({ email: "admin@example.com" })

    if (!adminExists) {
      const admin = new User({
        email: "admin@example.com",
        password: "admin123",
        name: "Admin User",
      })

      await admin.save()
      console.log("Admin user created successfully")
      return admin
    }

    console.log("Admin user already exists")
    return adminExists
  } catch (error) {
    console.error("Error creating admin user:", error)
    process.exit(1)
  }
}

// Process CSV data
async function importData(csvUrl, adminUser) {
  try {
    console.log("Fetching CSV data...")
    const fetch = (await import("node-fetch")).default
    const response = await fetch(csvUrl)
    const csvData = await response.text()

    // Save CSV to temp file
    const tempFilePath = path.join(__dirname, "temp-data.csv")
    fs.writeFileSync(tempFilePath, csvData)

    const parser = fs.createReadStream(tempFilePath).pipe(
      parse({
        columns: true,
        skip_empty_lines: true,
      }),
    )

    let count = 0
    const batchSize = 100
    let batch = []

    console.log("Processing CSV data...")

    for await (const record of parser) {
      // Process the record
      const property = {
        id: record.id,
        title: record.title,
        type: record.type,
        price: Number.parseInt(record.price),
        state: record.state,
        city: record.city,
        areaSqFt: Number.parseInt(record.areaSqFt),
        bedrooms: Number.parseInt(record.bedrooms),
        bathrooms: Number.parseInt(record.bathrooms),
        amenities: record.amenities ? record.amenities.split("|") : [],
        furnished: record.furnished,
        availableFrom: new Date(record.availableFrom),
        listedBy: record.listedBy,
        tags: record.tags ? record.tags.split("|") : [],
        colorTheme: record.colorTheme,
        rating: Number.parseFloat(record.rating),
        isVerified: record.isVerified === "True",
        listingType: record.listingType,
        createdBy: adminUser._id,
      }

      batch.push(property)
      count++

      // Insert in batches
      if (batch.length >= batchSize) {
        await Property.insertMany(batch)
        console.log(`Imported ${count} properties`)
        batch = []
      }
    }

    // Insert remaining records
    if (batch.length > 0) {
      await Property.insertMany(batch)
      console.log(`Imported ${count} properties`)
    }

    // Clean up temp file
    fs.unlinkSync(tempFilePath)

    console.log("Data import completed successfully")
  } catch (error) {
    console.error("Error importing data:", error)
    process.exit(1)
  }
}

// Main function
async function main() {
  try {
    await connectToDatabase()

    // Check if data already exists
    const count = await Property.countDocuments()
    if (count > 0) {
      console.log(`Database already contains ${count} properties. Skipping import.`)
      process.exit(0)
    }

    const adminUser = await createAdminUser()

    const csvUrl =
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/dataset-CSV-Zm8d7CQF5cNWoibX91H6FeMgjdkaXL.csv"
    await importData(csvUrl, adminUser)

    mongoose.connection.close()
  } catch (error) {
    console.error("Error in main function:", error)
    process.exit(1)
  }
}

main()
