import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { refreshAccessToken } from "./token/refreshAccessToken";

export async function authMiddleware(req: NextRequest): Promise<NextResponse | null> {
  try {
    // Get tokens from cookies or headers
    let accessToken = req.cookies.get("accessToken")?.value || 
                     req.headers.get("authorization")?.replace("Bearer ", "");
    
    const refreshToken = req.cookies.get("refreshToken")?.value;

    // If no access token but refresh token exists, try to refresh
    if (!accessToken && refreshToken) {
      const newAccessToken = await refreshAccessToken(refreshToken);
      
      if (newAccessToken) {
        // Set new access token in response
        const response = NextResponse.next();
        response.cookies.set("accessToken", newAccessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          path: "/",
          maxAge: 60 * 60 * 24 * 30, // 30 days
        });
        
        // Add to headers for API usage
        response.headers.set("x-new-access-token", newAccessToken);
        return response;
      }
    }

    // If access token exists, verify it
    if (accessToken) {
      try {
        const secret = process.env.SECRET_KEY_ACCESS_TOKEN;
        if (!secret) throw new Error("Access token secret not found");
        
        jwt.verify(accessToken, secret);
        return null; // Token is valid, continue
      } catch (error: any) {
        // Access token expired, try refresh
        if (error.name === "TokenExpiredError" && refreshToken) {
          const newAccessToken = await refreshAccessToken(refreshToken);
          
          if (newAccessToken) {
            const response = NextResponse.next();
            response.cookies.set("accessToken", newAccessToken, {
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
              sameSite: "strict",
              path: "/",
              maxAge: 60 * 60 * 24 * 30, // 30 days
            });
            
            response.headers.set("x-new-access-token", newAccessToken);
            return response;
          }
        }
      }
    }

    return null; // No valid tokens
  } catch (error) {
    console.error("Auth middleware error:", error);
    return null;
  }
}
