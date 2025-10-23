

import React, { useRef, useImperativeHandle, forwardRef, useEffect, useState, useCallback, useMemo } from 'react';

interface BadgeProps {
    frameThickness: number;
    frameStartPosition: number;
    frameEndPosition: number;
    badgeText: string;
    badgeColor: string;
    badgeTextColor: string;
    fontSize: number;
    letterSpacing: number;
    textPlacement: number;
    backgroundColor: string;
}

interface ImageCanvasProps {
  imageUrl: string;
  showBadge: boolean;
  scale: number;
  offset: { x: number; y: number; };
  onOffsetChange: (offset: { x: number; y: number; }) => void;
  onCommit?: () => void;
  badgeProps: BadgeProps;
  aspectRatio?: string;
}

type Point = { x: number, y: number };

// Helper to convert hex color to rgba, needed for gradient
const hexToRgba = (hex: string, alpha: number): string => {
    let r = 0, g = 0, b = 0;
    if (hex.length === 4) {
        r = parseInt(hex[1] + hex[1], 16);
        g = parseInt(hex[2] + hex[2], 16);
        b = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length === 7) {
        r = parseInt(hex.substring(1, 3), 16);
        g = parseInt(hex.substring(3, 5), 16);
        b = parseInt(hex.substring(5, 7), 16);
    }
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};


