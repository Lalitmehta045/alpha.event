import toast from "react-hot-toast";

export const uploadToS3 = async (file: File): Promise<string | null> => {
  const toastId = toast.loading("Uploading image...");

  try {
    const formData = new FormData();
    formData.append("my_file", file);

    const uploadResponse = await fetch("/api/admin/product/upload-image", {
      method: "POST",
      body: formData,
    });

    const data = await uploadResponse.json();

    if (!data.success) {
      console.error("Upload failed:", data.error);
      toast.error(data.error || "❌ Upload failed!", { id: toastId });
      return null;
    }

    const uploadedUrl = `https://alpha-arts.s3.eu-north-1.amazonaws.com/${data.result.url}`;
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
