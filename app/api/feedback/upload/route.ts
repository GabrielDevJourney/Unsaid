import { randomUUID } from "node:crypto";
import { auth } from "@clerk/nextjs/server";
import sharp from "sharp";
import { checkFeedbackRateLimit } from "@/lib/feedback/service";
import { createSupabaseServer } from "@/lib/supabase/server";

const ALLOWED_TYPES = new Set(["image/png", "image/jpeg"]);
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

export const POST = async (req: Request) => {
    const { userId } = await auth();
    if (!userId) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = await createSupabaseServer();

    // Gate uploads behind the same daily rate limit as submissions
    const isLimited = await checkFeedbackRateLimit(supabase, userId);
    if (isLimited) {
        return Response.json(
            { error: "You've reached the daily limit. Try again tomorrow." },
            { status: 429 },
        );
    }

    let formData: FormData;
    try {
        formData = await req.formData();
    } catch {
        return Response.json({ error: "Invalid form data" }, { status: 400 });
    }

    const file = formData.get("file");
    if (!(file instanceof File)) {
        return Response.json({ error: "No file provided" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.has(file.type)) {
        return Response.json(
            { error: "Only PNG and JPG files are accepted" },
            { status: 400 },
        );
    }

    if (file.size > MAX_BYTES) {
        return Response.json(
            { error: "File exceeds 10 MB limit" },
            { status: 400 },
        );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const compressed = await sharp(buffer)
        .resize({ width: 1280, withoutEnlargement: true })
        .webp({ quality: 85 })
        .toBuffer();

    const path = `${userId}/${randomUUID()}.webp`;

    const { error } = await supabase.storage
        .from("feedback-media")
        .upload(path, compressed, {
            contentType: "image/webp",
            upsert: false,
        });

    if (error) {
        return Response.json({ error: "Upload failed" }, { status: 500 });
    }

    const { data } = supabase.storage.from("feedback-media").getPublicUrl(path);

    return Response.json({ data: { url: data.publicUrl } });
};
