import { useRef, useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Brush, Eraser, Undo2, Redo2, Download, Trash2 } from "lucide-react";

interface DrawingCanvasProps {
  onDrawingChange?: (imageData: string) => void;
  width?: number;
  height?: number;
  initialImageData?: string;
}

interface DrawingState {
  imageData: ImageData | null;
}

export default function DrawingCanvas({ onDrawingChange, width = 600, height = 400, initialImageData }: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<'brush' | 'eraser'>('brush');
  const [brushSize, setBrushSize] = useState([5]);
  const [color, setColor] = useState('#FF6B6B'); // Default to coral
  const [undoStack, setUndoStack] = useState<DrawingState[]>([]);
  const [redoStack, setRedoStack] = useState<DrawingState[]>([]);

  const colors = ['#FF6B6B', '#00CED1', '#FFD700', '#FF8C42', '#800000', '#000000'];

  const saveState = useCallback(() => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (!canvas || !context) return;

    const imageData = context.getImageData(0, 0, width, height);
    setUndoStack(prev => [...prev.slice(-19), { imageData }]); // Keep last 20 states
    setRedoStack([]);
  }, [width, height]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d', { willReadFrequently: true } as any);
    if (!context) return;

    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.globalAlpha = 1;
    contextRef.current = context;

    // Set canvas background to white
    context.fillStyle = 'white';
    context.fillRect(0, 0, width, height);
    
    // Save initial state
    saveState();
  }, [width, height, saveState]);

  // Load initial image if provided
  useEffect(() => {
    if (!initialImageData) return;
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (!canvas || !context) return;

    const img = new Image();
    img.onload = () => {
      // Clear to white background
      context.fillStyle = 'white';
      context.fillRect(0, 0, width, height);
      // Draw image fit into canvas preserving aspect ratio
      const scale = Math.min(width / img.width, height / img.height);
      const drawWidth = img.width * scale;
      const drawHeight = img.height * scale;
      const dx = (width - drawWidth) / 2;
      const dy = (height - drawHeight) / 2;
      context.drawImage(img, dx, dy, drawWidth, drawHeight);
      saveState();
      if (onDrawingChange && canvas) {
        const dataUrl = canvas.toDataURL('image/png');
        onDrawingChange(dataUrl);
      }
    };
    img.src = initialImageData;
  }, [initialImageData, width, height, onDrawingChange, saveState]);

  

  const getCoordinates = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = width / rect.width;
    const scaleY = height / rect.height;

    if ('touches' in event) {
      const touch = event.touches[0] || event.changedTouches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      };
    } else {
      return {
        x: (event.clientX - rect.left) * scaleX,
        y: (event.clientY - rect.top) * scaleY,
      };
    }
  };

  const startDrawing = useCallback((event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    const { x, y } = getCoordinates(event);
    const context = contextRef.current;
    if (!context) return;

    setIsDrawing(true);
    
    context.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over';
    context.strokeStyle = color;
    context.lineWidth = brushSize[0];
    
    context.beginPath();
    context.moveTo(x, y);
  }, [tool, color, brushSize]);

  const draw = useCallback((event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    if (!isDrawing) return;

    const { x, y } = getCoordinates(event);
    const context = contextRef.current;
    if (!context) return;

    context.lineTo(x, y);
    context.stroke();
  }, [isDrawing]);

  const stopDrawing = useCallback(() => {
    if (!isDrawing) return;
    setIsDrawing(false);
    
    saveState();
    
    // Export drawing data
    const canvas = canvasRef.current;
    if (canvas && onDrawingChange) {
      const imageData = canvas.toDataURL('image/png');
      onDrawingChange(imageData);
    }
  }, [isDrawing, saveState, onDrawingChange]);

  const undo = useCallback(() => {
    if (undoStack.length <= 1) return;

    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (!canvas || !context) return;

    const currentState = undoStack[undoStack.length - 1];
    const previousState = undoStack[undoStack.length - 2];

    setRedoStack(prev => [...prev, currentState]);
    setUndoStack(prev => prev.slice(0, -1));

    if (previousState?.imageData) {
      context.putImageData(previousState.imageData, 0, 0);
    }

    // Export updated drawing
    if (onDrawingChange) {
      const imageData = canvas.toDataURL('image/png');
      onDrawingChange(imageData);
    }
  }, [undoStack, onDrawingChange]);

  const redo = useCallback(() => {
    if (redoStack.length === 0) return;

    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (!canvas || !context) return;

    const nextState = redoStack[redoStack.length - 1];
    setUndoStack(prev => [...prev, nextState]);
    setRedoStack(prev => prev.slice(0, -1));

    if (nextState?.imageData) {
      context.putImageData(nextState.imageData, 0, 0);
    }

    // Export updated drawing
    if (onDrawingChange) {
      const imageData = canvas.toDataURL('image/png');
      onDrawingChange(imageData);
    }
  }, [redoStack, onDrawingChange]);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (!canvas || !context) return;

    context.fillStyle = 'white';
    context.fillRect(0, 0, width, height);
    saveState();

    // Export cleared canvas
    if (onDrawingChange) {
      const imageData = canvas.toDataURL('image/png');
      onDrawingChange(imageData);
    }
  }, [width, height, saveState, onDrawingChange]);

  const downloadDrawing = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = 'my-drawing.png';
    link.href = canvas.toDataURL();
    link.click();
  }, []);

  return (
    <div className="bg-gradient-to-br from-cream to-background rounded-2xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground flex items-center">
          <Brush className="text-coral mr-2" />
          Drawing Canvas
        </h3>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={undo}
            disabled={undoStack.length <= 1}
            data-testid="button-undo"
          >
            <Undo2 size={16} />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={redo}
            disabled={redoStack.length === 0}
            data-testid="button-redo"
          >
            <Redo2 size={16} />
          </Button>
        </div>
      </div>
      
      {/* Canvas */}
      <div className="bg-white border-2 border-dashed border-border rounded-lg mb-4 flex justify-center">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="rounded-lg max-w-full h-auto drawing-canvas"
          data-testid="canvas-drawing"
        />
      </div>

      {/* Drawing Tools */}
      <div className="floating-toolbar rounded-lg p-4 flex flex-wrap gap-4 justify-between items-center">
        {/* Tool Selection */}
        <div className="flex space-x-2">
          <Button
            variant={tool === 'brush' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTool('brush')}
            className={tool === 'brush' ? 'btn-coral' : ''}
            data-testid="button-brush"
          >
            <Brush size={16} />
          </Button>
          <Button
            variant={tool === 'eraser' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTool('eraser')}
            data-testid="button-eraser"
          >
            <Eraser size={16} />
          </Button>
        </div>

        {/* Colors */}
        <div className="flex space-x-2">
          {colors.map((c) => (
            <button
              key={c}
              className={`color-swatch ${color === c ? 'ring-2 ring-primary' : ''}`}
              style={{ backgroundColor: c }}
              onClick={() => setColor(c)}
              data-testid={`color-${c}`}
            />
          ))}
        </div>

        {/* Brush Size */}
        <div className="flex items-center space-x-3 bg-muted rounded-lg px-4 py-2">
          <span className="text-sm font-medium">Size:</span>
          <Slider
            value={brushSize}
            onValueChange={setBrushSize}
            max={50}
            min={1}
            step={1}
            className="w-24"
            data-testid="slider-brush-size"
          />
          <span className="text-sm w-8" data-testid="text-brush-size">{brushSize[0]}</span>
        </div>

        {/* Actions */}
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={downloadDrawing}
            data-testid="button-download"
          >
            <Download size={16} />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={clearCanvas}
            data-testid="button-clear"
          >
            <Trash2 size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}
