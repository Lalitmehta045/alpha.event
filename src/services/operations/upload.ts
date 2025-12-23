import toast from "react-hot-toast";
import { apiConnector } from "../apiconnector";
import { adminEndpoints } from "../api_endpoints";

const { UPLOADIMAGE_POSTAPI } = adminEndpoints;

export const uploadToS3 = async (file: File): Promise<string | null> => {
  const toastId = toast.loading("Generating upload URL...");

  try {
    // 1️⃣ Get presigned URL from backend
    const res = await apiConnector(
      "GET",
      `${UPLOADIMAGE_POSTAPI}?filename=${encodeURIComponent(
        file.name
      )}&contentType=${file.type}`
    );

    const { url, fields, key } = res.data;

    // 2️⃣ Build form data
    const formData = new FormData();
    Object.entries(fields).forEach(([k, v]) => formData.append(k, v as string));
    formData.append("file", file);

    // 3️⃣ Upload directly to S3
    const uploadResponse = await fetch(url, {
      method: "POST",
      body: formData,
    });

    if (!uploadResponse.ok) {
      const errText = await uploadResponse.text();
      console.error("S3 upload failed:", errText);
      toast.error("❌ Upload failed!", { id: toastId });
      return null;
    }

    // 4️⃣ Success — get the uploaded URL
    const uploadedUrl = `${url}${fields.key}`;
    toast.success("✅ File uploaded successfully!", { id: toastId });
    console.log("✅ Uploaded S3 URL:", uploadedUrl);
    return uploadedUrl;
  } catch (error) {
    console.error("Upload error:", error);
    toast.error("⚠️ Something went wrong while uploading!", { id: toastId });
    return null;
  } finally {
    toast.dismiss(toastId);
  }
};
