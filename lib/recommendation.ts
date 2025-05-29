import mongoose, { Schema, type Document } from "mongoose"

export interface IRecommendation extends Document {
  from: mongoose.Types.ObjectId
  to: mongoose.Types.ObjectId
  property: mongoose.Types.ObjectId
  message?: string
  createdAt: Date
}

const RecommendationSchema: Schema = new Schema(
  {
    from: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    to: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    property: { type: mongoose.Schema.Types.ObjectId, ref: "Property", required: true },
    message: { type: String },
  },
  { timestamps: true },
)

export default mongoose.models.Recommendation || mongoose.model<IRecommendation>("Recommendation", RecommendationSchema)
