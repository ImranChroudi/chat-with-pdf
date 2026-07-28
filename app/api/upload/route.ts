import cloudinary from "@/lib/cloudinary";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const file = formData.get("file") as File;
    const fileId = formData.get("fileId") as File;
    const userId = formData.get("userId") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const fileToId = uuidv4();

    const result = await new Promise<any>((resolve, reject) => {

      cloudinary.uploader
        .upload_stream(
          {
            folder: `chat-with-pdf/${userId}/${fileId}`,
            resource_type: "auto",
            public_id: fileToId,
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        )
        .end(buffer);

      
    });

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}