// BDA Image Comparison Viewer Component
// Purpose: Enhanced side-by-side comparison with synchronized zoom/pan

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, RotateCcw, Maximize2 } from 'lucide-react';
import type { BdaImagery } from '@/lib/smartops/api/bda';
import { cn } from '@/lib/utils';

interface BDAImageComparisonViewerProps {
    preStrikeImagery?: BdaImagery;
    postStrikeImagery?: BdaImagery;
    syncZoom?: boolean;
}

export const BDAImageComparisonViewer: React.FC<BDAImageComparisonViewerProps> = ({
    preStrikeImagery,
    postStrikeImagery,
    syncZoom = true,
}) => {
    const preImageRef = useRef<HTMLImageElement>(null);
    const postImageRef = useRef<HTMLImageElement>(null);
    const preContainerRef = useRef<HTMLDivElement>(null);
    const postContainerRef = useRef<HTMLDivElement>(null);

    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);
    const [panStart, setPanStart] = useState<{ x: number; y: number } | null>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Synchronize zoom between both images
    const handleZoom = useCallback((delta: number) => {
        setZoom(prev => {
            const newZoom = Math.max(0.5, Math.min(5, prev + delta));
            return newZoom;
        });
    }, []);

    // Synchronize pan between both images
    const handlePanStart = useCallback((e: React.MouseEvent) => {
        setIsPanning(true);
        setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }, [pan]);

    const handlePanMove = useCallback((e: React.MouseEvent) => {
        if (!isPanning || !panStart) return;

        const newPan = {
            x: e.clientX - panStart.x,
            y: e.clientY - panStart.y,
        };
        setPan(newPan);
    }, [isPanning, panStart]);

    const handlePanEnd = useCallback(() => {
        setIsPanning(false);
        setPanStart(null);
    }, []);

    // Reset view
    const handleReset = useCallback(() => {
        setZoom(1);
        setPan({ x: 0, y: 0 });
    }, []);

    // Toggle fullscreen
    const handleFullscreen = useCallback(() => {
        if (!isFullscreen) {
            const container = preContainerRef.current?.parentElement;
            if (container?.requestFullscreen) {
                container.requestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
        setIsFullscreen(!isFullscreen);
    }, [isFullscreen]);

    // Handle fullscreen change
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    // Get image URL with API prefix if needed
    const getImageUrl = (url: string) => {
        return url.startsWith('/') ? `/api${url}` : url;
    };

    return (
        <Card className="bg-slate-900/40 border-slate-800">
            <CardHeader className="border-b border-slate-800/50 pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        Imagery Comparison
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleZoom(0.1)}
                            className="h-6 w-6 p-0"
                            title="Zoom In"
                        >
                            <ZoomIn size={12} />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleZoom(-0.1)}
                            className="h-6 w-6 p-0"
                            title="Zoom Out"
                        >
                            <ZoomOut size={12} />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleReset}
                            className="h-6 w-6 p-0"
                            title="Reset View"
                        >
                            <RotateCcw size={12} />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleFullscreen}
                            className="h-6 w-6 p-0"
                            title="Fullscreen"
                        >
                            <Maximize2 size={12} />
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="flex flex-col sm:flex-row h-[500px] relative overflow-hidden bg-slate-950">
                    {/* Pre-Strike Image */}
                    {preStrikeImagery && (
                        <div
                            ref={preContainerRef}
                            className={cn(
                                "flex-1 relative overflow-hidden border-r border-slate-800",
                                isPanning && "cursor-grabbing"
                            )}
                            onMouseDown={handlePanStart}
                            onMouseMove={handlePanMove}
                            onMouseUp={handlePanEnd}
                            onMouseLeave={handlePanEnd}
                        >
                            <span className="absolute top-2 left-2 text-[8px] font-black text-slate-600 uppercase bg-slate-950/80 px-1.5 py-0.5 rounded z-10">
                                PRE-STRIKE [T-24H]
                            </span>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <img
                                    ref={preImageRef}
                                    src={getImageUrl(preStrikeImagery.image_url)}
                                    alt="Pre-strike"
                                    className="max-w-none transition-transform duration-200"
                                    style={{
                                        transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
                                        transformOrigin: 'center center',
                                        cursor: isPanning ? 'grabbing' : 'grab',
                                    }}
                                    draggable={false}
                                />
                            </div>
                            {!isPanning && (
                                <div className="absolute bottom-2 left-2 text-[8px] text-slate-500">
                                    {Math.round(zoom * 100)}% | Drag to pan
                                </div>
                            )}
                        </div>
                    )}

                    {/* Post-Strike Image */}
                    {postStrikeImagery && (
                        <div
                            ref={postContainerRef}
                            className={cn(
                                "flex-1 relative overflow-hidden",
                                isPanning && "cursor-grabbing"
                            )}
                            onMouseDown={handlePanStart}
                            onMouseMove={handlePanMove}
                            onMouseUp={handlePanEnd}
                            onMouseLeave={handlePanEnd}
                        >
                            <span className="absolute top-2 left-2 text-[8px] font-black text-red-500 uppercase bg-slate-950/80 px-1.5 py-0.5 rounded z-10">
                                POST-STRIKE [T+2H]
                            </span>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <img
                                    ref={postImageRef}
                                    src={getImageUrl(postStrikeImagery.image_url)}
                                    alt="Post-strike"
                                    className="max-w-none transition-transform duration-200"
                                    style={{
                                        transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
                                        transformOrigin: 'center center',
                                        cursor: isPanning ? 'grabbing' : 'grab',
                                    }}
                                    draggable={false}
                                />
                            </div>
                            {!isPanning && (
                                <div className="absolute bottom-2 left-2 text-[8px] text-slate-500">
                                    {Math.round(zoom * 100)}% | Drag to pan
                                </div>
                            )}
                        </div>
                    )}

                    {/* Empty state */}
                    {!preStrikeImagery && !postStrikeImagery && (
                        <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">
                            No imagery available for comparison
                        </div>
                    )}
                </div>

                {/* Zoom indicator */}
                <div className="absolute bottom-4 right-4 bg-slate-950/80 px-2 py-1 rounded text-[8px] text-slate-400">
                    Zoom: {Math.round(zoom * 100)}% {syncZoom && '(Synced)'}
                </div>
            </CardContent>
        </Card>
    );
};
