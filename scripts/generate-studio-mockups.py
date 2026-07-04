from __future__ import annotations

import json
from datetime import UTC, datetime
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageOps


ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "public" / "custom-studio-mockups"
CANVAS_SIZE = (960, 1120)
PRODUCTS = [
    {"id": "T-Shirts", "slug": "t-shirts"},
    {"id": "Hoodies", "slug": "hoodies"},
    {"id": "Sleeveless T-Shirts", "slug": "sleeveless-t-shirts"},
    {"id": "Polo Shirts", "slug": "polo-shirts"},
]
COLORS = [
    {"name": "Black", "slug": "black", "hex": "#171412"},
    {"name": "White", "slug": "white", "hex": "#f8f7f2"},
    {"name": "Ash", "slug": "ash", "hex": "#b8b4aa"},
    {"name": "Deep Ash", "slug": "deep-ash", "hex": "#67645e"},
    {"name": "Wine", "slug": "wine", "hex": "#6d2731"},
    {"name": "Army Green", "slug": "army-green", "hex": "#4d5632"},
    {"name": "Cream", "slug": "cream", "hex": "#f3e7cf"},
    {"name": "Purple", "slug": "purple", "hex": "#6d4c92"},
    {"name": "Navy", "slug": "navy", "hex": "#1b2538"},
    {"name": "Red", "slug": "red", "hex": "#b63235"},
]
PLACEMENTS = ["front", "back", "left-sleeve", "right-sleeve"]
PRINT_AREAS = {
    "t-shirts:front": {"desktop": "left-[35.5%] top-[26%] h-[270px] w-[190px]", "export": {"x": 344, "y": 310, "width": 272, "height": 350}},
    "t-shirts:back": {"desktop": "left-[35.5%] top-[26%] h-[270px] w-[190px]", "export": {"x": 344, "y": 310, "width": 272, "height": 350}},
    "t-shirts:left-sleeve": {"desktop": "left-[38%] top-[24%] h-[300px] w-[150px]", "export": {"x": 390, "y": 285, "width": 190, "height": 380}},
    "t-shirts:right-sleeve": {"desktop": "left-[38%] top-[24%] h-[300px] w-[150px]", "export": {"x": 390, "y": 285, "width": 190, "height": 380}},
    "hoodies:front": {"desktop": "left-[32%] top-[25%] h-[230px] w-[220px]", "export": {"x": 330, "y": 292, "width": 300, "height": 300}},
    "hoodies:back": {"desktop": "left-[32%] top-[24%] h-[260px] w-[220px]", "export": {"x": 330, "y": 275, "width": 300, "height": 340}},
    "hoodies:left-sleeve": {"desktop": "left-[37%] top-[22%] h-[320px] w-[170px]", "export": {"x": 380, "y": 260, "width": 220, "height": 415}},
    "hoodies:right-sleeve": {"desktop": "left-[37%] top-[22%] h-[320px] w-[170px]", "export": {"x": 380, "y": 260, "width": 220, "height": 415}},
    "sleeveless-t-shirts:front": {"desktop": "left-[35%] top-[28%] h-[240px] w-[170px]", "export": {"x": 360, "y": 330, "width": 240, "height": 315}},
    "sleeveless-t-shirts:back": {"desktop": "left-[35%] top-[28%] h-[240px] w-[170px]", "export": {"x": 360, "y": 330, "width": 240, "height": 315}},
    "sleeveless-t-shirts:left-sleeve": {"desktop": "left-[36%] top-[23%] h-[310px] w-[175px]", "export": {"x": 374, "y": 270, "width": 225, "height": 410}},
    "sleeveless-t-shirts:right-sleeve": {"desktop": "left-[36%] top-[23%] h-[310px] w-[175px]", "export": {"x": 374, "y": 270, "width": 225, "height": 410}},
    "polo-shirts:front": {"desktop": "left-[35.5%] top-[26%] h-[270px] w-[190px]", "export": {"x": 344, "y": 310, "width": 272, "height": 350}},
    "polo-shirts:back": {"desktop": "left-[35.5%] top-[26%] h-[270px] w-[190px]", "export": {"x": 344, "y": 310, "width": 272, "height": 350}},
    "polo-shirts:left-sleeve": {"desktop": "left-[38%] top-[24%] h-[300px] w-[150px]", "export": {"x": 390, "y": 285, "width": 190, "height": 380}},
    "polo-shirts:right-sleeve": {"desktop": "left-[38%] top-[24%] h-[300px] w-[150px]", "export": {"x": 390, "y": 285, "width": 190, "height": 380}},
}


