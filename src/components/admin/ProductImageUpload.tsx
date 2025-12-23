import { FileIcon, UploadCloudIcon, XIcon } from "lucide-react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useRef, useEffect } from "react";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_ALPHA;

interface ProductImageUploadProps {
  imageFile: File | null;
  setImageFile: (file: File | null) => void;
  uploadedImageUrl: string;
  setUploadedImageUrl: (url: string) => void;
  imageLoadingState: boolean;
  setImageLoadingState: (loading: boolean) => void;
  isEditMode?: boolean;
  isCustomStyling?: boolean;
}

const ProductImageUpload: React.FC<ProductImageUploadProps> = ({
  imageFile,
  setImageFile,
  uploadedImageUrl,
  setUploadedImageUrl,
  imageLoadingState,
  setImageLoadingState,
  isEditMode = false,
  isCustomStyling = false,
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  // File select
  const handleImageFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) setImageFile(selectedFile);
  };

  // Drag & drop
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) =>
    event.preventDefault();
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files?.[0];
    if (droppedFile) setImageFile(droppedFile);
  };

  // Remove image
  const handleRemoveImage = () => {
    setImageFile(null);
    setUploadedImageUrl("");
    if (inputRef.current) inputRef.current.value = "";
  };

  // Optional: simulate upload or call backend
  const uploadImageToCloudinary = async () => {
    if (!imageFile) return;
    setImageLoadingState(true);

    try {
      const formData = new FormData();
      formData.append("my_file", imageFile);
      const response = await axios.post(
        `${BASE_URL}/api/admin/products/upload-image`,
        formData
      );

      if (response?.data?.success) {
        setUploadedImageUrl(response.data.result.url);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setImageLoadingState(false);
    }
  };

  useEffect(() => {
    if (imageFile) uploadImageToCloudinary();
  }, [imageFile]);

  return (
    <div className={`w-full mt-4 ${isCustomStyling ? "" : "max-w-md mx-auto"}`}>
      <Label className="text-lg font-semibold mb-2 block">Upload Image</Label>
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`${
          isEditMode ? "opacity-60" : ""
        } border-2 border-dashed rounded-lg p-4`}
      >
        <Input
          id="image-upload"
          type="file"
          className="hidden"
          ref={inputRef}
          onChange={handleImageFileChange}
          disabled={isEditMode}
        />
        {!imageFile ? (
          <Label
            htmlFor="image-upload"
            className={`${
              isEditMode ? "cursor-not-allowed" : ""
            } flex flex-col items-center justify-center h-32 cursor-pointer`}
          >
            <UploadCloudIcon className="w-10 h-10 text-muted-foreground mb-2" />
            <span>Drag & drop or click to upload image</span>
          </Label>
        ) : imageLoadingState ? (
          <Skeleton className="h-10 bg-gray-100" />
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FileIcon className="w-8 h-8 text-primary mr-2" />
            </div>
            <p className="text-sm font-medium">{imageFile.name}</p>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground"
              onClick={handleRemoveImage}
            >
              <XIcon className="w-4 h-4" />
              <span className="sr-only">Remove File</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductImageUpload;
