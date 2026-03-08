import toast from "react-hot-toast";

/**
 * Maximum dimension (width or height) for uploaded images.
 * Images larger than this are resized to fit within this boundary.
 */
const MAX_IMAGE_DIMENSION = 1920;

/**
 * Files larger than this (in bytes) will be compressed, even if not HEIC.
 * 2 MB threshold — most product images don't need to be larger.
 */
const COMPRESS_THRESHOLD_BYTES = 2 * 1024 * 1024;

/**
 * JPEG quality for compression (0–1). 0.8 provides a good balance
 * between quality and file size for product images.
 */
const JPEG_QUALITY = 0.8;

/**
 * Checks if a file is in HEIC/HEIF format (common iPhone photo format).
 * Detects by file extension or MIME type.
 */
function isHeicFile(file: File): boolean {
    const name = file.name.toLowerCase();
    const type = file.type.toLowerCase();
    return (
        name.endsWith(".heic") ||
        name.endsWith(".heif") ||
        type === "image/heic" ||
        type === "image/heif"
    );
}

/**
 * Compresses and resizes an image file using the Canvas API.
 *
 * - Resizes to fit within MAX_IMAGE_DIMENSION (preserving aspect ratio)
 * - Re-encodes as JPEG at JPEG_QUALITY
 * - Returns a new File object with .jpg extension
 */
async function compressImage(file: File): Promise<File> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);

        img.onload = () => {
            try {
                let { width, height } = img;
                if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
                    const scale = MAX_IMAGE_DIMENSION / Math.max(width, height);
                    width = Math.round(width * scale);
                    height = Math.round(height * scale);
                }

                const canvas = document.createElement("canvas");
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext("2d");
                if (!ctx) {
                    reject(new Error("Canvas 2D context unavailable"));
                    return;
                }
                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob(
                    (blob) => {
                        URL.revokeObjectURL(url);
                        if (!blob) {
                            reject(new Error("Canvas toBlob returned null"));
                            return;
                        }
                        const baseName = file.name.replace(/\.[^.]+$/, "");
                        const compressedFile = new File([blob], `${baseName}.jpg`, {
                            type: "image/jpeg",
                        });
                        console.log(
                            `[compressImage] ${file.name}: ${(file.size / 1024).toFixed(0)} KB → ${(compressedFile.size / 1024).toFixed(0)} KB`
                        );
                        resolve(compressedFile);
                    },
                    "image/jpeg",
                    JPEG_QUALITY
                );
            } catch (err) {
                URL.revokeObjectURL(url);
                reject(err);
            }
        };

        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error("Failed to load image for compression"));
        };

        img.src = url;
    });
}

/**
 * Converts a HEIC file on the SERVER using sharp (via API endpoint).
 * Used as a fallback when the client-side heic2any library fails
 * on large files (5MB+).
 *
 * Sends the raw HEIC bytes to the server, receives JPEG back.
 */
async function convertHeicOnServer(file: File): Promise<File> {
    console.log(`[convertHeicOnServer] Sending ${(file.size / 1024).toFixed(0)} KB to server...`);

    const response = await fetch("/api/admin/product/convert-heic", {
        method: "POST",
        body: file, // raw binary body, NOT FormData — avoids body size limits
        headers: {
            "Content-Type": file.type || "application/octet-stream",
        },
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server conversion failed (${response.status})`);
    }

    const jpegBlob = await response.blob();
    const baseName = file.name.replace(/\.[^.]+$/, "");
    const convertedFile = new File([jpegBlob], `${baseName}.jpg`, {
        type: "image/jpeg",
    });

    console.log(
        `[convertHeicOnServer] Done: ${(file.size / 1024).toFixed(0)} KB → ${(convertedFile.size / 1024).toFixed(0)} KB`
    );

    return convertedFile;
}

/**
 * Converts a HEIC/HEIF image file to JPEG.
 *
 * Strategy:
 * 1. Try client-side conversion with heic2any (fast, no server round-trip)
 * 2. If heic2any fails (common with large 5MB+ files), fall back to
 *    server-side conversion with sharp (handles any size efficiently)
 * 3. After conversion, compress if still large
 *
 * Non-HEIC files that exceed COMPRESS_THRESHOLD_BYTES are also compressed.
 *
 * @param file - The image File object selected by the user
 * @returns A File object (compressed JPEG)
 */
export async function convertHeicToJpeg(file: File): Promise<File> {
    let processedFile = file;

    // Step 1: Convert HEIC → JPEG if needed
    if (isHeicFile(file)) {
        const toastId = toast.loading("Converting iPhone image...");

        try {
            // Try client-side conversion first (works for small HEIC files)
            const heic2any = (await import("heic2any")).default;

            const blob = await heic2any({
                blob: file,
                toType: "image/jpeg",
                quality: 0.85,
            });

            const resultBlob = Array.isArray(blob) ? blob[0] : blob;
            const newName = file.name
                .replace(/\.heic$/i, ".jpg")
                .replace(/\.heif$/i, ".jpg");

            processedFile = new File([resultBlob], newName, {
                type: "image/jpeg",
            });

            toast.success("iPhone image converted!", { id: toastId });
        } catch (clientError) {
            // heic2any fails on large files (5MB+) — fall back to server
            console.warn("[convertHeicToJpeg] Client-side failed, trying server:", clientError);
            toast.loading("Converting large image on server...", { id: toastId });

            try {
                processedFile = await convertHeicOnServer(file);
                toast.success("iPhone image converted!", { id: toastId });
            } catch (serverError) {
                console.error("[convertHeicToJpeg] Server conversion also failed:", serverError);
                toast.error("Failed to convert iPhone image. Please try a JPG or PNG.", {
                    id: toastId,
                });
                throw serverError;
            }
        }
    }

    // Step 2: Compress/resize if file is still large
    if (processedFile.size > COMPRESS_THRESHOLD_BYTES) {
        const toastId = toast.loading("Compressing image...");
        try {
            processedFile = await compressImage(processedFile);
            toast.success("Image compressed!", { id: toastId });
        } catch (error) {
            console.error("Image compression failed:", error);
            toast.error("Image compression failed, uploading original.", {
                id: toastId,
            });
            // Non-fatal: continue with the uncompressed file
        }
    }

    return processedFile;
}
