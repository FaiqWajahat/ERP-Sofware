import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    // 1. Create the response object
    const response = NextResponse.json(
      { message: "Logout successful", success: true },
      { status: 200 }
    );

    // 2. Clear the Authentication Cookie
    // We overwrite the cookie with an empty value and set it to expire immediately.
    response.cookies.set("auth_token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      expires: new Date(0), // Expire immediately
      path: "/", // Must match the path used in Login
    });

    // Alternatively, you can use: response.cookies.delete("auth_token");

    return response;

  } catch (error) {
    console.error("Logout Error:", error);
    return NextResponse.json(
      { message: "Server Error", success: false },
      { status: 500 }
    );
  }
}