def hex_to_rgb(value: str) -> tuple[int, int, int]:
    cleaned = value.removeprefix("#")
    return tuple(int(cleaned[index : index + 2], 16) for index in (0, 2, 4))


def resolve_source(product_slug: str, color_slug: str) -> dict[str, object]:
    if product_slug == "hoodies":
        exact = {
            "ash": "src/assets/product-hoodie-ash.jpg",
            "cream": "src/assets/product-hoodie-cream.jpg",
            "white": "src/assets/product-hoodie-cream.jpg",
            "wine": "src/assets/product-hoodie-wine.jpg",
        }
        if color_slug in exact:
            return {"source": exact[color_slug], "mask": "exact", "strength": 0.0}
        return {"source": "src/assets/product-hoodie-wine.jpg", "mask": "wine-garment", "strength": 0.98}

    if product_slug == "sleeveless-t-shirts":
        exact = {
            "black": "src/assets/product-sleeveless-black.jpg",
            "army-green": "src/assets/product-sleeveless-green.jpg",
        }
        if color_slug in exact:
            return {"source": exact[color_slug], "mask": "exact", "strength": 0.0}
        return {"source": "src/assets/product-sleeveless-green.jpg", "mask": "green-garment", "strength": 0.9}

    if color_slug == "black":
        return {"source": "src/assets/product-tee-black.jpg", "mask": "exact", "strength": 0.0}
    return {"source": "src/assets/product-tee-black.jpg", "mask": "dark-garment", "strength": 0.95}


