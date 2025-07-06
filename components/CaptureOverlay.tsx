import React, { useRef, useEffect, useState } from 'react';
import { useTemplate } from '../context/TemplateContext';

const CaptureOverlay: React.FC = () => {
    const { cancelSnapping, processImageAndSuggest } = useTemplate();
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [isSelecting, setIsSelecting] = useState(false);
    const [startPos, setStartPos] = useState({ x: 0, y: 0 });
    const [endPos, setEndPos] = useState({ x: 0, y: 0 });
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const startCapture = async () => {
            try {
                const displayStream = await navigator.mediaDevices.getDisplayMedia({
                    video: { cursor: "always" } as any,
                    audio: false,
                });
                
                if (videoRef.current) {
                    videoRef.current.srcObject = displayStream;
                }
                setStream(displayStream);
            } catch (err) {
                console.error("Error starting screen capture:", err);
                setError("Permission to capture screen was denied.");
                setTimeout(cancelAndCleanup, 3000);
            }
        };
        startCapture();

        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                cancelAndCleanup();
            }
        };
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keyup', handleKeyUp);
            cancelAndCleanup();
        };
    }, []);
    
    const cancelAndCleanup = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        if (videoRef.current?.srcObject) {
            (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
        }
        cancelSnapping();
    };

    useEffect(() => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas || !stream) return;

        let animationFrameId: number;
        const drawFrame = () => {
            if (video.readyState >= 2) {
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    canvas.width = window.innerWidth;
                    canvas.height = window.innerHeight;
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

                    // Draw selection rectangle
                    if (isSelecting) {
                        ctx.fillStyle = 'rgba(0, 128, 255, 0.2)';
                        ctx.fillRect(startPos.x, startPos.y, endPos.x - startPos.x, endPos.y - startPos.y);
                        ctx.strokeStyle = '#0ea5e9';
                        ctx.lineWidth = 2;
                        ctx.strokeRect(startPos.x, startPos.y, endPos.x - startPos.x, endPos.y - startPos.y);
                    }
                }
            }
            animationFrameId = requestAnimationFrame(drawFrame);
        };
        drawFrame();

        return () => cancelAnimationFrame(animationFrameId);
    }, [stream, isSelecting, startPos, endPos]);

    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        setIsSelecting(true);
        setStartPos({ x: e.clientX, y: e.clientY });
        setEndPos({ x: e.clientX, y: e.clientY });
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (isSelecting) {
            setEndPos({ x: e.clientX, y: e.clientY });
        }
    };

    const handleMouseUp = () => {
        setIsSelecting(false);
        const video = videoRef.current;
        if (!video) return;

        const scaleX = video.videoWidth / video.clientWidth;
        const scaleY = video.videoHeight / video.clientHeight;

        const x1 = Math.min(startPos.x, endPos.x);
        const y1 = Math.min(startPos.y, endPos.y);
        const width = Math.abs(startPos.x - endPos.x);
        const height = Math.abs(startPos.y - endPos.y);

        if (width < 10 || height < 10) {
             cancelAndCleanup();
             return;
        }

        const cropCanvas = document.createElement('canvas');
        cropCanvas.width = width;
        cropCanvas.height = height;
        const cropCtx = cropCanvas.getContext('2d');

        if (cropCtx) {
            cropCtx.drawImage(
                video,
                x1, y1, width, height,
                0, 0, width, height
            );

            const imageDataUrl = cropCanvas.toDataURL('image/png');
            processImageAndSuggest(imageDataUrl);
        } else {
            cancelAndCleanup();
        }
    };

    const getInstruction = () => {
        if (error) {
            return { title: "Capture Failed", body: error };
        }
        if (!stream) {
            return { title: "Starting Capture...", body: "Please select a screen, window, or tab from the browser prompt." };
        }
        return { title: "Capture Mode Active", body: "Your selected content is mirrored here. Click and drag on this view to capture a region." };
    }

    const { title, body } = getInstruction();

    return (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm cursor-crosshair">
            <video ref={videoRef} autoPlay playsInline className="absolute w-full h-full top-0 left-0 object-cover" style={{ display: 'none' }} />
            <canvas
                ref={canvasRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                className="w-full h-full"
            />
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900/80 text-white p-6 rounded-lg shadow-xl text-center border border-slate-700 pointer-events-none">
                <h2 className={`text-2xl font-bold mb-2 ${error ? 'text-red-400' : ''}`}>{title}</h2>
                <p className="text-lg max-w-md">{body}</p>
                <p className="text-sm text-slate-400 mt-4">Press 'Escape' to cancel</p>
            </div>
        </div>
    );
};

export default CaptureOverlay;