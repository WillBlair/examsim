import { auth } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  // Fetch the user's image from the database
  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
    columns: {
      image: true,
    },
  });

  if (!user?.image) {
    return new NextResponse("Not found", { status: 404 });
  }

  // If it's an external URL (e.g. Google), redirect to it
  if (!user.image.startsWith("data:")) {
    return NextResponse.redirect(user.image);
  }

  // If it's a Base64 string, serve it as an image
  try {
    // Parse the data URI
    // Format: data:image/[type];base64,[data]
    const matches = user.image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);

    if (!matches || matches.length !== 3) {
      return new NextResponse("Invalid image data", { status: 500 });
    }

    const contentType = matches[1];
    const buffer = Buffer.from(matches[2], "base64");

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600, must-revalidate",
      },
    });
  } catch (error) {
    console.error("Error serving avatar:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
