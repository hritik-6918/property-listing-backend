import mongoose, { Schema, type Document } from "mongoose"

export interface IProperty extends Document {
  id: string
  title: string
  type: string
  price: number
  state: string
  city: string
  areaSqFt: number
  bedrooms: number
  bathrooms: number
  amenities: string[]
  furnished: string
  availableFrom: Date
  listedBy: string
  tags: string[]
  colorTheme: string
  rating: number
  isVerified: boolean
  listingType: string
  createdBy: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const PropertySchema: Schema = new Schema(
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

// Create indexes for frequently queried fields
PropertySchema.index({ price: 1 })
PropertySchema.index({ state: 1, city: 1 })
PropertySchema.index({ type: 1 })
PropertySchema.index({ bedrooms: 1 })
PropertySchema.index({ bathrooms: 1 })
PropertySchema.index({ listingType: 1 })
PropertySchema.index({ createdBy: 1 })

export default mongoose.models.Property || mongoose.model<IProperty>("Property", PropertySchema)
