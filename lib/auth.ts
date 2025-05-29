import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { cookies } from "next/headers"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export interface AuthUser {
  id: string
  email: string
  name: string
}

export async function generateToken(user: AuthUser): Promise<string> {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
    },
    JWT_SECRET,
    { expiresIn: "7d" },
  )
}

export async function verifyToken(token: string): Promise<AuthUser | null> {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser
    return decoded
  } catch (error) {
    return null
  }
}

export async function getAuthUser(req: NextRequest): Promise<AuthUser | null> {
  const cookieStore = cookies()
  const token = cookieStore.get("token")?.value || req.headers.get("Authorization")?.replace("Bearer ", "")

  if (!token) {
    return null
  }

  return verifyToken(token)
}

export async function requireAuth(
  req: NextRequest,
): Promise<{ user: AuthUser; response?: NextResponse } | { user: null; response: NextResponse }> {
  const user = await getAuthUser(req)

  if (!user) {
    return {
      user: null,
      response: NextResponse.json({ error: "Authentication required" }, { status: 401 }),
    }
  }

  return { user }
}
