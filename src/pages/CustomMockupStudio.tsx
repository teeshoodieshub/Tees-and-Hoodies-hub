import React, { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';
import { Upload, RefreshCw, Save, ShoppingBag, Type, Type as TypeIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import { useCart } from '@/context/CartContext';
import { createProduct, uploadProductImage } from '@/lib/supabaseApi';

import whiteTeeImg from '@/assets/product-tee-white.jpg';
import creamHoodieImg from '@/assets/product-hoodie-cream.jpg';

export default function CustomMockupStudio() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<fabric.Canvas | null>(null);
  const [productType, setProductType] = useState<'tshirt' | 'hoodie'>('tshirt');
  const [productColor, setProductColor] = useState('#ffffff');
  const [size, setSize] = useState('M');
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { addItem } = useCart();
  
  // Controls state
  const [opacity, setOpacity] = useState(100);

  // We will initialize canvas here
  useEffect(() => {
    if (!canvasRef.current) return;
    
    // Create Fabric canvas
    const canvas = new fabric.Canvas(canvasRef.current, {
      width: 400,
      height: 500,
    });
    
    setFabricCanvas(canvas);

    return () => {
      canvas.dispose();
      setFabricCanvas(null);
    };
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !fabricCanvas) return;

    const reader = new FileReader();
    reader.onload = (f) => {
      const data = f.target?.result;
      if (typeof data !== 'string') return;
      
      fabric.Image.fromURL(data).then((img) => {
        // scale image to fit decently inside canvas
        img.scaleToWidth(200);
        
        fabricCanvas.centerObject(img);
        fabricCanvas.add(img);
        fabricCanvas.setActiveObject(img);
        fabricCanvas.renderAll();
      });
    };
    reader.readAsDataURL(file);
  };

  const addText = () => {
    if (!fabricCanvas) return;
    const text = new fabric.IText('Custom Text', {
      left: 100,
      top: 100,
      fontFamily: 'sans-serif',
      fill: '#000000',
      fontSize: 24,
    });
    fabricCanvas.add(text);
    fabricCanvas.setActiveObject(text);
    fabricCanvas.renderAll();
  };

  const clearCanvas = () => {
    if (!fabricCanvas) return;
    fabricCanvas.clear();
    toast.success('Design cleared');
  };

  const savePreview = () => {
    if (!fabricCanvas) return;
    fabricCanvas.discardActiveObject();
    fabricCanvas.renderAll();
    const dataURL = fabricCanvas.toDataURL({
      format: 'png',
      multiplier: 2
    });
    
    // Create download link
    const link = document.createElement('a');
    link.download = 'custom-mockup-preview.png';
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Preview saved!');
  };

  const dataURLtoFile = (dataurl: string, filename: string) => {
    let arr = dataurl.split(','), mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch) return null;
    let mime = mimeMatch[1];
    let bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, {type:mime});
  }

  const handleAddToCart = async () => {
    if (!fabricCanvas) return;
    setIsAddingToCart(true);
    try {
      fabricCanvas.discardActiveObject();
      fabricCanvas.renderAll();
      const dataURL = fabricCanvas.toDataURL({ format: 'png', multiplier: 2 });
      
      const file = dataURLtoFile(dataURL, `custom-mockup-\${Date.now()}.png`);
      if (!file) throw new Error("Failed to generate image file");

      toast.loading("Uploading design...", { id: "add-cart" });
      const imageUrl = await uploadProductImage(file);
      
      const productId = `custom-\${Date.now()}`;
      const customProduct = {
        id: productId,
        name: `Custom \${productType === 'tshirt' ? 'T-Shirt' : 'Hoodie'}`,
        price: productType === 'tshirt' ? 29.99 : 49.99,
        category: 'custom',
        featuredImage: imageUrl,
        images: [imageUrl],
        useDesignSelection: false,
        colors: [productColor],
        sizes: [size],
        description: 'A custom designed product created in the Mockup Studio.',
        specs: '100% Cotton, Custom Print',
        isNew: true,
      };

      toast.loading("Adding to cart...", { id: "add-cart" });
      await createProduct(customProduct);
      addItem(customProduct, size, productColor);
      
      toast.success("Added to cart!", { id: "add-cart" });
    } catch (error) {
      console.error(error);
      toast.error("Failed to add to cart. Please try again.", { id: "add-cart" });
    } finally {
      setIsAddingToCart(false);
    }
  };

  return (
    <div className="pt-24 min-h-screen bg-gray-50 dark:bg-zinc-950 flex flex-col md:flex-row">
      {/* Left Sidebar */}
      <div className="w-full md:w-64 bg-white dark:bg-zinc-900 border-r border-border p-6 shadow-sm flex-shrink-0">
        <h2 className="text-xl font-bold mb-6 font-serif tracking-wide">Studio Options</h2>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Product Type</label>
            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant={productType === 'tshirt' ? 'default' : 'outline'}
                onClick={() => setProductType('tshirt')}
                className="w-full"
              >
                T-Shirt
              </Button>
              <Button 
                variant={productType === 'hoodie' ? 'default' : 'outline'}
                onClick={() => setProductType('hoodie')}
                className="w-full"
              >
                Hoodie
              </Button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Product Color</label>
            <div className="flex flex-wrap gap-2">
              {['#ffffff', '#000000', '#f3f4f6', '#3b82f6', '#ef4444', '#10b981'].map(color => (
                <button
                  key={color}
                  className={`w-8 h-8 rounded-full border-2 ${productColor === color ? 'border-primary' : 'border-transparent shadow-sm'}`}
                  style={{ backgroundColor: color }}
                  onClick={() => setProductColor(color)}
                />
              ))}
            </div>
          </div>
          
          <div className="pt-4 border-t border-border">
            <h3 className="text-sm font-medium mb-3">Add Elements</h3>
            <label className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md cursor-pointer transition-colors shadow-sm font-medium">
              <Upload size={18} />
              <span>Upload Design</span>
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleImageUpload} 
              />
            </label>
            
            <Button variant="outline" className="w-full mt-2 flex items-center justify-center gap-2" onClick={addText}>
              <TypeIcon size={18} />
              <span>Add Text</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 p-6 flex flex-col items-center justify-center bg-gray-100/50 dark:bg-zinc-950/50 min-h-[500px]">
        <div className="relative border border-border bg-white dark:bg-zinc-900 shadow-sm rounded-lg overflow-hidden flex items-center justify-center" style={{ width: '500px', height: '600px', backgroundColor: productColor }}>
          {/* Background Mockup Image */}
          <div 
            className="absolute inset-0 pointer-events-none mix-blend-multiply bg-center bg-no-repeat bg-contain"
            style={{ 
              backgroundImage: `url(${productType === 'tshirt' ? whiteTeeImg : creamHoodieImg})` 
            }}
          />
          
          {/* Printable Area Bounds (dashed box for visual guide) */}
          <div className="absolute inset-x-12 top-24 bottom-24 border-2 border-dashed border-gray-300 pointer-events-none rounded-sm"></div>

          {/* Fabric Canvas container constrained inside the printable area */}
          <div className="relative z-10" style={{ width: '400px', height: '500px' }}>
            <canvas ref={canvasRef} />
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="w-full md:w-72 bg-white dark:bg-zinc-900 border-l border-border p-6 shadow-sm flex-shrink-0 flex flex-col">
        <h2 className="text-xl font-bold mb-6 font-serif tracking-wide">Edit Object</h2>
        
        <div className="space-y-6 flex-1">
          <div>
            <label className="block text-sm font-medium mb-2 flex justify-between">
              <span>Opacity</span>
              <span className="text-muted-foreground">{opacity}%</span>
            </label>
            <Slider 
              value={[opacity]} 
              min={0} 
              max={100} 
              step={1} 
              onValueChange={(vals) => {
                setOpacity(vals[0]);
                if (fabricCanvas) {
                  const activeObj = fabricCanvas.getActiveObject();
                  if (activeObj) {
                    activeObj.set('opacity', vals[0] / 100);
                    fabricCanvas.renderAll();
                  }
                }
              }} 
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Select an object on the canvas to resize, rotate, or move it. Use the corner handles for scaling.
          </p>
        </div>

        <div className="pt-6 border-t border-border mt-auto space-y-3">
          <div>
            <label className="block text-sm font-medium mb-2">Size</label>
            <div className="flex flex-wrap gap-2 mb-4">
              {['S', 'M', 'L', 'XL', '2XL'].map(s => (
                <Button 
                  key={s}
                  variant={size === s ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSize(s)}
                  className="w-10 h-10 p-0"
                >
                  {s}
                </Button>
              ))}
            </div>
          </div>

          <Button variant="outline" className="w-full flex justify-center gap-2" onClick={clearCanvas}>
            <RefreshCw size={18} />
            Reset Design
          </Button>
          <Button variant="secondary" className="w-full flex justify-center gap-2" onClick={savePreview}>
            <Save size={18} />
            Save Preview
          </Button>
          <Button 
            className="w-full flex justify-center gap-2 bg-black hover:bg-black/90 text-white rounded-none tracking-wider uppercase h-12"
            onClick={handleAddToCart}
            disabled={isAddingToCart}
          >
            {isAddingToCart ? <Loader2 className="animate-spin" size={18} /> : <ShoppingBag size={18} />}
            {isAddingToCart ? 'Adding...' : 'Add to Cart'}
          </Button>
        </div>
      </div>
    </div>
  );
}
