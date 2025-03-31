"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { X, RotateCw, ZoomIn, ZoomOut } from "lucide-react";
import ReactCrop, {
  Crop as CropType,
  PixelCrop,
  centerCrop,
  makeAspectCrop,
} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

interface ImageEditorProps {
  imageUrl: string;
  onSave: (editedUrl: string) => void;
  onCancel: () => void;
}

export function ImageEditor({ imageUrl, onSave, onCancel }: ImageEditorProps) {
  const [imgSrc, setImgSrc] = useState(imageUrl);
  const imgRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<CropType>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const [rotation, setRotation] = useState(0);
  const [modalSize, setModalSize] = useState({ width: 800, height: 600 });
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [naturalWidth, setNaturalWidth] = useState(0);
  const [naturalHeight, setNaturalHeight] = useState(0);
  const [imgReady, setImgReady] = useState(false);
  const [scale, setScale] = useState(0.8);

  // Track if user has modified the crop
  const [hasModifiedCrop, setHasModifiedCrop] = useState(false);

  // Load image dimensions before rendering
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      setNaturalWidth(img.naturalWidth);
      setNaturalHeight(img.naturalHeight);
      calculateModalSize(img.naturalWidth, img.naturalHeight);
      setImgReady(true);
    };
    img.onerror = () => {
      console.error("Failed to load image");
    };
    img.src = imageUrl;
  }, [imageUrl]);

  // Calculate ideal modal size based on image and viewport
  const calculateModalSize = useCallback((width: number, height: number) => {
    // Fixed heights for header, footer and controls
    const HEADER_HEIGHT = 60;
    const CONTROLS_HEIGHT = 64;
    const FOOTER_HEIGHT = 80;
    const FIXED_HEIGHT = HEADER_HEIGHT + CONTROLS_HEIGHT + FOOTER_HEIGHT + 20; // +20 for margins

    // Get viewport dimensions with a small margin
    const viewportWidth = window.innerWidth * 0.9;
    const viewportHeight = window.innerHeight * 0.9;

    // Maximum available space for the image
    const maxImageWidth = viewportWidth - 40; // 20px padding on each side
    const maxImageHeight = viewportHeight - FIXED_HEIGHT;

    // Calculate aspect ratio
    const imgAspect = width / height;

    // Determine dimensions to fit within constraints
    let imgWidth = width;
    let imgHeight = height;

    // Scale down if needed
    if (imgWidth > maxImageWidth) {
      imgWidth = maxImageWidth;
      imgHeight = imgWidth / imgAspect;
    }

    if (imgHeight > maxImageHeight) {
      imgHeight = maxImageHeight;
      imgWidth = imgHeight * imgAspect;
    }

    // Final modal size (image area + fixed elements)
    const finalWidth = Math.max(Math.round(imgWidth) + 40, 400); // min width 400px
    const finalHeight = Math.round(imgHeight) + FIXED_HEIGHT;

    setModalSize({
      width: Math.min(finalWidth, viewportWidth),
      height: Math.min(finalHeight, viewportHeight),
    });
  }, []);

  // Handle image load
  const onImageLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const { width, height } = e.currentTarget;
      const { naturalWidth, naturalHeight } = e.currentTarget;

      setNaturalWidth(naturalWidth);
      setNaturalHeight(naturalHeight);
      setImgReady(true);

      // Set initial completedCrop to entire image dimensions
      const initialCrop = {
        x: 0,
        y: 0,
        width,
        height,
        unit: "px",
      };

      setCompletedCrop(initialCrop);
    },
    []
  );

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (naturalWidth && naturalHeight) {
        // For rotated image, swap dimensions
        if (rotation % 180 !== 0) {
          calculateModalSize(naturalHeight, naturalWidth);
        } else {
          calculateModalSize(naturalWidth, naturalHeight);
        }
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [naturalWidth, naturalHeight, calculateModalSize, rotation]);

  // Rotate image
  const handleRotate = useCallback(() => {
    setRotation((prev) => (prev + 90) % 360);

    // When rotating, swap dimensions for modal size calculation
    if (naturalWidth && naturalHeight) {
      // If we're going from landscape to portrait or vice versa, swap dimensions
      const isCurrentlyLandscape =
        rotation % 180 === 0
          ? naturalWidth > naturalHeight
          : naturalHeight > naturalWidth;

      const willBeLandscape =
        (rotation + 90) % 180 === 0
          ? naturalWidth > naturalHeight
          : naturalHeight > naturalWidth;

      if (isCurrentlyLandscape !== willBeLandscape) {
        calculateModalSize(naturalHeight, naturalWidth);
      }
    }
  }, [naturalWidth, naturalHeight, calculateModalSize, rotation]);

  // Handle zoom in
  const handleZoomIn = useCallback(() => {
    setScale((prev) => Math.min(prev + 0.1, 3));
  }, []);

  // Handle zoom out
  const handleZoomOut = useCallback(() => {
    setScale((prev) => Math.max(prev - 0.1, 0.5));
  }, []);

  // Handle slider change
  const handleSliderChange = useCallback((values: number[]) => {
    if (!values || values.length === 0) return;
    setScale(values[0]);
  }, []);

  // Save the edited image
  const handleSave = useCallback(() => {
    if (!imgRef.current || !completedCrop) return;

    try {
      const image = imgRef.current;
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Create a new canvas with the correct dimensions for the cropped area
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;

      // Account for pixel density
      const pixelRatio = window.devicePixelRatio || 1;

      // If the user hasn't modified the crop, use the full image
      const cropToDraw =
        hasModifiedCrop && crop
          ? completedCrop
          : {
              x: 0,
              y: 0,
              width: image.width,
              height: image.height,
              unit: "px",
            };

      // Get target dimensions
      let targetWidth = Math.floor(cropToDraw.width * scaleX);
      let targetHeight = Math.floor(cropToDraw.height * scaleY);

      // For rotated images, swap dimensions
      if (rotation % 180 !== 0) {
        [targetWidth, targetHeight] = [targetHeight, targetWidth];
      }

      // Set canvas sizing
      canvas.width = targetWidth * pixelRatio;
      canvas.height = targetHeight * pixelRatio;

      // Scale the context to account for the device pixel ratio
      ctx.scale(pixelRatio, pixelRatio);
      ctx.imageSmoothingQuality = "high";

      // Apply rotation to canvas before drawing
      const cropX = cropToDraw.x * scaleX;
      const cropY = cropToDraw.y * scaleY;
      const cropWidth = cropToDraw.width * scaleX;
      const cropHeight = cropToDraw.height * scaleY;

      // If we have rotation, we need more complex transformation
      if (rotation > 0) {
        // Center of the canvas
        const centerX = canvas.width / (2 * pixelRatio);
        const centerY = canvas.height / (2 * pixelRatio);

        // Translate to center, rotate, then translate back
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate((rotation * Math.PI) / 180);

        // For rotated images, we need to account for the dimension swap
        const rotatedOffsetX =
          rotation % 180 !== 0 ? -cropHeight / 2 : -cropWidth / 2;
        const rotatedOffsetY =
          rotation % 180 !== 0 ? -cropWidth / 2 : -cropHeight / 2;

        ctx.drawImage(
          image,
          cropX,
          cropY,
          cropWidth,
          cropHeight,
          rotatedOffsetX,
          rotatedOffsetY,
          cropWidth,
          cropHeight
        );

        ctx.restore();
      } else {
        // No rotation, simple draw
        ctx.drawImage(
          image,
          cropX,
          cropY,
          cropWidth,
          cropHeight,
          0,
          0,
          cropWidth,
          cropHeight
        );
      }

      // Convert the canvas to a data URL
      const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
      onSave(dataUrl);
    } catch (error) {
      console.error("Error saving edited image:", error);
    }
  }, [imgRef, completedCrop, rotation, onSave, crop, hasModifiedCrop]);

  // Handle crop change
  const handleCropChange = useCallback((c: CropType) => {
    setCrop(c);
    setHasModifiedCrop(true);
  }, []);

  const getEditorAreaStyle = () => {
    // Calculate the available height for the image area
    // Modal height minus header (60px), controls (64px), footer (80px), and some padding
    const fixedHeight = 60 + 64 + 80 + 10;
    const imageAreaHeight = modalSize.height - fixedHeight;

    return {
      height: `${imageAreaHeight}px`,
      maxHeight: `${imageAreaHeight}px`,
    };
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div
        style={{ width: modalSize.width, height: modalSize.height }}
        className="bg-white rounded-lg flex flex-col overflow-hidden max-w-[90vw] max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-4 flex justify-between items-center h-[60px]">
          <h2 className="text-xl font-medium">Editar foto</h2>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        {/* Image editor area */}
        <div
          ref={containerRef}
          style={getEditorAreaStyle()}
          className="flex-1 relative overflow-hidden bg-gray-900 flex items-center justify-center p-2"
        >
          {imgReady && (
            <div
              style={{
                transform: `scale(${scale})`,
                transition: "transform 0.2s ease",
                maxWidth: "100%",
                maxHeight: "100%",
              }}
            >
              <ReactCrop
                crop={crop}
                onChange={handleCropChange}
                onComplete={setCompletedCrop}
                aspect={undefined}
                className="flex items-center justify-center"
              >
                <img
                  ref={imgRef}
                  src={imgSrc}
                  alt="Editable"
                  style={{
                    transform: `rotate(${rotation}deg)`,
                    display: "block",
                    margin: "0 auto",
                  }}
                  onLoad={onImageLoad}
                  className="max-h-full max-w-full object-contain"
                />
              </ReactCrop>
            </div>
          )}
          {!imgReady && (
            <div className="flex items-center justify-center h-full w-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#478C5C]"></div>
            </div>
          )}
          <canvas ref={previewCanvasRef} className="hidden" />
        </div>

        {/* Controls bar */}
        <div className="border-t border-gray-300 h-[64px]">
          <div className="flex h-full">
            {/* Rotate button */}
            <div className="flex-none w-52 border-r border-gray-300">
              <button
                onClick={handleRotate}
                className="flex items-center justify-center h-full w-full gap-2 text-gray-700 hover:bg-gray-100"
              >
                <RotateCw size={20} />
                <span className="font-medium">Girar</span>
              </button>
            </div>

            {/* Zoom controls */}
            <div className="flex-1 flex items-center justify-center px-4">
              <button
                onClick={handleZoomOut}
                className="text-gray-500 hover:text-gray-900 p-2"
                aria-label="Zoom out"
              >
                <ZoomOut className="h-5 w-5 flex-shrink-0" />
              </button>
              <div className="w-[60%] mx-4">
                <Slider
                  defaultValue={[scale]}
                  value={[scale]}
                  min={0.5}
                  max={3}
                  step={0.1}
                  onValueChange={handleSliderChange}
                  className="[&_.relative]:h-8 [&_[data-orientation=horizontal]]:h-[4px] [&_[role=slider]]:h-5 [&_[role=slider]]:w-5 [&_[role=slider]]:border-black"
                />
              </div>
              <button
                onClick={handleZoomIn}
                className="text-gray-500 hover:text-gray-900 p-2"
                aria-label="Zoom in"
              >
                <ZoomIn className="h-5 w-5 flex-shrink-0" />
              </button>
            </div>
          </div>
        </div>

        {/* Save button */}
        <div className="p-4 flex justify-center border-t border-gray-300 h-[80px]">
          <Button
            onClick={handleSave}
            className="bg-[#478C5C] hover:bg-[#3a7049] text-white px-12 rounded-full"
          >
            Guardar
          </Button>
        </div>
      </div>
    </div>
  );
}