const ImageCanvas = forwardRef<{ downloadImage: () => void }, ImageCanvasProps>(({ 
    imageUrl, 
    showBadge,
    scale,
    offset,
    onOffsetChange,
    onCommit,
    badgeProps,
    aspectRatio = '1:1',
}, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imageRef = useRef<HTMLImageElement | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStartPoint, setDragStartPoint] = useState<Point>({ x: 0, y: 0 });

    const aspectRatioValue = useMemo(() => {
        if (!aspectRatio) return 1;
        const parts = aspectRatio.split(':');
        if (parts.length === 2) {
            const w = parseFloat(parts[0]);
            const h = parseFloat(parts[1]);
            if (h > 0 && w > 0) return w / h;
        }
        return 1;
    }, [aspectRatio]);

    const getCanvasCoordinates = (event: React.MouseEvent | React.TouchEvent): Point => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        
        // Scale mouse/touch coordinates to canvas resolution
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        if ('touches' in event.nativeEvent) {
             return {
                x: (event.nativeEvent.touches[0].clientX - rect.left) * scaleX,
                y: (event.nativeEvent.touches[0].clientY - rect.top) * scaleY,
            };
        }
        return {
            x: event.nativeEvent.offsetX * scaleX,
            y: event.nativeEvent.offsetY * scaleY
        };
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setDragStartPoint(getCanvasCoordinates(e));
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        const currentPoint = getCanvasCoordinates(e);
        const newOffset = {
            x: offset.x + (currentPoint.x - dragStartPoint.x),
            y: offset.y + (currentPoint.y - dragStartPoint.y),
        };
        onOffsetChange(newOffset);
        setDragStartPoint(currentPoint);
    };

    const handleMouseUp = () => {
        if (isDragging) {
            setIsDragging(false);
            onCommit?.();
        }
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        if (e.touches.length === 1) {
            setIsDragging(true);
            setDragStartPoint(getCanvasCoordinates(e));
        }
    };
    
    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isDragging || e.touches.length !== 1) return;
        e.preventDefault();
        const currentPoint = getCanvasCoordinates(e);
        const newOffset = {
            x: offset.x + (currentPoint.x - dragStartPoint.x),
            y: offset.y + (currentPoint.y - dragStartPoint.y),
        };
        onOffsetChange(newOffset);
        setDragStartPoint(currentPoint);
    };

    const drawCanvas = useCallback((forDownload = false) => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        const img = imageRef.current;
        if (!canvas || !ctx || !img) return;

        const { width, height } = canvas;
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(width, height) / 2;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // For downloads, create a white background for the whole square
        if (forDownload) {
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, width, height);
        }
        
        // --- Draw Circular Image Area ---
        ctx.save();
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.clip(); // Clip everything to a circle from now on

        // Draw the background color inside the circle
        ctx.fillStyle = badgeProps.backgroundColor;
        ctx.fillRect(0, 0, width, height);

        // --- Draw Image ---
        ctx.save();
        // Apply transformations
        ctx.translate(centerX + offset.x, centerY + offset.y);
        ctx.scale(scale, scale);
        ctx.drawImage(img, -img.width / 2, -img.height / 2);
        ctx.restore(); // Restore from image transformation
        
        // --- Draw Badge ---
        if (showBadge) {
            const {
                frameThickness,
                frameStartPosition,
                frameEndPosition,
                badgeColor,
                badgeText,
                badgeTextColor,
                fontSize,
                letterSpacing,
                textPlacement,
            } = badgeProps;

            const arcRadius = radius - frameThickness / 2;

            const startAngleRad = (frameStartPosition / 100) * 2 * Math.PI;
            let endAngleRad = (frameEndPosition / 100) * 2 * Math.PI;

            if (endAngleRad <= startAngleRad) {
                endAngleRad += 2 * Math.PI;
            }

            const totalArcAngle = endAngleRad - startAngleRad;
            
            // 1. Draw badge arc with gradient fade
            const fadePortion = 0.15; // 15% of the arc at each end will be faded
            const steps = 150;

            ctx.lineCap = 'butt';
            for (let i = 0; i < steps; i++) {
                const t = i / (steps - 1);
                const currentAngle = startAngleRad + t * totalArcAngle;

                let alpha = 1.0;
                if (t < fadePortion) {
                    alpha = t / fadePortion;
                } else if (t > 1 - fadePortion) {
                    alpha = (1 - t) / fadePortion;
                }
                alpha = Math.max(0, Math.min(1, alpha * alpha)); // Ease the fade

                ctx.beginPath();
                ctx.arc(centerX, centerY, arcRadius, currentAngle, currentAngle + totalArcAngle / steps + 0.005);
                ctx.lineWidth = frameThickness;
                ctx.strokeStyle = hexToRgba(badgeColor, alpha);
                ctx.stroke();
            }

            // 2. Draw text on the arc
            ctx.fillStyle = badgeTextColor;
            ctx.font = `bold ${fontSize}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            const textRadius = arcRadius;
            
            // Estimate total angular width of the text
            let totalTextAngleWidth = 0;
            for(let i=0; i < badgeText.length; i++) {
                const charWidth = ctx.measureText(badgeText[i]).width;
                totalTextAngleWidth += (charWidth / textRadius) + (letterSpacing / textRadius);
            }
            
            const badgeCenterAngle = startAngleRad + totalArcAngle / 2;
            const textPlacementAngle = ((textPlacement - 100) / 100) * (totalArcAngle - totalTextAngleWidth);
            let currentAngleForChar = badgeCenterAngle - totalTextAngleWidth / 2 + textPlacementAngle;

            for (let i = 0; i < badgeText.length; i++) {
                const char = badgeText[i];
                const charWidth = ctx.measureText(char).width;
                const charAngleWidth = charWidth / textRadius;
                const angleForThisChar = currentAngleForChar + charAngleWidth / 2;

                ctx.save();
                ctx.translate(
                    centerX + textRadius * Math.cos(angleForThisChar),
                    centerY + textRadius * Math.sin(angleForThisChar)
                );
                ctx.rotate(angleForThisChar + Math.PI / 2);
                ctx.fillText(char, 0, 0);
                ctx.restore();
                
                currentAngleForChar += charAngleWidth + (letterSpacing / textRadius);
            }
        }
        
        // Restore from clipping
        ctx.restore();

    }, [badgeProps, offset.x, offset.y, scale, showBadge, aspectRatioValue]);
    
    useEffect(() => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = imageUrl;
        img.onload = () => {
            imageRef.current = img;
            drawCanvas();
        };
    }, [imageUrl, drawCanvas]);

    useEffect(() => {
        drawCanvas();
    }, [drawCanvas]);

    useImperativeHandle(ref, () => ({
        downloadImage: () => {
            const canvas = canvasRef.current;
            if (canvas) {
                // Redraw with white background for downloading
                drawCanvas(true);
                
                const link = document.createElement('a');
                link.download = 'linkedin-profile.png';
                link.href = canvas.toDataURL('image/png');
                link.click();
                
                // Redraw the canvas with the preview background
                drawCanvas(false);
            }
        },
    }));

    const canvasWidth = 1000;
    const canvasHeight = canvasWidth / aspectRatioValue;

    return (
        <canvas 
            ref={canvasRef} 
            width={canvasWidth} 
            height={canvasHeight}
            className="w-full h-full rounded-lg cursor-grab active:cursor-grabbing"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleMouseUp}
            style={{ touchAction: 'none' }}
        />
    );
});

export default ImageCanvas;
