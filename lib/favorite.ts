import mongoose, { Schema, type Document } from "mongoose"

export interface IFavorite extends Document {
  user: mongoose.Types.ObjectId
  property: mongoose.Types.ObjectId
  createdAt: Date
}

const FavoriteSchema: Schema = new Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    property: { type: mongoose.Schema.Types.ObjectId, ref: "Property", required: true },
  },
  { timestamps: true },
)

// Create a compound index to ensure a user can only favorite a property once
FavoriteSchema.index({ user: 1, property: 1 }, { unique: true })

export default mongoose.models.Favorite || mongoose.model<IFavorite>("Favorite", FavoriteSchema)
