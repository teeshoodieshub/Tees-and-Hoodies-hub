import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as fabric from "fabric";
import {
  CheckCircle2,
  Copy,
  Download,
  Image as ImageIcon,
  Loader2,
  Minus,
  Package,
  Plus,
  RotateCcw,
  RotateCw,
  Send,
  Shirt,
  Sparkles,
  Trash2,
  Type,
  Undo2,
  Upload,
  X,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

type ProductOption = {
  id: string;
  label: string;
  description: string;
  basePrice: string;
};

type ColorOption = {
  name: string;
  hex: string;
  text: string;
};

type PlacementId = "front" | "back" | "left-sleeve" | "right-sleeve";

type PlacementOption = {
  id: PlacementId;
  label: string;
  hint: string;
};

type MockupAsset = {
  src: string;
  objectPosition?: string;
  imageClassName?: string;
  printArea: {
    desktop: string;
    export: { x: number; y: number; width: number; height: number };
  };
};

const PRODUCTS: ProductOption[] = [
  { id: "T-Shirts", label: "T-Shirts", description: "Soft everyday cotton", basePrice: "from GHc 65" },
  { id: "Hoodies", label: "Hoodies", description: "Heavyweight fleece", basePrice: "from GHc 160" },
  { id: "Sleeveless T-Shirts", label: "Sleeveless", description: "Team and event wear", basePrice: "from GHc 55" },
  { id: "Polo Shirts", label: "Polos", description: "Corporate uniforms", basePrice: "from GHc 95" },
];

const COLORS: ColorOption[] = [
  { name: "Black", hex: "#171412", text: "#f8f3ec" },
  { name: "White", hex: "#f8f7f2", text: "#171412" },
  { name: "Ash", hex: "#b8b4aa", text: "#171412" },
  { name: "Deep Ash", hex: "#67645e", text: "#f8f3ec" },
  { name: "Wine", hex: "#6d2731", text: "#f8f3ec" },
  { name: "Army Green", hex: "#4d5632", text: "#f8f3ec" },
  { name: "Cream", hex: "#f3e7cf", text: "#171412" },
  { name: "Purple", hex: "#6d4c92", text: "#f8f3ec" },
  { name: "Navy", hex: "#1b2538", text: "#f8f3ec" },
  { name: "Red", hex: "#b63235", text: "#f8f3ec" },
];

const PLACEMENTS: PlacementOption[] = [
  { id: "front", label: "Front", hint: "Chest or full front" },
  { id: "back", label: "Back", hint: "Upper or full back" },
  { id: "left-sleeve", label: "Left sleeve", hint: "Small logo mark" },
  { id: "right-sleeve", label: "Right sleeve", hint: "Small logo mark" },
];

const SIZES = ["S", "M", "L", "XL", "XXL"];
const TEXT_PRESETS = ["TEAM", "BRAND", "EST. 2026", "CREW"];
const MINIMUM_QUANTITY = 10;
const MOCKUP_ASSET_VERSION = "backs-20260702";

const PRODUCT_SLUGS: Record<string, string> = {
  "T-Shirts": "t-shirts",
  Hoodies: "hoodies",
  "Sleeveless T-Shirts": "sleeveless-t-shirts",
  "Polo Shirts": "polo-shirts",
};

const COLOR_SLUGS: Record<string, string> = {
  Black: "black",
  White: "white",
  Ash: "ash",
  "Deep Ash": "deep-ash",
  Wine: "wine",
  "Army Green": "army-green",
  Cream: "cream",
  Purple: "purple",
  Navy: "navy",
  Red: "red",
};

const PRINT_AREAS: Record<string, MockupAsset["printArea"]> = {
  "t-shirts:front": { desktop: "left-[35.5%] top-[26%] h-[270px] w-[190px]", export: { x: 344, y: 310, width: 272, height: 350 } },
  "t-shirts:back": { desktop: "left-[35.5%] top-[26%] h-[270px] w-[190px]", export: { x: 344, y: 310, width: 272, height: 350 } },
  "t-shirts:left-sleeve": { desktop: "left-[38%] top-[24%] h-[300px] w-[150px]", export: { x: 390, y: 285, width: 190, height: 380 } },
  "t-shirts:right-sleeve": { desktop: "left-[38%] top-[24%] h-[300px] w-[150px]", export: { x: 390, y: 285, width: 190, height: 380 } },
  "hoodies:front": { desktop: "left-[32%] top-[25%] h-[230px] w-[220px]", export: { x: 330, y: 292, width: 300, height: 300 } },
  "hoodies:back": { desktop: "left-[32%] top-[24%] h-[260px] w-[220px]", export: { x: 330, y: 275, width: 300, height: 340 } },
  "hoodies:left-sleeve": { desktop: "left-[37%] top-[22%] h-[320px] w-[170px]", export: { x: 380, y: 260, width: 220, height: 415 } },
  "hoodies:right-sleeve": { desktop: "left-[37%] top-[22%] h-[320px] w-[170px]", export: { x: 380, y: 260, width: 220, height: 415 } },
  "sleeveless-t-shirts:front": { desktop: "left-[35%] top-[28%] h-[240px] w-[170px]", export: { x: 360, y: 330, width: 240, height: 315 } },
  "sleeveless-t-shirts:back": { desktop: "left-[35%] top-[28%] h-[240px] w-[170px]", export: { x: 360, y: 330, width: 240, height: 315 } },
  "sleeveless-t-shirts:left-sleeve": { desktop: "left-[36%] top-[23%] h-[310px] w-[175px]", export: { x: 374, y: 270, width: 225, height: 410 } },
  "sleeveless-t-shirts:right-sleeve": { desktop: "left-[36%] top-[23%] h-[310px] w-[175px]", export: { x: 374, y: 270, width: 225, height: 410 } },
  "polo-shirts:front": { desktop: "left-[35.5%] top-[26%] h-[270px] w-[190px]", export: { x: 344, y: 310, width: 272, height: 350 } },
  "polo-shirts:back": { desktop: "left-[35.5%] top-[26%] h-[270px] w-[190px]", export: { x: 344, y: 310, width: 272, height: 350 } },
  "polo-shirts:left-sleeve": { desktop: "left-[38%] top-[24%] h-[300px] w-[150px]", export: { x: 390, y: 285, width: 190, height: 380 } },
  "polo-shirts:right-sleeve": { desktop: "left-[38%] top-[24%] h-[300px] w-[150px]", export: { x: 390, y: 285, width: 190, height: 380 } },
};

const inputClass =
  "h-11 w-full border border-border bg-background px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-foreground";
const labelClass =
  "mb-2 block text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground";
const controlButtonClass =
  "inline-flex h-10 items-center justify-center gap-2 border border-border bg-background px-3 text-xs font-semibold uppercase tracking-[0.12em] transition-colors hover:border-foreground disabled:pointer-events-none disabled:opacity-35";

const fadeInUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as const },
};

