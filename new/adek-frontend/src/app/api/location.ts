// app/api/location/route.ts
import { NextResponse } from "next/server";
import geoip from "geoip-lite";

export async function GET(request: Request) {
  try {
    // Get IP address
    const forwarded = request.headers.get("x-forwarded-for");
    let ip = forwarded ? forwarded.split(",")[0].trim() : null;

    // Development এ test IP ব্যবহার করুন
    if (!ip || ip === "::1" || ip.startsWith("127.")) {
      ip = "103.108.140.42"; // Bangladesh এর একটা IP (test এর জন্য)
    }

    // Lookup location
    const geo = geoip.lookup(ip);

    if (!geo) {
      throw new Error("Location not found");
    }

    return NextResponse.json({
      country: geo.country,
      region: geo.region,
      city: geo.city,
      timezone: geo.timezone,
      coordinates: geo.ll, // [latitude, longitude]
      ip: ip,
    });
  } catch (error) {
    console.error("Location Error:", error);

    // Default Bangladesh location
    return NextResponse.json({
      country: "BD",
      region: "Dhaka",
      city: "Dhaka",
      timezone: "Asia/Dhaka",
      coordinates: [23.8103, 90.4125],
    });
  }
}
