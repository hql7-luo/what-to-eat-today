"""Compose a walkthrough from current-version UI captures; never redraw UI data.

Requires Pillow (pip install Pillow). Run from any working directory:
    python scripts/build_walkthrough.py [--font /path/to/unicode-font.ttf]
The four source captures and their provenance live in public/screenshots/.
"""

from argparse import ArgumentParser
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageOps


ROOT = Path(__file__).resolve().parents[1]
SOURCES = ROOT / "public/screenshots/source"
OUTPUT = ROOT / "public/screenshots/walkthrough.webp"
MOBILE_OUTPUT = ROOT / "public/screenshots/walkthrough-mobile.webp"


def main():
    parser = ArgumentParser(description=__doc__)
    parser.add_argument("--font", type=Path)
    args = parser.parse_args()
    font_paths = [
        args.font,
        Path("/System/Library/Fonts/Supplemental/Arial Unicode.ttf"),
        Path("/usr/share/fonts/truetype/noto/NotoSansCJK-Regular.ttc"),
    ]
    font_path = next((p for p in font_paths if p and p.exists()), None)
    if font_path is None:
        parser.error("Provide --font with a font covering English and Chinese.")

    def font(size):
        return ImageFont.truetype(str(font_path), size)

    ink, muted, accent = "#203329", "#586960", "#426B51"
    canvas = Image.new("RGB", (1600, 1516), "#F7F8F6")
    draw = ImageDraw.Draw(canvas)
    draw.text((48, 30), "WHAT TO EAT TODAY", font=font(43), fill=ink)
    draw.text(
        (48, 90),
        "Preferences → weighted draw → explained meal → local memory",
        font=font(25), fill=muted,
    )

    positions = [(48, 148), (826, 148), (48, 782), (826, 782)]
    labels = [
        ("01", "选择偏好 / Preferences", "预算 · 辣度 · 目标 · 人数 · 时间"),
        ("02", "候选与抽取 / Candidates & draw", "本地规则评分，按权重抽取；动画揭晓结果"),
        ("03", "可解释结果 / Explained result", "菜品 + 为什么推荐 + 确认 / 收藏 / 重抽"),
        ("04", "本机记录 / Local memory", "历史 · 收藏 · 手动常点店铺（页面摘录）"),
    ]
    for (x, y), (number, title, subtitle) in zip(positions, labels):
        draw.rounded_rectangle((x, y, x + 726, y + 600), radius=20,
                               fill="#FFFFFF", outline="#DCE4DC", width=2)
        draw.rounded_rectangle((x + 22, y + 22, x + 74, y + 66), radius=10,
                               fill="#E9F0E8")
        draw.text((x + 32, y + 27), number, font=font(24), fill=accent)
        draw.text((x + 92, y + 24), title, font=font(26), fill=ink)
        draw.text((x + 24, y + 82), subtitle, font=font(21), fill=muted)

    def paste_crop(name, crop, box):
        source = Image.open(SOURCES / name).convert("RGB").crop(crop)
        fitted = ImageOps.contain(source, (box[2], box[3]), Image.Resampling.LANCZOS)
        x = box[0] + (box[2] - fitted.width) // 2
        y = box[1] + (box[3] - fitted.height) // 2
        canvas.paste(fitted, (x, y))

    paste_crop("01-preferences.webp", (150, 296, 1050, 804), (72, 270, 678, 444))
    paste_crop("03-roulette.webp", (0, 0, 1200, 774), (850, 270, 678, 444))
    paste_crop("04-result.webp", (87, 142, 1113, 748), (72, 904, 678, 444))

    # These are three unaltered crops from the same taste page capture.
    # The layout is an explicitly labelled excerpt, not a reconstructed UI.
    paste_crop("05-taste.webp", (495, 675, 1185, 855), (850, 909, 678, 177))
    draw.text((858, 1102), "手动保存 / Saved by user", font=font(18), fill=muted)
    paste_crop("05-taste.webp", (525, 543, 834, 625), (850, 1134, 310, 95))
    paste_crop("05-taste.webp", (525, 909, 835, 1193), (1190, 1095, 310, 253))
    draw.text((858, 1256), "记录只留在当前浏览器", font=font(22), fill=muted)
    draw.text((858, 1295), "Saved in this browser", font=font(20), fill=muted)

    draw.text((48, 1427), "真实界面 · 独立演示操作 · 店铺为虚构示例 · 仅保存在当前浏览器", font=font(22), fill=muted)
    draw.text((48, 1463), "Actual UI captures. Dish images are representative AI assets, not restaurant photographs.", font=font(21), fill=muted)
    canvas.save(OUTPUT, "WEBP", quality=88, method=6)
    print(f"Saved {OUTPUT.name}: {canvas.width} × {canvas.height}, {OUTPUT.stat().st_size:,} bytes")

    # The phone view contains the exact same four panels in one column.
    mobile = Image.new("RGB", (820, 2780), "#F7F8F6")
    mobile_draw = ImageDraw.Draw(mobile)
    mobile_draw.text((48, 28), "WHAT TO EAT TODAY", font=font(36), fill=ink)
    mobile_draw.text((48, 80), "Preferences → weighted draw", font=font(25), fill=muted)
    mobile_draw.text((48, 117), "→ explained meal → local memory", font=font(25), fill=muted)
    for index, ((x, y), (number, title, subtitle)) in enumerate(zip(positions, labels)):
        target_y = 180 + index * 628
        mobile.paste(canvas.crop((x, y, x + 726, y + 600)), (48, target_y))
        # Use larger Chinese step titles above the unchanged UI crops.
        mobile_draw.rectangle((70, target_y + 20, 750, target_y + 117), fill="#FFFFFF")
        mobile_draw.rounded_rectangle((70, target_y + 22, 122, target_y + 66), radius=10, fill="#E9F0E8")
        mobile_draw.text((80, target_y + 27), number, font=font(24), fill=accent)
        zh_title, en_title = title.split(" / ")
        mobile_draw.text((140, target_y + 21), zh_title, font=font(32), fill=ink)
        mobile_draw.text((140, target_y + 62), en_title, font=font(24), fill=muted)
        mobile_draw.text((72, target_y + 96), subtitle, font=font(20), fill=muted)
    mobile_draw.text((48, 2680), "真实 UI · 虚构演示店铺 · 本机保存", font=font(23), fill=muted)
    mobile_draw.text((48, 2720), "Dish images: AI examples, not restaurant photos.", font=font(22), fill=muted)
    mobile.save(MOBILE_OUTPUT, "WEBP", quality=88, method=6)
    print(f"Saved {MOBILE_OUTPUT.name}: {mobile.width} × {mobile.height}, {MOBILE_OUTPUT.stat().st_size:,} bytes")


if __name__ == "__main__":
    main()
