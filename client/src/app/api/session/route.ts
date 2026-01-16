import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET(req: NextRequest) {
  try {
    console.log("Session API called");
    const session = await getServerSession(authOptions);
    console.log("Session retrieved:", session);
    
    if (!session) {
      console.log("No session found");
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    
    if (!session.backendToken) {
      console.log("No backend token in session");
      return NextResponse.json({ error: "No backend token" }, { status: 401 });
    }

    console.log("Returning token and user");
    return NextResponse.json({ 
      token: session.backendToken,
      user: session.user 
    });
  } catch (error) {
    console.error("Session API error:", error);
    return NextResponse.json({ error: "Failed to get session" }, { status: 500 });
  }
}