def compose_canvas(source_path: Path) -> Image.Image:
    canvas = Image.new("RGBA", CANVAS_SIZE, "white")
    source = Image.open(source_path).convert("RGBA")
    box_x, box_y, box_w, box_h = 92, 126, 776, 850
    scale = min(box_w / source.width, box_h / source.height)
    draw_size = (round(source.width * scale), round(source.height * scale))
    resized = source.resize(draw_size, Image.Resampling.LANCZOS)
    draw_x = box_x + ((box_w - draw_size[0]) // 2)
    draw_y = box_y + ((box_h - draw_size[1]) // 2)
    canvas.alpha_composite(resized, (draw_x, draw_y))
    return canvas


def crop_to_canvas(source: Image.Image, crop_box: tuple[int, int, int, int], mirror: bool = False) -> Image.Image:
    cropped = source.crop(crop_box)
    if mirror:
        cropped = ImageOps.mirror(cropped)

    canvas = Image.new("RGBA", CANVAS_SIZE, "white")
    max_w, max_h = 700, 860
    scale = min(max_w / cropped.width, max_h / cropped.height)
    draw_size = (round(cropped.width * scale), round(cropped.height * scale))
    resized = cropped.resize(draw_size, Image.Resampling.LANCZOS)
    resized = ImageEnhance.Sharpness(resized).enhance(1.08)
    x = (CANVAS_SIZE[0] - draw_size[0]) // 2
    y = (CANVAS_SIZE[1] - draw_size[1]) // 2
    canvas.alpha_composite(resized, (x, y))
    return canvas


def sample_color(image: Image.Image, box: tuple[int, int, int, int]) -> tuple[int, int, int]:
    region = np.array(image.crop(box).convert("RGB"))
    pixels = region.reshape((-1, 3))
    median = np.median(pixels, axis=0)
    return tuple(int(channel) for channel in median)


def draw_soft_patch(
    image: Image.Image,
    mask_shapes: list[tuple[str, tuple[int, ...]]],
    blur: int = 18,
    surface_blur: int = 22,
) -> Image.Image:
    mask = Image.new("L", image.size, 0)
    draw = ImageDraw.Draw(mask)
    for shape, coordinates in mask_shapes:
        if shape == "ellipse":
            draw.ellipse(coordinates, fill=255)
        elif shape == "polygon":
            points = list(zip(coordinates[0::2], coordinates[1::2]))
            draw.polygon(points, fill=255)
        else:
            draw.rounded_rectangle(coordinates, radius=54, fill=255)

    softened_mask = mask.filter(ImageFilter.GaussianBlur(blur))
    fabric = image.filter(ImageFilter.GaussianBlur(surface_blur))
    return Image.composite(fabric, image, softened_mask)


def draw_fabric_patch(
    image: Image.Image,
    mask_shapes: list[tuple[str, tuple[int, ...]]],
    color_box: tuple[int, int, int, int],
    blur: int = 10,
    opacity: int = 235,
) -> Image.Image:
    color = sample_color(image, color_box)
    patch = Image.new("RGBA", image.size, (*color, opacity))
    mask = Image.new("L", image.size, 0)
    draw = ImageDraw.Draw(mask)
    for shape, coordinates in mask_shapes:
        if shape == "ellipse":
            draw.ellipse(coordinates, fill=255)
        elif shape == "polygon":
            points = list(zip(coordinates[0::2], coordinates[1::2]))
            draw.polygon(points, fill=255)
        else:
            draw.rounded_rectangle(coordinates, radius=28, fill=255)
    return Image.composite(patch, image, mask.filter(ImageFilter.GaussianBlur(blur)))


def make_back_mockup(source: Image.Image, product_slug: str) -> Image.Image:
    back = ImageOps.mirror(source).copy()
    draw = ImageDraw.Draw(back, "RGBA")

    if product_slug == "hoodies":
        back = draw_fabric_patch(
            back,
            [
                ("rounded", (400, 275, 560, 525)),
                ("rounded", (295, 520, 690, 705)),
                ("rounded", (335, 650, 650, 790)),
            ],
            color_box=(385, 410, 600, 560),
            blur=14,
            opacity=245,
        )
        draw = ImageDraw.Draw(back, "RGBA")
        fabric = sample_color(back, (420, 455, 560, 580))
        shadow = tuple(max(0, channel - 42) for channel in fabric)
        highlight = tuple(min(255, channel + 28) for channel in fabric)
        draw.line((482, 175, 482, 335), fill=(*shadow, 24), width=1)
        draw.line((486, 175, 486, 335), fill=(*highlight, 18), width=1)
        draw.arc((330, 260, 635, 455), 20, 160, fill=(*shadow, 22), width=1)
        return ImageEnhance.Sharpness(back).enhance(1.08)

    if product_slug == "sleeveless-t-shirts":
        back = draw_fabric_patch(
            back,
            [
                ("rounded", (405, 265, 565, 545)),
                ("rounded", (335, 535, 650, 745)),
            ],
            color_box=(380, 420, 590, 590),
            blur=12,
            opacity=245,
        )
        draw = ImageDraw.Draw(back, "RGBA")
        fabric = sample_color(back, (425, 390, 540, 580))
        shadow = tuple(max(0, channel - 34) for channel in fabric)
        draw.arc((360, 215, 610, 380), 30, 150, fill=(*shadow, 22), width=1)
        return back

    # T-shirts and polos use the real flat-lay photo; remove the front neck tag
    # and add a subtle rear collar seam so the back side is visibly different.
    back = draw_fabric_patch(
        back,
        [
            ("rounded", (455, 305, 525, 360)),
        ],
        color_box=(410, 380, 555, 520),
        blur=6,
        opacity=245,
    )
    return back


def apply_placement_composition(source: Image.Image, product_slug: str, placement: str) -> Image.Image:
    if placement == "front":
        return source

    if placement == "back":
        return make_back_mockup(source, product_slug)

    crop_boxes = {
        "t-shirts": {
            "left-sleeve": (95, 250, 455, 760),
            "right-sleeve": (505, 250, 865, 760),
        },
        "polo-shirts": {
            "left-sleeve": (95, 250, 455, 760),
            "right-sleeve": (505, 250, 865, 760),
        },
        "hoodies": {
            "left-sleeve": (155, 250, 485, 950),
            "right-sleeve": (475, 250, 805, 950),
        },
        "sleeveless-t-shirts": {
            "left-sleeve": (220, 165, 555, 940),
            "right-sleeve": (405, 165, 740, 940),
        },
    }
    crop_box = crop_boxes.get(product_slug, crop_boxes["t-shirts"])[placement]
    return crop_to_canvas(source, crop_box, mirror=placement == "right-sleeve")


def garment_mask(mask_name: str, rgb: np.ndarray) -> np.ndarray:
    if mask_name == "exact":
        return np.zeros(rgb.shape[:2], dtype=bool)

    yy, xx = np.indices(rgb.shape[:2])
    r = rgb[:, :, 0].astype(float)
    g = rgb[:, :, 1].astype(float)
    b = rgb[:, :, 2].astype(float)
    max_channel = np.maximum.reduce([r, g, b])
    min_channel = np.minimum.reduce([r, g, b])
    darkness = 255 - max_channel
    saturation = max_channel - min_channel

    if mask_name == "dark-garment":
        bounds = (xx >= 90) & (xx <= 870) & (yy >= 240) & (yy <= 930)
        return bounds & (darkness > 22) & (min_channel < 220)

    if mask_name == "wine-garment":
        bounds = (xx >= 95) & (xx <= 870) & (yy >= 105) & (yy <= 1000)
        colored_fabric = (saturation > 18) & (r > g + 7)
        deep_fabric_shadow = (darkness > 135) & (r > g + 4) & (r > b + 3) & (yy < 820)
        return bounds & (colored_fabric | deep_fabric_shadow)

    if mask_name == "green-garment":
        bounds = (xx >= 190) & (xx <= 785) & (yy >= 115) & (yy <= 1010)
        colored_fabric = (saturation > 12) & (g > r * 0.82) & (g > b * 0.82)
        deep_fabric_shadow = (darkness > 145) & (yy < 880)
        return bounds & (colored_fabric | deep_fabric_shadow)

    return np.zeros(rgb.shape[:2], dtype=bool)


def apply_tint(canvas: Image.Image, target_rgb: tuple[int, int, int], mask_name: str, strength: float) -> Image.Image:
    if mask_name == "exact":
        return canvas

    rgba = np.array(canvas).astype(float)
    rgb = rgba[:, :, :3]
    mask = garment_mask(mask_name, rgb)
    if not mask.any():
        return canvas

    r = rgb[:, :, 0]
    g = rgb[:, :, 1]
    b = rgb[:, :, 2]
    luma = (r * 0.299) + (g * 0.587) + (b * 0.114)
    target = np.array(target_rgb, dtype=float)
    target_average = target.mean()

    if target_average > 190:
        shade = np.clip(0.82 + ((luma - 35) / 260), 0.78, 1.05)
    elif target_average > 110:
        shade = np.clip(0.58 + (luma / 260), 0.52, 1.12)
    else:
        shade = np.clip(0.42 + (luma / 210), 0.34, 1.08)

    shaded = np.clip(shade[:, :, None] * target[None, None, :], 0, 255)
    rgba[:, :, :3] = np.where(mask[:, :, None], rgb * (1 - strength) + shaded * strength, rgb)
    return Image.fromarray(np.clip(rgba, 0, 255).astype(np.uint8), "RGBA")


def generate_mockup(product_slug: str, color_slug: str, color_hex: str, placement: str, output: Path) -> None:
    source_config = resolve_source(product_slug, color_slug)
    canvas = compose_canvas(ROOT / str(source_config["source"]))
    tinted = apply_tint(canvas, hex_to_rgb(color_hex), str(source_config["mask"]), float(source_config["strength"]))
    composed = apply_placement_composition(tinted, product_slug, placement)
    composed.convert("RGB").save(output, "PNG", optimize=True)


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    manifest = {"generatedAt": datetime.now(UTC).isoformat(), "products": {}}

    for product in PRODUCTS:
        product_id = product["id"]
        product_slug = product["slug"]
        manifest["products"][product_id] = {}

        for color in COLORS:
            manifest["products"][product_id][color["name"]] = {}

            for placement in PLACEMENTS:
                file_name = f"{product_slug}-{color['slug']}-{placement}.png"
                output = OUT_DIR / file_name
                generate_mockup(product_slug, color["slug"], color["hex"], placement, output)
                manifest["products"][product_id][color["name"]][placement] = {
                    "src": f"/custom-studio-mockups/{file_name}",
                    "objectPosition": "center",
                    "printArea": PRINT_AREAS[f"{product_slug}:{placement}"],
                }

    (OUT_DIR / "manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    print(f"Generated {len(PRODUCTS) * len(COLORS) * len(PLACEMENTS)} studio mockups in {OUT_DIR}")


if __name__ == "__main__":
    main()
