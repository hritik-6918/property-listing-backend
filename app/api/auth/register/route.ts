import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import User from "@/lib/user"
import { generateToken } from "@/lib/auth"

export async function POST(req: NextRequest) {
  try {
    const { email, password, name } = await req.json()

    // Validate input
    if (!email || !password || !name) {
      return NextResponse.json({ error: "Email, password, and name are required" }, { status: 400 })
    }

    await connectToDatabase()

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 409 })
    }

    // Create new user
    const user = new User({
      email,
      password,
      name,
    })

    await user.save()

    // Generate token
    const token = await generateToken({
      id: user._id.toString(),
      email: user.email,
      name: user.name,
    })

    // Set cookie
    const response = NextResponse.json(
      {
        message: "User registered successfully",
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
        },
      },
      { status: 201 },
    )

    response.cookies.set({
      name: "token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    })

    return response
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Failed to register user" }, { status: 500 })
  }
}
