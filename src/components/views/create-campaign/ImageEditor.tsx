"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { X, RotateCw } from "lucide-react";

interface ImageEditorProps {
  imageUrl: string;
  onSave: (editedUrl: string) => void;
  onCancel: () => void;
}

interface Position {
  x: number;
  y: number;
}

interface Size {
  width: number;
  height: number;
}

type ResizeMode = "topLeft" | "topRight" | "bottomLeft" | "bottomRight" | null;

export function ImageEditor({ imageUrl, onSave, onCancel }: ImageEditorProps) {
  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState(1);
  const [modalSize, setModalSize] = useState({ width: 800, height: 600 });

  // Refs for current state to avoid stale closures during drag operations
  const cropPositionRef = useRef<Position>({ x: 0, y: 0 });
  const cropSizeRef = useRef<Size>({ width: 0, height: 0 });
  const isDraggingRef = useRef(false);
  const isResizingRef = useRef(false);
  const resizeModeRef = useRef<ResizeMode>(null);
  const interactionStartPosRef = useRef<Position>({ x: 0, y: 0 });
  const resizeStartSizeRef = useRef<Size>({ width: 0, height: 0 });
  const dragOffsetRef = useRef<Position>({ x: 0, y: 0 });
  const animationFrameRef = useRef<number | null>(null);

  // React state for controlled components, updated less frequently
  const [cropPosition, setCropPosition] = useState<Position>({ x: 0, y: 0 });
  const [cropSize, setCropSize] = useState<Size>({ width: 0, height: 0 });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cropCanvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Sync React state to refs (only changes when state is set, not during interactions)
  useEffect(() => {
    cropPositionRef.current = cropPosition;
  }, [cropPosition]);

  useEffect(() => {
    cropSizeRef.current = cropSize;
  }, [cropSize]);

  // Clean up any animation frames on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Load the image and set up initial dimensions
  useEffect(() => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imgRef.current = img;
      setImageLoaded(true);

      // Calculate modal size based on image dimensions
      const viewportWidth = window.innerWidth * 0.9;
      const viewportHeight = window.innerHeight * 0.9;

      const imgAspectRatio = img.width / img.height;
      let width = Math.min(img.width, viewportWidth);
      let height = width / imgAspectRatio;

      if (height > viewportHeight) {
        height = viewportHeight;
        width = height * imgAspectRatio;
      }

      // Add space for header and controls
      height += 180;

      setModalSize({
        width: Math.max(width, 400),
        height: Math.max(height, 500),
      });

      // Initialize crop size and position after container is rendered
      setTimeout(() => {
        if (containerRef.current) {
          const containerWidth = containerRef.current.clientWidth;
          const containerHeight = containerRef.current.clientHeight;

          // Set initial crop size to be square, 70% of the smaller dimension
          const initialSize = Math.min(containerWidth, containerHeight) * 0.7;

          // Center the crop window
          const initialX = (containerWidth - initialSize) / 2;
          const initialY = (containerHeight - initialSize) / 2;

          // Set both state and ref at initialization
          setCropSize({ width: initialSize, height: initialSize });
          setCropPosition({ x: initialX, y: initialY });
          cropSizeRef.current = { width: initialSize, height: initialSize };
          cropPositionRef.current = { x: initialX, y: initialY };

          // Draw initial view
          requestAnimationFrame(() => {
            drawMainCanvas();
            drawCropCanvas();
          });
        }
      }, 100);
    };
    img.src = imageUrl;
  }, [imageUrl]);

  // Draw canvases when image loads, rotation, or scale changes
  useEffect(() => {
    if (imageLoaded) {
      drawMainCanvas();
      drawCropCanvas();
    }
  }, [imageLoaded, rotation, scale, modalSize]);

  // Main canvas drawing function
  const drawMainCanvas = useCallback(() => {
    if (!canvasRef.current || !imgRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = imgRef.current;
    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;

    // Set canvas size to match container
    canvas.width = containerWidth;
    canvas.height = containerHeight;

    // Clear canvas and set background
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Center and draw the image with current rotation and scale
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Draw the base image
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(scale, scale);
    ctx.drawImage(img, -img.width / 2, -img.height / 2, img.width, img.height);
    ctx.restore();

    // Get current crop values from refs for immediate drawing
    const cp = cropPositionRef.current;
    const cs = cropSizeRef.current;

    // Make sure the crop rectangle is visible
    // If we've zoomed in and the crop area is outside view, bring it back in view
    const maxX = containerWidth - cs.width;
    const maxY = containerHeight - cs.height;

    if (cp.x > maxX) {
      cropPositionRef.current.x = Math.max(0, maxX);
    }
    if (cp.y > maxY) {
      cropPositionRef.current.y = Math.max(0, maxY);
    }

    // Create semi-transparent overlay with hole for crop region
    ctx.save();
    ctx.beginPath();
    // Outer rectangle (full canvas)
    ctx.rect(0, 0, canvas.width, canvas.height);
    // Inner rectangle (hole) for crop area
    ctx.rect(cp.x, cp.y, cs.width, cs.height);
    // Fill with semi-transparent black (everything except crop area)
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fill("evenodd");
    ctx.restore();

    // Draw crop border
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.strokeRect(cp.x, cp.y, cs.width, cs.height);

    // Draw resize handles at corners
    const handleSize = 10;
    ctx.fillStyle = "white";

    // Draw all four corner handles
    const corners = [
      { x: cp.x - handleSize / 2, y: cp.y - handleSize / 2 }, // Top-left
      { x: cp.x + cs.width - handleSize / 2, y: cp.y - handleSize / 2 }, // Top-right
      { x: cp.x - handleSize / 2, y: cp.y + cs.height - handleSize / 2 }, // Bottom-left
      {
        x: cp.x + cs.width - handleSize / 2,
        y: cp.y + cs.height - handleSize / 2,
      }, // Bottom-right
    ];

    corners.forEach((corner) => {
      ctx.fillRect(corner.x, corner.y, handleSize, handleSize);
    });
  }, [rotation, scale]);

  // Draw crop canvas (final output)
  const drawCropCanvas = useCallback(() => {
    if (!cropCanvasRef.current || !canvasRef.current || !imgRef.current) return;

    const cropCanvas = cropCanvasRef.current;
    const mainCanvas = canvasRef.current;
    const img = imgRef.current;
    const cp = cropPositionRef.current;
    const cs = cropSizeRef.current;

    // Set crop canvas size to match crop area
    cropCanvas.width = cs.width;
    cropCanvas.height = cs.height;

    const cropCtx = cropCanvas.getContext("2d");
    if (!cropCtx) return;

    // Clear the crop canvas
    cropCtx.clearRect(0, 0, cs.width, cs.height);

    try {
      // Create a temporary canvas that matches the size of the main canvas
      const tempCanvas = document.createElement("canvas");
      const tempCtx = tempCanvas.getContext("2d");
      if (!tempCtx) return;

      // Match the temp canvas size to the main canvas
      tempCanvas.width = mainCanvas.width;
      tempCanvas.height = mainCanvas.height;

      // Fill with black background (optional, helps visualize any issues)
      tempCtx.fillStyle = "#000000";
      tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

      // Draw the base image with current rotation and scale
      const centerX = tempCanvas.width / 2;
      const centerY = tempCanvas.height / 2;

      tempCtx.save();
      tempCtx.translate(centerX, centerY);
      tempCtx.rotate((rotation * Math.PI) / 180);
      tempCtx.scale(scale, scale);
      tempCtx.drawImage(
        img,
        -img.width / 2,
        -img.height / 2,
        img.width,
        img.height
      );
      tempCtx.restore();

      // Draw only the cropped portion to the final canvas
      cropCtx.drawImage(
        tempCanvas,
        cp.x,
        cp.y,
        cs.width,
        cs.height, // Source rectangle
        0,
        0,
        cs.width,
        cs.height // Destination rectangle
      );
    } catch (error) {
      console.error("Error drawing crop:", error);
      // Fallback if drawing fails
      cropCtx.fillStyle = "white";
      cropCtx.fillRect(0, 0, cs.width, cs.height);
    }
  }, [rotation, scale]);

  // Calculate if a point is near a corner handle
  const getResizeMode = (x: number, y: number): ResizeMode => {
    const cp = cropPositionRef.current;
    const cs = cropSizeRef.current;
    const handleSize = 20; // Larger hit area for better UX

    // Check all four corners with larger hit areas
    if (
      x >= cp.x - handleSize &&
      x <= cp.x + handleSize &&
      y >= cp.y - handleSize &&
      y <= cp.y + handleSize
    ) {
      return "topLeft";
    }

    if (
      x >= cp.x + cs.width - handleSize &&
      x <= cp.x + cs.width + handleSize &&
      y >= cp.y - handleSize &&
      y <= cp.y + handleSize
    ) {
      return "topRight";
    }

    if (
      x >= cp.x - handleSize &&
      x <= cp.x + handleSize &&
      y >= cp.y + cs.height - handleSize &&
      y <= cp.y + cs.height + handleSize
    ) {
      return "bottomLeft";
    }

    if (
      x >= cp.x + cs.width - handleSize &&
      x <= cp.x + cs.width + handleSize &&
      y >= cp.y + cs.height - handleSize &&
      y <= cp.y + cs.height + handleSize
    ) {
      return "bottomRight";
    }

    return null;
  };

  // Check if a point is inside the crop area (excluding corners)
  const isInsideCropArea = (x: number, y: number): boolean => {
    const cp = cropPositionRef.current;
    const cs = cropSizeRef.current;
    const handleSize = 20;

    return (
      x >= cp.x + handleSize &&
      x <= cp.x + cs.width - handleSize &&
      y >= cp.y + handleSize &&
      y <= cp.y + cs.height - handleSize
    );
  };

  // Mouse down handler - start dragging or resizing
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check which action to perform
    const resizeMode = getResizeMode(x, y);

    if (resizeMode) {
      // Starting resize operation
      isResizingRef.current = true;
      resizeModeRef.current = resizeMode;
      interactionStartPosRef.current = { x, y };
      resizeStartSizeRef.current = { ...cropSizeRef.current };

      // Add global event listeners
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    } else if (isInsideCropArea(x, y)) {
      // Starting drag operation
      isDraggingRef.current = true;
      interactionStartPosRef.current = { x, y };
      dragOffsetRef.current = {
        x: x - cropPositionRef.current.x,
        y: y - cropPositionRef.current.y,
      };

      // Add global event listeners
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    e.preventDefault();
  };

  // Touch start handler - for mobile support
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !containerRef.current || e.touches.length !== 1)
      return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    // Check which action to perform
    const resizeMode = getResizeMode(x, y);

    if (resizeMode) {
      // Starting resize operation
      isResizingRef.current = true;
      resizeModeRef.current = resizeMode;
      interactionStartPosRef.current = { x, y };
      resizeStartSizeRef.current = { ...cropSizeRef.current };

      // Add touch event listeners
      document.addEventListener("touchmove", handleTouchMove, {
        passive: false,
      });
      document.addEventListener("touchend", handleTouchEnd);
      document.addEventListener("touchcancel", handleTouchEnd);
    } else if (isInsideCropArea(x, y)) {
      // Starting drag operation
      isDraggingRef.current = true;
      interactionStartPosRef.current = { x, y };
      dragOffsetRef.current = {
        x: x - cropPositionRef.current.x,
        y: y - cropPositionRef.current.y,
      };

      // Add touch event listeners
      document.addEventListener("touchmove", handleTouchMove, {
        passive: false,
      });
      document.addEventListener("touchend", handleTouchEnd);
      document.addEventListener("touchcancel", handleTouchEnd);
    }

    e.preventDefault();
  };

  // Touch move handler
  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!canvasRef.current || !containerRef.current || e.touches.length !== 1)
      return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    // Only process if we're in the middle of an interaction
    if (isDraggingRef.current) {
      handleDrag(x, y);
    } else if (isResizingRef.current) {
      handleResize(x, y);
    }

    e.preventDefault();
  }, []);

  // Touch end handler
  const handleTouchEnd = useCallback(() => {
    // End any ongoing interactions
    isDraggingRef.current = false;
    isResizingRef.current = false;
    resizeModeRef.current = null;

    // Remove global touch event listeners
    document.removeEventListener("touchmove", handleTouchMove);
    document.removeEventListener("touchend", handleTouchEnd);
    document.removeEventListener("touchcancel", handleTouchEnd);

    // Sync React state with current ref values
    setCropPosition({ ...cropPositionRef.current });
    setCropSize({ ...cropSizeRef.current });
  }, []);

  // Mouse move handler - unified for both dragging and resizing
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Only process if we're in the middle of an interaction
    if (isDraggingRef.current) {
      handleDrag(x, y);
    } else if (isResizingRef.current) {
      handleResize(x, y);
    }

    e.preventDefault();
  }, []);

  // Handler for dragging operation
  const handleDrag = (x: number, y: number) => {
    if (!containerRef.current) return;

    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;

    // Calculate new position (direct position from mouse coordinates, accounting for offset)
    let newX = x - dragOffsetRef.current.x;
    let newY = y - dragOffsetRef.current.y;

    // Apply constraints to keep crop window within container at current zoom level
    newX = Math.max(
      0,
      Math.min(newX, containerWidth - cropSizeRef.current.width)
    );
    newY = Math.max(
      0,
      Math.min(newY, containerHeight - cropSizeRef.current.height)
    );

    // Update ref immediately for responsive drawing
    cropPositionRef.current = { x: newX, y: newY };

    // Use requestAnimationFrame for smooth visual updates
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    animationFrameRef.current = requestAnimationFrame(() => {
      drawMainCanvas();
      drawCropCanvas();
    });
  };

  // Handler for resize operation
  const handleResize = (x: number, y: number) => {
    if (!containerRef.current || !resizeModeRef.current) return;

    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;

    // Get the original positions and sizes
    const startPos = { ...cropPositionRef.current };
    const startSize = { ...resizeStartSizeRef.current };

    // Calculate the current mouse position relative to the original interaction start point
    const deltaX = x - interactionStartPosRef.current.x;
    const deltaY = y - interactionStartPosRef.current.y;

    // Initialize new values with current values
    let newX = startPos.x;
    let newY = startPos.y;
    let newWidth = startSize.width;
    let newHeight = startSize.height;

    // Apply different calculations based on which corner is being dragged
    switch (resizeModeRef.current) {
      case "bottomRight":
        // Bottom-right: adjust width and height directly
        newWidth = Math.max(50, startSize.width + deltaX);
        newHeight = Math.max(50, startSize.height + deltaY);
        break;

      case "bottomLeft":
        // Bottom-left: adjust width (inversely) and height
        newWidth = Math.max(50, startSize.width - deltaX);
        // Calculate new X to maintain the right edge position
        newX = startPos.x + startSize.width - newWidth;
        newHeight = Math.max(50, startSize.height + deltaY);
        break;

      case "topRight":
        // Top-right: adjust width and height (inversely)
        newWidth = Math.max(50, startSize.width + deltaX);
        newHeight = Math.max(50, startSize.height - deltaY);
        // Calculate new Y to maintain the bottom edge position
        newY = startPos.y + startSize.height - newHeight;
        break;

      case "topLeft":
        // Top-left: adjust width (inversely) and height (inversely)
        newWidth = Math.max(50, startSize.width - deltaX);
        newHeight = Math.max(50, startSize.height - deltaY);
        // Calculate new positions to maintain the bottom-right corner
        newX = startPos.x + startSize.width - newWidth;
        newY = startPos.y + startSize.height - newHeight;
        break;
    }

    // Enforce minimum size
    const minSize = 50;
    if (newWidth < minSize) {
      // When at minimum width, adjust X position based on which corner is being dragged
      if (
        resizeModeRef.current === "topLeft" ||
        resizeModeRef.current === "bottomLeft"
      ) {
        newX = startPos.x + startSize.width - minSize;
      }
      newWidth = minSize;
    }

    if (newHeight < minSize) {
      // When at minimum height, adjust Y position based on which corner is being dragged
      if (
        resizeModeRef.current === "topLeft" ||
        resizeModeRef.current === "topRight"
      ) {
        newY = startPos.y + startSize.height - minSize;
      }
      newHeight = minSize;
    }

    // Apply container boundary constraints
    if (newX < 0) {
      // If X is outside the left edge, adjust width accordingly
      if (
        resizeModeRef.current === "topLeft" ||
        resizeModeRef.current === "bottomLeft"
      ) {
        newWidth = startPos.x + startSize.width; // Set width relative to right edge
      }
      newX = 0;
    }

    if (newY < 0) {
      // If Y is outside the top edge, adjust height accordingly
      if (
        resizeModeRef.current === "topLeft" ||
        resizeModeRef.current === "topRight"
      ) {
        newHeight = startPos.y + startSize.height; // Set height relative to bottom edge
      }
      newY = 0;
    }

    // Check right and bottom boundaries
    if (newX + newWidth > containerWidth) {
      // If right edge is outside, adjust width
      newWidth = containerWidth - newX;
    }

    if (newY + newHeight > containerHeight) {
      // If bottom edge is outside, adjust height
      newHeight = containerHeight - newY;
    }

    // Further constraint enforcement if needed (in case above adjustments pushed dimensions below minimum)
    newWidth = Math.max(minSize, newWidth);
    newHeight = Math.max(minSize, newHeight);

    // Update refs to reflect the new crop area
    cropPositionRef.current = { x: newX, y: newY };
    cropSizeRef.current = { width: newWidth, height: newHeight };

    // Use requestAnimationFrame for smooth updates
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    animationFrameRef.current = requestAnimationFrame(() => {
      drawMainCanvas();
      drawCropCanvas();
    });
  };

  // Mouse up handler - end interactions and sync state
  const handleMouseUp = useCallback(() => {
    // End any ongoing interactions
    isDraggingRef.current = false;
    isResizingRef.current = false;
    resizeModeRef.current = null;

    // Remove global event listeners
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);

    // Sync React state with current ref values (only after interaction ends)
    setCropPosition({ ...cropPositionRef.current });
    setCropSize({ ...cropSizeRef.current });
  }, [handleMouseMove]);

  // Update cursor based on mouse position
  const handleCursorUpdate = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || isResizingRef.current || isDraggingRef.current)
      return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check position for cursor style
    const resizeMode = getResizeMode(x, y);

    // Set appropriate cursor
    if (resizeMode === "bottomRight" || resizeMode === "topLeft") {
      canvas.style.cursor = "nwse-resize";
    } else if (resizeMode === "bottomLeft" || resizeMode === "topRight") {
      canvas.style.cursor = "nesw-resize";
    } else if (isInsideCropArea(x, y)) {
      canvas.style.cursor = "move";
    } else {
      canvas.style.cursor = "default";
    }
  };

  // Rotation and zoom controls
  const handleRotateRight = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleZoomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newScale = parseFloat(e.target.value);

    // Update the scale state
    setScale(newScale);

    // Redraw with new scale - the main canvas will be redrawn through the useEffect
    // which should correctly keep crop area within bounds

    // If there's already a request waiting, cancel it
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    // Schedule a redraw at the new scale
    animationFrameRef.current = requestAnimationFrame(() => {
      if (cropPositionRef.current && containerRef.current) {
        // Ensure crop is still in bounds after scale change
        const containerWidth = containerRef.current.clientWidth;
        const containerHeight = containerRef.current.clientHeight;

        // Check if crop needs to be adjusted
        const cp = cropPositionRef.current;
        const cs = cropSizeRef.current;

        // Make sure it's not outside the bounds
        const maxX = containerWidth - cs.width;
        const maxY = containerHeight - cs.height;

        let adjustX = cp.x;
        let adjustY = cp.y;

        if (cp.x > maxX) {
          adjustX = Math.max(0, maxX);
        }
        if (cp.y > maxY) {
          adjustY = Math.max(0, maxY);
        }

        // Update position if needed
        if (adjustX !== cp.x || adjustY !== cp.y) {
          cropPositionRef.current = { x: adjustX, y: adjustY };
          setCropPosition({ x: adjustX, y: adjustY });
        }
      }

      // Redraw both canvases
      drawMainCanvas();
      drawCropCanvas();
    });
  };

  const handleZoomIn = () => {
    const newScale = Math.min(scale + 0.1, 2);
    setScale(newScale);
  };

  const handleZoomOut = () => {
    const newScale = Math.max(scale - 0.1, 0.5);
    setScale(newScale);
  };

  // Save the cropped image
  const handleSave = () => {
    if (!cropCanvasRef.current || !imgRef.current) return;

    try {
      // Get current crop size and position
      const cs = cropSizeRef.current;
      const cp = cropPositionRef.current;

      // Create a high-quality output canvas
      const outputCanvas = document.createElement("canvas");
      const outputCtx = outputCanvas.getContext("2d");
      if (!outputCtx) return;

      // Set output dimensions to match crop size
      outputCanvas.width = cs.width;
      outputCanvas.height = cs.height;

      // Create a temporary canvas for the full transformed image
      const tempCanvas = document.createElement("canvas");
      const tempCtx = tempCanvas.getContext("2d");
      if (!tempCtx) return;

      // Calculate a size large enough to contain the entire rotated/scaled image
      const img = imgRef.current;
      const maxSize = Math.ceil(
        Math.sqrt(2) * Math.max(img.width, img.height) * scale
      );
      tempCanvas.width = maxSize;
      tempCanvas.height = maxSize;

      // Draw the transformed image at the center of the temp canvas
      const centerX = maxSize / 2;
      const centerY = maxSize / 2;

      tempCtx.save();
      tempCtx.translate(centerX, centerY);
      tempCtx.rotate((rotation * Math.PI) / 180);
      tempCtx.scale(scale, scale);
      tempCtx.drawImage(
        img,
        -img.width / 2,
        -img.height / 2,
        img.width,
        img.height
      );
      tempCtx.restore();

      // Calculate the display scaling ratio
      const canvasRect = canvasRef.current?.getBoundingClientRect();
      if (!canvasRect) return;

      // Calculate the center of the display canvas
      const displayCenterX = canvasRect.width / 2;
      const displayCenterY = canvasRect.height / 2;

      // Map the crop coordinates from display space to the temp canvas space
      const tempScale = maxSize / Math.min(canvasRect.width, canvasRect.height);
      const sourceX = tempScale * (cp.x - displayCenterX) + centerX;
      const sourceY = tempScale * (cp.y - displayCenterY) + centerY;
      const sourceWidth = tempScale * cs.width;
      const sourceHeight = tempScale * cs.height;

      // Draw the cropped portion to the output canvas
      outputCtx.drawImage(
        tempCanvas,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        0,
        0,
        cs.width,
        cs.height
      );

      // Get the image data URL and pass it to the save callback
      const editedUrl = outputCanvas.toDataURL("image/jpeg", 0.95);
      onSave(editedUrl);
    } catch (error) {
      console.error("Error saving image:", error);

      // Fallback to the current crop canvas if the advanced method fails
      try {
        drawCropCanvas(); // Ensure the crop canvas is up-to-date
        const editedUrl = cropCanvasRef.current.toDataURL("image/jpeg", 0.9);
        onSave(editedUrl);
      } catch (e) {
        console.error("Fallback save also failed:", e);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div
        className="bg-white shadow-lg flex flex-col"
        style={{
          width: `${modalSize.width}px`,
          height: `${modalSize.height}px`,
          maxWidth: "90vw",
          maxHeight: "90vh",
        }}
      >
        <div className="bg-[#f5f7e9] py-3 px-6 flex justify-between items-center">
          <h2 className="text-xl font-medium text-[#2c6e49]">Editar foto</h2>
          <button
            onClick={onCancel}
            className="text-[#478C5C] hover:text-[#2c6e49]"
          >
            <X size={24} />
          </button>
        </div>

        <div
          className="flex-1 bg-black flex flex-col overflow-hidden"
          ref={containerRef}
        >
          <div className="flex-1 flex justify-center items-center relative overflow-hidden">
            <canvas
              ref={canvasRef}
              className="w-full h-full"
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
              onMouseMove={handleCursorUpdate}
            />
            <canvas ref={cropCanvasRef} className="hidden" />
          </div>
        </div>

        <div className="bg-white border-t border-gray-200">
          <div className="grid grid-cols-2 divide-x divide-black border-b border-black">
            <div className="flex items-center justify-center h-16">
              <Button
                variant="ghost"
                className="flex items-center gap-1 bg-white hover:bg-white h-full px-2"
                onClick={handleRotateRight}
              >
                <RotateCw className="h-4 w-4 text-[#478C5C]" />
                <span className="text-[#478C5C] font-medium">Girar</span>
              </Button>
            </div>

            <div className="flex items-center justify-between px-4 h-16">
              <button
                className="text-gray-700 flex-shrink-0"
                onClick={handleZoomOut}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </button>
              <div className="w-[75%] flex items-center justify-center">
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={scale}
                  onChange={handleZoomChange}
                  className="w-full h-1 appearance-none cursor-pointer bg-gray-300 rounded-sm relative [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-black [&::-webkit-slider-thumb]:relative [&::-webkit-slider-thumb]:z-10 [&::-webkit-slider-thumb]:translate-y-[-2px] [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-black [&::-moz-range-thumb]:border-0 [&::-webkit-slider-runnable-track]:bg-transparent [&::-webkit-slider-runnable-track]:h-1 [&::-moz-range-track]:bg-transparent [&::-moz-range-track]:h-1"
                  style={{
                    background: `linear-gradient(to right, black 0%, black ${
                      ((scale - 0.5) / 1.5) * 100
                    }%, #d1d5db ${((scale - 0.5) / 1.5) * 100}%, #d1d5db 100%)`,
                  }}
                />
              </div>
              <button
                className="text-gray-700 flex-shrink-0"
                onClick={handleZoomIn}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </button>
            </div>
          </div>

          <div className="flex justify-center py-4">
            <Button
              className="bg-[#478C5C] text-white hover:bg-[#3a7049] w-64 rounded-full"
              onClick={handleSave}
            >
              Guardar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
