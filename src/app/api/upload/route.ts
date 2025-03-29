import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client with server-side credentials
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const storageBucket =
  process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || "minka";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Ensure storage buckets exist
const ensureStorageBuckets = async () => {
  // Check if campaign-images bucket exists, create if not
  const { data: buckets } = await supabase.storage.listBuckets();

  if (!buckets?.find((bucket) => bucket.name === storageBucket)) {
    await supabase.storage.createBucket(storageBucket, {
      public: true,
    });
  }
};

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getAuthSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Ensure storage buckets exist
    await ensureStorageBuckets();

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "video/mp4"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error:
            "File type not supported. Please upload JPEG, PNG or MP4 files only.",
        },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size exceeds 5MB limit" },
        { status: 400 }
      );
    }

    // Determine the file type and folder
    const isVideo = file.type.startsWith("video");
    const folder = isVideo ? "campaign-videos" : "campaign-images";

    // Create a unique filename
    const fileExt = file.name.split(".").pop();
    const fileName = `${session.user.id}_${Date.now()}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from(storageBucket)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Supabase upload error:", error);
      return NextResponse.json(
        { error: `Upload failed: ${error.message}` },
        { status: 500 }
      );
    }

    // Get the public URL for the file
    const {
      data: { publicUrl },
    } = supabase.storage.from(storageBucket).getPublicUrl(filePath);

    return NextResponse.json({
      success: true,
      url: publicUrl,
      type: isVideo ? "video" : "image",
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