function dataUrlToFile(dataUrl: string, filename: string) {
  const [metadata, content] = dataUrl.split(",");
  const mime = metadata.match(/:(.*?);/)?.[1] || "image/png";
  const binary = atob(content);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return new File([bytes], filename, { type: mime });
}

function loadCanvasImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Failed to load mockup image"));
    image.src = src;
  });
}

function drawContainedImage(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number
) {
  const scale = Math.min(width / image.naturalWidth, height / image.naturalHeight);
  const drawWidth = image.naturalWidth * scale;
  const drawHeight = image.naturalHeight * scale;
  ctx.drawImage(image, x + (width - drawWidth) / 2, y + (height - drawHeight) / 2, drawWidth, drawHeight);
}

function getPlacementLabel(placement: PlacementId) {
  return PLACEMENTS.find((item) => item.id === placement)?.label || "Front";
}

function getMockupAsset(productType: string, colorName: string, placement: PlacementId): MockupAsset | null {
  const productSlug = PRODUCT_SLUGS[productType];
  const colorSlug = COLOR_SLUGS[colorName];
  const printArea = productSlug ? PRINT_AREAS[`${productSlug}:${placement}`] : null;
  if (!productSlug || !colorSlug || !printArea) return null;

  return {
    src: `/custom-studio-mockups/${productSlug}-${colorSlug}-${placement}.png?v=${MOCKUP_ASSET_VERSION}`,
    objectPosition: "center",
    printArea,
  };
}

