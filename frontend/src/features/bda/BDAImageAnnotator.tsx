// BDA Image Annotator Component
// Purpose: Allow users to annotate BDA imagery with shapes and text

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { 
    Square, 
    Circle, 
    Minus, 
    Type, 
    Save, 
    RotateCcw, 
    Trash2,
    ZoomIn,
    ZoomOut,
    Move
} from 'lucide-react';
import { BdaApi, type BdaImagery } from '@/lib/mshnctrl/api/bda';
import { cn } from '@/lib/utils';

export type AnnotationType = 'rectangle' | 'circle' | 'line' | 'text';
export type AnnotationTool = AnnotationType | 'select' | 'pan';

export interface Annotation {
    id: string;
    type: AnnotationType;
    x: number;
    y: number;
    width?: number;
    height?: number;
    radius?: number;
    x2?: number;
    y2?: number;
    text?: string;
    color: string;
    label?: string;
}

interface BDAImageAnnotatorProps {
    imagery: BdaImagery;
    onSave?: (annotations: Annotation[]) => void;
    readOnly?: boolean;
}

export const BDAImageAnnotator: React.FC<BDAImageAnnotatorProps> = ({ 
    imagery, 
    onSave,
    readOnly = false 
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    
    const [tool, setTool] = useState<AnnotationTool>('select');
    const [annotations, setAnnotations] = useState<Annotation[]>([]);
    const [selectedAnnotation, setSelectedAnnotation] = useState<string | null>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
    const [currentAnnotation, setCurrentAnnotation] = useState<Partial<Annotation> | null>(null);
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);
    const [panStart, setPanStart] = useState<{ x: number; y: number } | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Load existing annotations
    useEffect(() => {
        if (imagery.annotations_json) {
            try {
                const parsed = JSON.parse(imagery.annotations_json);
                setAnnotations(Array.isArray(parsed) ? parsed : []);
            } catch (e) {
                console.error('Failed to parse annotations:', e);
                setAnnotations([]);
            }
        }
    }, [imagery.annotations_json]);

    // Get canvas coordinates from mouse event
    const getCanvasCoordinates = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        
        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) / zoom - pan.x;
        const y = (e.clientY - rect.top) / zoom - pan.y;
        return { x, y };
    }, [zoom, pan]);

    // Draw all annotations on canvas
    const drawAnnotations = useCallback(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Set canvas transform for zoom and pan
        ctx.save();
        ctx.scale(zoom, zoom);
        ctx.translate(pan.x, pan.y);

        annotations.forEach((ann) => {
            ctx.strokeStyle = ann.color;
            ctx.fillStyle = ann.color;
            ctx.lineWidth = 2;
            ctx.setLineDash([]);

            if (ann.id === selectedAnnotation) {
                ctx.strokeStyle = '#3b82f6';
                ctx.lineWidth = 3;
            }

            switch (ann.type) {
                case 'rectangle':
                    if (ann.width && ann.height) {
                        ctx.strokeRect(ann.x, ann.y, ann.width, ann.height);
                    }
                    break;
                case 'circle':
                    if (ann.radius) {
                        ctx.beginPath();
                        ctx.arc(ann.x, ann.y, ann.radius, 0, 2 * Math.PI);
                        ctx.stroke();
                    }
                    break;
                case 'line':
                    if (ann.x2 !== undefined && ann.y2 !== undefined) {
                        ctx.beginPath();
                        ctx.moveTo(ann.x, ann.y);
                        ctx.lineTo(ann.x2, ann.y2);
                        ctx.stroke();
                    }
                    break;
                case 'text':
                    if (ann.text) {
                        ctx.font = '12px sans-serif';
                        ctx.fillText(ann.text, ann.x, ann.y);
                    }
                    break;
            }

            // Draw label if present
            if (ann.label) {
                ctx.font = '10px sans-serif';
                ctx.fillStyle = ann.color;
                ctx.fillText(ann.label, ann.x, ann.y - 5);
            }
        });

        // Draw current annotation being created
        if (currentAnnotation && startPos) {
            ctx.strokeStyle = currentAnnotation.color || '#ef4444';
            ctx.lineWidth = 2;
            
            switch (currentAnnotation.type) {
                case 'rectangle':
                    if (currentAnnotation.width && currentAnnotation.height) {
                        ctx.strokeRect(
                            currentAnnotation.x || 0,
                            currentAnnotation.y || 0,
                            currentAnnotation.width,
                            currentAnnotation.height
                        );
                    }
                    break;
                case 'circle':
                    if (currentAnnotation.radius) {
                        ctx.beginPath();
                        ctx.arc(
                            currentAnnotation.x || 0,
                            currentAnnotation.y || 0,
                            currentAnnotation.radius,
                            0,
                            2 * Math.PI
                        );
                        ctx.stroke();
                    }
                    break;
                case 'line':
                    if (currentAnnotation.x2 !== undefined && currentAnnotation.y2 !== undefined) {
                        ctx.beginPath();
                        ctx.moveTo(currentAnnotation.x || 0, currentAnnotation.y || 0);
                        ctx.lineTo(currentAnnotation.x2, currentAnnotation.y2);
                        ctx.stroke();
                    }
                    break;
            }
        }

        ctx.restore();
    }, [annotations, selectedAnnotation, currentAnnotation, startPos, zoom, pan]);

    // Update canvas size when image loads
    useEffect(() => {
        const image = imageRef.current;
        const canvas = canvasRef.current;
        if (!image || !canvas) return;

        const updateCanvasSize = () => {
            canvas.width = image.offsetWidth;
            canvas.height = image.offsetHeight;
            drawAnnotations();
        };

        if (image.complete) {
            updateCanvasSize();
        } else {
            image.onload = updateCanvasSize;
        }

        window.addEventListener('resize', updateCanvasSize);
        return () => window.removeEventListener('resize', updateCanvasSize);
    }, [imagery.image_url, drawAnnotations]);

    // Redraw when annotations change
    useEffect(() => {
        drawAnnotations();
    }, [drawAnnotations]);

    // Handle mouse down
    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (readOnly) return;

        const coords = getCanvasCoordinates(e);

        if (tool === 'pan') {
            setIsPanning(true);
            setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
            return;
        }

        if (tool === 'select') {
            // Find annotation at click position
            const clicked = annotations.find(ann => {
                if (ann.type === 'rectangle' && ann.width && ann.height) {
                    return coords.x >= ann.x && coords.x <= ann.x + ann.width &&
                           coords.y >= ann.y && coords.y <= ann.y + ann.height;
                }
                if (ann.type === 'circle' && ann.radius) {
                    const dist = Math.sqrt(
                        Math.pow(coords.x - ann.x, 2) + Math.pow(coords.y - ann.y, 2)
                    );
                    return dist <= ann.radius;
                }
                return false;
            });
            setSelectedAnnotation(clicked?.id || null);
            return;
        }

        if (tool === 'text') {
            const text = prompt('Enter annotation text:');
            if (text) {
                const newAnn: Annotation = {
                    id: `ann-${Date.now()}`,
                    type: 'text',
                    x: coords.x,
                    y: coords.y,
                    text,
                    color: '#ef4444',
                };
                setAnnotations(prev => [...prev, newAnn]);
            }
            return;
        }

        // Start drawing shape
        setIsDrawing(true);
        setStartPos(coords);
        setCurrentAnnotation({
            type: tool as AnnotationType,
            x: coords.x,
            y: coords.y,
            color: '#ef4444',
        });
    };

    // Handle mouse move
    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (readOnly) return;

        if (isPanning && panStart) {
            setPan({
                x: e.clientX - panStart.x,
                y: e.clientY - panStart.y,
            });
            return;
        }

        if (!isDrawing || !startPos) return;

        const coords = getCanvasCoordinates(e);
        const dx = coords.x - startPos.x;
        const dy = coords.y - startPos.y;

        switch (tool) {
            case 'rectangle':
                setCurrentAnnotation({
                    ...currentAnnotation,
                    width: Math.abs(dx),
                    height: Math.abs(dy),
                    x: dx < 0 ? coords.x : startPos.x,
                    y: dy < 0 ? coords.y : startPos.y,
                });
                break;
            case 'circle':
                const radius = Math.sqrt(dx * dx + dy * dy);
                setCurrentAnnotation({
                    ...currentAnnotation,
                    radius,
                });
                break;
            case 'line':
                setCurrentAnnotation({
                    ...currentAnnotation,
                    x2: coords.x,
                    y2: coords.y,
                });
                break;
        }
    };

    // Handle mouse up
    const handleMouseUp = () => {
        if (readOnly || !isDrawing || !startPos || !currentAnnotation) return;

        if (currentAnnotation.type && currentAnnotation.type !== 'text') {
            const newAnn: Annotation = {
                id: `ann-${Date.now()}`,
                type: currentAnnotation.type,
                x: currentAnnotation.x || 0,
                y: currentAnnotation.y || 0,
                width: currentAnnotation.width,
                height: currentAnnotation.height,
                radius: currentAnnotation.radius,
                x2: currentAnnotation.x2,
                y2: currentAnnotation.y2,
                color: currentAnnotation.color || '#ef4444',
            };
            setAnnotations(prev => [...prev, newAnn]);
        }

        setIsDrawing(false);
        setStartPos(null);
        setCurrentAnnotation(null);
    };

    // Save annotations
    const handleSave = async () => {
        setIsSaving(true);
        try {
            const annotationsJson = JSON.stringify(annotations);
            
            // Update imagery with annotations
            await BdaApi.updateImagery(imagery.id, {
                annotations_json: annotationsJson,
                annotated_by: 'current_user', // TODO: Get from auth context
                annotated_at: new Date().toISOString(),
            });

            onSave?.(annotations);
        } catch (err) {
            console.error('Failed to save annotations:', err);
            alert('Failed to save annotations');
        } finally {
            setIsSaving(false);
        }
    };

    // Delete selected annotation
    const handleDelete = () => {
        if (selectedAnnotation) {
            setAnnotations(prev => prev.filter(ann => ann.id !== selectedAnnotation));
            setSelectedAnnotation(null);
        }
    };

    // Reset zoom and pan
    const handleReset = () => {
        setZoom(1);
        setPan({ x: 0, y: 0 });
    };

    return (
        <Card className="bg-slate-900/40 border-slate-800">
            <CardHeader className="border-b border-slate-800/50 pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        Image Annotator
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setZoom(prev => Math.min(prev + 0.1, 3))}
                            className="h-6 w-6 p-0"
                        >
                            <ZoomIn size={12} />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setZoom(prev => Math.max(prev - 0.1, 0.5))}
                            className="h-6 w-6 p-0"
                        >
                            <ZoomOut size={12} />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleReset}
                            className="h-6 w-6 p-0"
                        >
                            <RotateCcw size={12} />
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                {!readOnly && (
                    <div className="flex items-center gap-1 p-2 border-b border-slate-800/50 bg-slate-950/40">
                        <Button
                            variant={tool === 'select' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setTool('select')}
                            className="h-7 px-2 text-[9px]"
                        >
                            Select
                        </Button>
                        <Button
                            variant={tool === 'pan' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setTool('pan')}
                            className="h-7 px-2 text-[9px]"
                        >
                            <Move size={12} className="mr-1" />
                            Pan
                        </Button>
                        <div className="w-px h-4 bg-slate-700 mx-1" />
                        <Button
                            variant={tool === 'rectangle' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setTool('rectangle')}
                            className="h-7 px-2 text-[9px]"
                        >
                            <Square size={12} className="mr-1" />
                            Rect
                        </Button>
                        <Button
                            variant={tool === 'circle' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setTool('circle')}
                            className="h-7 px-2 text-[9px]"
                        >
                            <Circle size={12} className="mr-1" />
                            Circle
                        </Button>
                        <Button
                            variant={tool === 'line' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setTool('line')}
                            className="h-7 px-2 text-[9px]"
                        >
                            <Minus size={12} className="mr-1" />
                            Line
                        </Button>
                        <Button
                            variant={tool === 'text' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setTool('text')}
                            className="h-7 px-2 text-[9px]"
                        >
                            <Type size={12} className="mr-1" />
                            Text
                        </Button>
                        <div className="flex-1" />
                        {selectedAnnotation && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleDelete}
                                className="h-7 px-2 text-[9px] text-red-400"
                            >
                                <Trash2 size={12} className="mr-1" />
                                Delete
                            </Button>
                        )}
                        <Button
                            variant="default"
                            size="sm"
                            onClick={handleSave}
                            disabled={isSaving}
                            className="h-7 px-2 text-[9px]"
                        >
                            <Save size={12} className="mr-1" />
                            {isSaving ? 'Saving...' : 'Save'}
                        </Button>
                    </div>
                )}
                <div 
                    ref={containerRef}
                    className="relative overflow-hidden bg-slate-950"
                    style={{ maxHeight: '600px' }}
                >
                    <img
                        ref={imageRef}
                        src={imagery.image_url.startsWith('/') ? `/api${imagery.image_url}` : imagery.image_url}
                        alt="BDA Imagery"
                        className="w-full h-auto"
                        style={{
                            transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
                            transformOrigin: 'top left',
                        }}
                    />
                    <canvas
                        ref={canvasRef}
                        className="absolute top-0 left-0 w-full h-full pointer-events-auto"
                        style={{ cursor: tool === 'pan' ? 'grab' : tool === 'select' ? 'pointer' : 'crosshair' }}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                    />
                </div>
            </CardContent>
        </Card>
    );
};