function uploadFileToDesignBucket(file: File, prefix = "studio-orders") {
  const extension = file.name.split(".").pop() || "png";
  const filename = `${prefix}/${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;

  return supabase.storage
    .from("design_uploads")
    .upload(filename, file)
    .then(({ error }) => {
      if (error) throw error;
      return filename;
    });
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error && "message" in error) {
    return String((error as { message?: unknown }).message || "Could not submit the custom order.");
  }
  return "Could not submit the custom order.";
}

function GarmentMockup({
  color,
  productType,
  placement,
}: {
  color: ColorOption;
  productType: string;
  placement: PlacementId;
}) {
  const isHoodie = productType === "Hoodies";
  const isPolo = productType === "Polo Shirts";
  const isSleeveless = productType === "Sleeveless T-Shirts";
  const isBack = placement === "back";
  const isSleeve = placement.includes("sleeve");
  const mockupAsset = getMockupAsset(productType, color.name, placement);
  const printX = isSleeve ? 180 : 154;
  const printY = isSleeve ? 128 : 150;
  const printWidth = isSleeve ? 140 : 192;
  const printHeight = isSleeve ? 292 : 242;

  if (mockupAsset) {
    return (
      <div className="h-full w-full overflow-hidden bg-white" role="img" aria-label={`${color.name} ${productType} mockup`}>
        <img
          src={mockupAsset.src}
          alt={`${color.name} ${productType} mockup`}
          className={`h-full w-full object-contain drop-shadow-[0_18px_26px_rgba(36,27,19,0.14)] ${mockupAsset.imageClassName || ""}`}
          style={{ objectPosition: mockupAsset.objectPosition || "center" }}
          draggable={false}
        />
      </div>
    );
  }

  return (
    <svg viewBox="0 0 500 620" className="h-full w-full" role="img" aria-label={`${color.name} ${productType} mockup`}>
      <defs>
        <filter id="studio-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="18" stdDeviation="22" floodColor="#2D4033" floodOpacity="0.16" />
        </filter>
        <linearGradient id="cloth-light" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="rgba(255,255,255,0.22)" />
          <stop offset="0.45" stopColor="rgba(255,255,255,0.04)" />
          <stop offset="1" stopColor="rgba(0,0,0,0.14)" />
        </linearGradient>
      </defs>
      <rect x="34" y="30" width="432" height="545" rx="2" fill="#F1F0EA" opacity="0.34" />
      <g filter="url(#studio-shadow)">
        {isSleeve ? (
          <path
            d="M168 82 C205 66 313 66 350 82 C365 94 373 111 376 134 L413 494 C416 523 398 543 369 543 L141 543 C112 543 94 523 97 494 L134 134 C137 111 145 94 168 82 Z"
            fill={color.hex}
          />
        ) : (
          <path
            d={
              isSleeveless
                ? "M152 112 C185 93 315 93 348 112 C357 164 376 212 404 259 C388 279 371 285 353 276 L353 548 L147 548 L147 276 C129 285 112 279 96 259 C124 212 143 164 152 112 Z"
                : "M117 147 C124 122 142 107 171 101 C196 97 209 126 250 126 C291 126 304 97 329 101 C358 107 376 122 383 147 L447 248 C431 274 410 282 386 272 L368 548 L132 548 L114 272 C90 282 69 274 53 248 L117 147 Z"
            }
            fill={color.hex}
          />
        )}
        <path
          d={
            isSleeve
              ? "M168 82 C205 66 313 66 350 82 L413 494 C416 523 398 543 369 543 L141 543 C112 543 94 523 97 494 L134 134 C137 111 145 94 168 82 Z"
              : isSleeveless
                ? "M152 112 C185 93 315 93 348 112 C357 164 376 212 404 259 C388 279 371 285 353 276 L353 548 L147 548 L147 276 C129 285 112 279 96 259 C124 212 143 164 152 112 Z"
                : "M117 147 C124 122 142 107 171 101 C196 97 209 126 250 126 C291 126 304 97 329 101 C358 107 376 122 383 147 L447 248 C431 274 410 282 386 272 L368 548 L132 548 L114 272 C90 282 69 274 53 248 L117 147 Z"
          }
          fill="url(#cloth-light)"
        />
        {isHoodie && !isSleeve && (
          <>
            <path d="M177 116 C185 65 315 65 323 116 C301 139 279 148 250 148 C221 148 199 139 177 116 Z" fill={color.hex} opacity="0.82" />
            <path d="M202 144 C218 161 236 169 250 169 C264 169 282 161 298 144" fill="none" stroke="rgba(0,0,0,0.18)" strokeWidth="5" strokeLinecap="round" />
          </>
        )}
        {!isHoodie && !isSleeve && (
          <path
            d={isPolo ? "M205 101 L250 154 L295 101" : "M184 104 C207 145 293 145 316 104"}
            fill="none"
            stroke="rgba(0,0,0,0.18)"
            strokeWidth={isPolo ? 8 : 6}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
        {isBack && !isSleeve && <path d="M250 113 L250 545" stroke="rgba(0,0,0,0.06)" strokeWidth="2" />}
        <rect
          x={printX}
          y={printY}
          width={printWidth}
          height={printHeight}
          rx="3"
          fill="none"
          stroke={color.text}
          strokeDasharray="9 7"
          strokeOpacity="0.38"
          strokeWidth="2"
        />
      </g>
    </svg>
  );
}

export default function CustomMockupStudio() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasShellRef = useRef<HTMLDivElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<fabric.Canvas | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<ProductOption>(PRODUCTS[0]);
  const [selectedColor, setSelectedColor] = useState<ColorOption>(COLORS[0]);
  const [placement, setPlacement] = useState<PlacementId>("front");
  const [sizeQuantities, setSizeQuantities] = useState<Record<string, number>>({
    S: 0,
    M: 4,
    L: 4,
    XL: 2,
    XXL: 0,
  });
  const [contact, setContact] = useState({
    name: "",
    phone: "",
    email: "",
    deliveryLocation: "",
    notes: "",
  });
  const [fileName, setFileName] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [canvasHasObjects, setCanvasHasObjects] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedOrderId, setSubmittedOrderId] = useState<string | null>(null);
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);
  const isRestoringRef = useRef(false);

  const totalQuantity = useMemo(
    () => Object.values(sizeQuantities).reduce((sum, value) => sum + value, 0),
    [sizeQuantities]
  );

  const selectedSizes = useMemo(
    () =>
      SIZES.filter((size) => sizeQuantities[size] > 0).map(
        (size) => `${size} x ${sizeQuantities[size]}`
      ),
    [sizeQuantities]
  );

  const isMinimumMet = totalQuantity >= MINIMUM_QUANTITY;
  const activeMockupAsset = useMemo(
    () => getMockupAsset(selectedProduct.id, selectedColor.name, placement),
    [selectedProduct.id, selectedColor.name, placement]
  );

  const updateCanvasState = useCallback(
    (canvas: fabric.Canvas) => {
      setCanvasHasObjects(canvas.getObjects().length > 0);
      if (isRestoringRef.current) return;
      setUndoStack((prev) => [...prev.slice(-19), JSON.stringify(canvas.toJSON())]);
      setRedoStack([]);
    },
    []
  );

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: 340,
      height: 420,
      backgroundColor: "transparent",
      preserveObjectStacking: true,
      selectionColor: "rgba(166, 139, 92, 0.16)",
      selectionBorderColor: "#A68B5C",
      selectionLineWidth: 1,
    });

    setFabricCanvas(canvas);
    setUndoStack([JSON.stringify(canvas.toJSON())]);

    const handleChange = () => updateCanvasState(canvas);
    const handleSelection = () => setCanvasHasObjects(canvas.getObjects().length > 0);

    canvas.on("object:added", handleChange);
    canvas.on("object:modified", handleChange);
    canvas.on("object:removed", handleChange);
    canvas.on("selection:created", handleSelection);
    canvas.on("selection:updated", handleSelection);
    canvas.on("selection:cleared", handleSelection);

    return () => {
      canvas.off("object:added", handleChange);
      canvas.off("object:modified", handleChange);
      canvas.off("object:removed", handleChange);
      canvas.off("selection:created", handleSelection);
      canvas.off("selection:updated", handleSelection);
      canvas.off("selection:cleared", handleSelection);
      canvas.dispose();
      setFabricCanvas(null);
    };
  }, [updateCanvasState]);

  const restoreCanvas = (snapshot: string) => {
    if (!fabricCanvas) return;
    isRestoringRef.current = true;
    fabricCanvas.loadFromJSON(snapshot).then(() => {
      fabricCanvas.renderAll();
      setCanvasHasObjects(fabricCanvas.getObjects().length > 0);
      isRestoringRef.current = false;
    });
  };

  const handleUndo = () => {
    if (!fabricCanvas || undoStack.length <= 1) return;
    const nextUndoStack = undoStack.slice(0, -1);
    const current = undoStack[undoStack.length - 1];
    setRedoStack((prev) => [...prev, current]);
    setUndoStack(nextUndoStack);
    restoreCanvas(nextUndoStack[nextUndoStack.length - 1]);
  };

  const handleRedo = () => {
    if (!fabricCanvas || redoStack.length === 0) return;
    const nextSnapshot = redoStack[redoStack.length - 1];
    setRedoStack((prev) => prev.slice(0, -1));
    setUndoStack((prev) => [...prev, nextSnapshot]);
    restoreCanvas(nextSnapshot);
  };

  const addText = (value = "Your text") => {
    if (!fabricCanvas) return;
    const text = new fabric.IText(value, {
      left: 80,
      top: 150,
      fill: selectedColor.text,
      fontFamily: "Instrument Sans",
      fontSize: 34,
      fontWeight: "700",
      textAlign: "center",
      originX: "left",
      originY: "top",
    });
    fabricCanvas.add(text);
    fabricCanvas.setActiveObject(text);
    fabricCanvas.renderAll();
  };

  const addShape = () => {
    if (!fabricCanvas) return;
    const circle = new fabric.Circle({
      left: 126,
      top: 156,
      radius: 46,
      fill: "transparent",
      stroke: selectedColor.text,
      strokeWidth: 5,
    });
    const label = new fabric.Text("THH", {
      left: 152,
      top: 184,
      fill: selectedColor.text,
      fontFamily: "Instrument Sans",
      fontSize: 20,
      fontWeight: "700",
      originX: "center",
      originY: "center",
    });
    const group = new fabric.Group([circle, label], {
      left: 116,
      top: 146,
    });
    fabricCanvas.add(group);
    fabricCanvas.setActiveObject(group);
    fabricCanvas.renderAll();
  };

  const deleteSelected = () => {
    if (!fabricCanvas) return;
    const selected = fabricCanvas.getActiveObjects();
    selected.forEach((object) => fabricCanvas.remove(object));
    fabricCanvas.discardActiveObject();
    fabricCanvas.renderAll();
  };

  const duplicateSelected = async () => {
    if (!fabricCanvas) return;
    const selected = fabricCanvas.getActiveObject();
    if (!selected) return;
    const clone = await selected.clone();
    clone.set({
      left: (selected.left || 0) + 18,
      top: (selected.top || 0) + 18,
    });
    fabricCanvas.add(clone);
    fabricCanvas.setActiveObject(clone);
    fabricCanvas.renderAll();
  };

  const rotateSelected = (direction: "left" | "right") => {
    if (!fabricCanvas) return;
    const selected = fabricCanvas.getActiveObject();
    if (!selected) return;
    selected.rotate((selected.angle || 0) + (direction === "left" ? -15 : 15));
    fabricCanvas.requestRenderAll();
    updateCanvasState(fabricCanvas);
  };

  const scaleSelected = (direction: "up" | "down") => {
    if (!fabricCanvas) return;
    const selected = fabricCanvas.getActiveObject();
    if (!selected) return;
    const factor = direction === "up" ? 1.08 : 0.92;
    selected.scale((selected.scaleX || 1) * factor);
    fabricCanvas.requestRenderAll();
    updateCanvasState(fabricCanvas);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);
    setFileName(file.name);

    if (!file.type.startsWith("image/")) {
      toast.info("File attached. PDF and AI files are sent with the order but are not previewed on the mockup.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const data = readerEvent.target?.result;
      if (!fabricCanvas || typeof data !== "string") return;

      fabric.Image.fromURL(data).then((image) => {
        image.scaleToWidth(190);
        image.set({
          left: 75,
          top: 130,
        });
        fabricCanvas.add(image);
        fabricCanvas.setActiveObject(image);
        fabricCanvas.renderAll();
      });
    };
    reader.readAsDataURL(file);
  };

  const clearFile = () => {
    setUploadedFile(null);
    setFileName("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const updateSizeQuantity = (size: string, nextValue: number) => {
    setSizeQuantities((prev) => ({
      ...prev,
      [size]: Math.max(0, Math.min(999, nextValue)),
    }));
  };

  const exportStudioMockup = async () => {
    if (!fabricCanvas) return null;

    fabricCanvas.discardActiveObject();
    fabricCanvas.renderAll();

    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = 960;
    exportCanvas.height = 1120;
    const ctx = exportCanvas.getContext("2d");
    if (!ctx) return null;

    ctx.fillStyle = "#F1F0EA";
    ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

    const mockupAsset = getMockupAsset(selectedProduct.id, selectedColor.name, placement);
    let exportPrintArea = { x: 315, y: 265, width: 330, height: 450 };

    if (mockupAsset) {
      const mockupImage = await loadCanvasImage(mockupAsset.src);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(96, 145, 768, 780);
      drawContainedImage(ctx, mockupImage, 96, 145, 768, 780);
      exportPrintArea = mockupAsset.printArea.export;
    } else {
      ctx.fillStyle = selectedColor.hex;
      ctx.strokeStyle = "rgba(0, 0, 0, 0.16)";
      ctx.lineWidth = 3;

      ctx.beginPath();
      if (placement.includes("sleeve")) {
        ctx.roundRect(300, 120, 360, 840, 38);
      } else {
        ctx.moveTo(245, 215);
        ctx.bezierCurveTo(268, 150, 340, 120, 480, 140);
        ctx.bezierCurveTo(620, 120, 692, 150, 715, 215);
        ctx.lineTo(835, 400);
        ctx.lineTo(710, 475);
        ctx.lineTo(675, 985);
        ctx.lineTo(285, 985);
        ctx.lineTo(250, 475);
        ctx.lineTo(125, 400);
        ctx.closePath();
      }
      ctx.fill();
      ctx.stroke();
    }

    ctx.fillStyle = "rgba(255,255,255,0.18)";
    ctx.fillRect(exportPrintArea.x, exportPrintArea.y, exportPrintArea.width, exportPrintArea.height);
    ctx.setLineDash([18, 12]);
    ctx.strokeStyle = selectedColor.text;
    ctx.globalAlpha = 0.42;
    ctx.strokeRect(exportPrintArea.x, exportPrintArea.y, exportPrintArea.width, exportPrintArea.height);
    ctx.globalAlpha = 1;
    ctx.setLineDash([]);

    const designDataUrl = fabricCanvas.toDataURL({ format: "png", multiplier: 2 });
    await new Promise<void>((resolve) => {
      const image = new window.Image();
      image.onload = () => {
        ctx.drawImage(
          image,
          exportPrintArea.x - 8,
          exportPrintArea.y - 15,
          exportPrintArea.width + 16,
          exportPrintArea.height + 30
        );
        resolve();
      };
      image.src = designDataUrl;
    });

    ctx.fillStyle = "#2D4033";
    ctx.font = "700 24px Instrument Sans, Arial";
    ctx.fillText(`Custom Print Studio - ${selectedProduct.label}`, 64, 76);
    ctx.font = "400 18px Instrument Sans, Arial";
    ctx.fillText(`${selectedColor.name} / ${getPlacementLabel(placement)} / ${totalQuantity} pieces`, 64, 108);

    return exportCanvas.toDataURL("image/png");
  };

  const downloadMockup = async () => {
    const dataUrl = await exportStudioMockup();
    if (!dataUrl) return;
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = "custom-print-studio-mockup.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Studio mockup downloaded.");
  };

  const validateOrder = () => {
    if (!isMinimumMet) {
      toast.error(`Minimum order quantity is ${MINIMUM_QUANTITY} pieces.`);
      return false;
    }
    if (!selectedProduct || !selectedColor || !placement) {
      toast.error("Choose a product, colour, and print placement.");
      return false;
    }
    if (!canvasHasObjects && !uploadedFile && !contact.notes.trim()) {
      toast.error("Add artwork, text, or order notes before submitting.");
      return false;
    }
    if (!contact.name.trim() || !contact.phone.trim() || !contact.email.trim() || !contact.deliveryLocation.trim()) {
      toast.error("Fill in your contact and delivery details.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validateOrder()) return;

    setIsSubmitting(true);
    try {
      let designFileUrl: string | null = null;

      if (canvasHasObjects) {
        const dataUrl = await exportStudioMockup();
        if (dataUrl) {
          const mockupFile = dataUrlToFile(dataUrl, `custom-print-studio-${Date.now()}.png`);
          designFileUrl = await uploadFileToDesignBucket(mockupFile);
        }
      } else if (uploadedFile) {
        designFileUrl = await uploadFileToDesignBucket(uploadedFile, "uploaded-artwork");
      }

      const textObjects =
        fabricCanvas
          ?.getObjects()
          .filter((object) => object.type === "i-text" || object.type === "text")
          .map((object) => ("text" in object ? String(object.text) : ""))
          .filter(Boolean) || [];

      const notes = [
        contact.notes.trim(),
        fileName ? `Attached file: ${fileName}` : "",
        textObjects.length > 0 ? `Studio text: ${textObjects.join(" / ")}` : "",
        `Product estimate: ${selectedProduct.basePrice}`,
      ]
        .filter(Boolean)
        .join("\n");

      const { data, error } = await supabase
        .from("custom_orders")
        .insert([
          {
            customer_name: contact.name.trim(),
            phone_number: contact.phone.trim(),
            email: contact.email.trim(),
            delivery_location: contact.deliveryLocation.trim(),
            product_type: selectedProduct.id,
            product_color: selectedColor.name,
            sizes: selectedSizes,
            quantity: totalQuantity,
            print_placement: getPlacementLabel(placement),
            custom_text: textObjects.join(" / ") || null,
            order_notes: notes || null,
            design_file_url: designFileUrl,
            status: "Pending",
          },
        ])
        .select("id")
        .single();

      if (error) throw error;

      setSubmittedOrderId(data?.id || "submitted");
      window.scrollTo({ top: 0 });
      toast.success("Custom order submitted.");
    } catch (error: unknown) {
      console.error("Custom studio order error:", error);
      toast.error(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submittedOrderId) {
    return (
      <main className="min-h-screen pt-12">
        <SEOHead
          title="Custom Print Studio"
          description="Create custom printing orders with live apparel mockups, artwork upload, size breakdowns, and delivery details."
          canonical="/custom-studio"
        />
        <section className="container max-w-3xl py-16">
          <motion.div {...fadeInUp} className="border border-border bg-card px-6 py-14 text-center md:px-12">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 text-accent">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h1 className="font-serif text-4xl font-medium italic">Custom order received</h1>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-muted-foreground">
              Your studio mockup and order details have been sent to the production team.
              We will review the artwork, confirm pricing, and request a 50% deposit before work begins.
            </p>
            <p className="mt-5 text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Reference {submittedOrderId.slice(0, 8)}
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Button
                type="button"
                onClick={() => {
                  setSubmittedOrderId(null);
                  setContact({ name: "", phone: "", email: "", deliveryLocation: "", notes: "" });
                  clearFile();
                }}
                className="h-11 rounded-none bg-foreground px-7 text-xs uppercase tracking-[0.14em] text-background hover:bg-foreground/90"
              >
                Create another order
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={downloadMockup}
                className="h-11 rounded-none px-7 text-xs uppercase tracking-[0.14em]"
              >
                <Download className="mr-2 h-4 w-4" />
                Download mockup
              </Button>
            </div>
          </motion.div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background pt-12">
      <SEOHead
        title="Custom Print Studio"
        description="Create custom printing orders with live apparel mockups, artwork upload, size breakdowns, and delivery details."
        canonical="/custom-studio"
      />

      <form onSubmit={handleSubmit} className="container pb-12">
        <motion.section {...fadeInUp} className="grid gap-6 border-b border-border py-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
          <div>
            <p className="technical-label mb-3">Custom Print Studio</p>
            <h1 className="max-w-3xl font-serif text-4xl font-medium italic leading-tight md:text-5xl">
              Build a custom printing order with a live mockup.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">
              Select the garment, set quantities by size, add artwork or text, then submit the order for review.
            </p>
          </div>
          <div className="grid grid-cols-3 border border-border bg-card text-center">
            <div className="border-r border-border px-3 py-4">
              <p className="text-lg font-semibold tabular-nums">{totalQuantity}</p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Pieces</p>
            </div>
            <div className="border-r border-border px-3 py-4">
              <p className="text-lg font-semibold">{getPlacementLabel(placement)}</p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Placement</p>
            </div>
            <div className="px-3 py-4">
              <p className={`text-lg font-semibold ${isMinimumMet ? "text-green-700" : "text-accent"}`}>
                {isMinimumMet ? "Ready" : `${MINIMUM_QUANTITY}+`}
              </p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Minimum</p>
            </div>
          </div>
        </motion.section>

        <section className="grid items-start gap-5 py-6 xl:grid-cols-[290px_minmax(0,1fr)_360px]">
          <aside className="space-y-5 border border-border bg-card p-4">
            <div>
              <div className={labelClass}>Product</div>
              <div className="grid gap-2">
                {PRODUCTS.map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => setSelectedProduct(product)}
                    className={`border px-3 py-3 text-left transition-colors ${
                      selectedProduct.id === product.id
                        ? "border-foreground bg-foreground text-background"
                        : "border-border bg-background hover:border-foreground"
                    }`}
                  >
                    <span className="flex items-center justify-between gap-3">
                      <span className="text-sm font-semibold">{product.label}</span>
                      <span className="text-[10px] uppercase tracking-[0.12em] opacity-75">{product.basePrice}</span>
                    </span>
                    <span className="mt-1 block text-xs opacity-70">{product.description}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className={labelClass}>Colour</div>
              <div className="grid grid-cols-5 gap-2">
                {COLORS.map((color) => (
                  <button
                    key={color.name}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className={`h-10 border transition-transform hover:scale-105 ${
                      selectedColor.name === color.name ? "border-foreground ring-1 ring-foreground" : "border-border"
                    }`}
                    style={{ backgroundColor: color.hex }}
                    aria-label={color.name}
                    title={color.name}
                  />
                ))}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{selectedColor.name}</p>
            </div>

            <div>
              <div className={labelClass}>Print placement</div>
              <div className="grid gap-2">
                {PLACEMENTS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setPlacement(option.id)}
                    className={`border px-3 py-2 text-left transition-colors ${
                      placement === option.id
                        ? "border-foreground bg-secondary"
                        : "border-border bg-background hover:border-foreground"
                    }`}
                  >
                    <span className="block text-sm font-medium">{option.label}</span>
                    <span className="text-xs text-muted-foreground">{option.hint}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className={labelClass}>Artwork tools</div>
              <div className="grid gap-2">
                <button type="button" onClick={() => fileInputRef.current?.click()} className={controlButtonClass}>
                  <Upload className="h-4 w-4" />
                  Upload artwork
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".png,.jpg,.jpeg,.webp,.svg,.pdf,.ai"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button type="button" onClick={() => addText()} className={controlButtonClass}>
                  <Type className="h-4 w-4" />
                  Add text
                </button>
                <button type="button" onClick={addShape} className={controlButtonClass}>
                  <Sparkles className="h-4 w-4" />
                  Add mark
                </button>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {TEXT_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => addText(preset)}
                    className="border border-border px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
                  >
                    {preset}
                  </button>
                ))}
              </div>

              {fileName && (
                <div className="mt-3 flex items-center gap-2 border border-border bg-background p-2">
                  <ImageIcon className="h-4 w-4 shrink-0 text-accent" />
                  <span className="min-w-0 flex-1 truncate text-xs">{fileName}</span>
                  <button type="button" onClick={clearFile} aria-label="Remove uploaded file">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </aside>

          <section className="min-h-[690px] border border-border bg-secondary">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-background px-4 py-3">
              <div>
                <p className="text-sm font-semibold">Live print preview</p>
                <p className="text-xs text-muted-foreground">Drag, resize, rotate, and edit text directly on the garment.</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button type="button" onClick={handleUndo} disabled={undoStack.length <= 1} className={controlButtonClass} aria-label="Undo">
                  <Undo2 className="h-4 w-4" />
                </button>
                <button type="button" onClick={handleRedo} disabled={redoStack.length === 0} className={controlButtonClass} aria-label="Redo">
                  <RotateCw className="h-4 w-4" />
                </button>
                <button type="button" onClick={downloadMockup} className={controlButtonClass}>
                  <Download className="h-4 w-4" />
                  Mockup
                </button>
              </div>
            </div>

            <div className="grid min-h-[620px] place-items-center overflow-hidden p-5">
              <div className="relative h-[560px] w-full max-w-[560px]">
                <GarmentMockup color={selectedColor} productType={selectedProduct.id} placement={placement} />
                <div
                  ref={canvasShellRef}
                  className={`absolute z-10 ${
                    activeMockupAsset
                      ? activeMockupAsset.printArea.desktop
                      : placement.includes("sleeve")
                        ? "left-1/2 top-[22%] h-[320px] w-[260px] -translate-x-1/2"
                        : "left-1/2 top-[25%] h-[360px] w-[300px] -translate-x-1/2"
                  }`}
                >
                  <div className="absolute inset-0 border border-dashed border-foreground/25" />
                  <canvas ref={canvasRef} className="h-full w-full" />
                </div>
              </div>
            </div>

            <div className="grid gap-2 border-t border-border bg-background p-3 sm:grid-cols-6">
              <button type="button" onClick={() => scaleSelected("down")} className={controlButtonClass}>
                <Minus className="h-4 w-4" />
                Scale
              </button>
              <button type="button" onClick={() => scaleSelected("up")} className={controlButtonClass}>
                <Plus className="h-4 w-4" />
                Scale
              </button>
              <button type="button" onClick={() => rotateSelected("left")} className={controlButtonClass}>
                <RotateCcw className="h-4 w-4" />
                Rotate
              </button>
              <button type="button" onClick={() => rotateSelected("right")} className={controlButtonClass}>
                <RotateCw className="h-4 w-4" />
                Rotate
              </button>
              <button type="button" onClick={duplicateSelected} className={controlButtonClass}>
                <Copy className="h-4 w-4" />
                Copy
              </button>
              <button type="button" onClick={deleteSelected} className={controlButtonClass}>
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </div>
          </section>

          <aside className="space-y-5 border border-border bg-card p-4">
            <div>
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-accent" />
                <h2 className="text-sm font-semibold">Order details</h2>
              </div>
              <p className="mt-2 text-xs leading-6 text-muted-foreground">
                Minimum {MINIMUM_QUANTITY} pieces. Final pricing is confirmed after artwork review.
              </p>
            </div>

            <div>
              <div className={labelClass}>Size breakdown</div>
              <div className="space-y-2">
                {SIZES.map((size) => (
                  <div key={size} className="grid grid-cols-[46px_1fr_94px] items-center gap-3">
                    <span className="text-sm font-semibold">{size}</span>
                    <div className="h-1.5 bg-secondary">
                      <div
                        className="h-full bg-accent transition-all"
                        style={{ width: `${Math.min(100, (sizeQuantities[size] / Math.max(totalQuantity, 1)) * 100)}%` }}
                      />
                    </div>
                    <input
                      type="number"
                      min={0}
                      value={sizeQuantities[size]}
                      onChange={(event) => updateSizeQuantity(size, Number(event.target.value))}
                      className="h-10 border border-border bg-background px-2 text-right text-sm outline-none focus:border-foreground"
                      aria-label={`${size} quantity`}
                    />
                  </div>
                ))}
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-sm">
                <span>Total quantity</span>
                <span className={`font-semibold tabular-nums ${isMinimumMet ? "" : "text-accent"}`}>
                  {totalQuantity} pieces
                </span>
              </div>
            </div>

            <div className="grid gap-3">
              <div>
                <label htmlFor="name" className={labelClass}>Name</label>
                <input
                  id="name"
                  value={contact.name}
                  onChange={(event) => setContact((prev) => ({ ...prev, name: event.target.value }))}
                  className={inputClass}
                  placeholder="Your full name"
                  required
                />
              </div>
              <div>
                <label htmlFor="phone" className={labelClass}>Phone</label>
                <input
                  id="phone"
                  value={contact.phone}
                  onChange={(event) => setContact((prev) => ({ ...prev, phone: event.target.value }))}
                  className={inputClass}
                  placeholder="024 000 0000"
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className={labelClass}>Email</label>
                <input
                  id="email"
                  type="email"
                  value={contact.email}
                  onChange={(event) => setContact((prev) => ({ ...prev, email: event.target.value }))}
                  className={inputClass}
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div>
                <label htmlFor="deliveryLocation" className={labelClass}>Delivery location</label>
                <input
                  id="deliveryLocation"
                  value={contact.deliveryLocation}
                  onChange={(event) => setContact((prev) => ({ ...prev, deliveryLocation: event.target.value }))}
                  className={inputClass}
                  placeholder="Accra, East Legon"
                  required
                />
              </div>
              <div>
                <label htmlFor="notes" className={labelClass}>Production notes</label>
                <textarea
                  id="notes"
                  value={contact.notes}
                  onChange={(event) => setContact((prev) => ({ ...prev, notes: event.target.value }))}
                  className="min-h-28 w-full resize-none border border-border bg-background px-3 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-foreground"
                  placeholder="Tell us about print finish, deadline, event name, or artwork instructions."
                />
              </div>
            </div>

            <div className="border border-border bg-background p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center bg-secondary">
                  <Shirt className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{selectedProduct.label} in {selectedColor.name}</p>
                  <p className="text-xs text-muted-foreground">{getPlacementLabel(placement)} print, {totalQuantity} pieces</p>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-12 w-full rounded-none bg-foreground text-xs font-semibold uppercase tracking-[0.14em] text-background hover:bg-foreground/90"
            >
              {isSubmitting ? (
                <>
                  Submitting
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                </>
              ) : (
                <>
                  Submit custom order
                  <Send className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </aside>
        </section>
      </form>
    </main>
  );
}
