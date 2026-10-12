import os
import glob
# pyrefly: ignore [missing-import]
from PIL import Image

def get_dominant_color(image_path):
    try:
        img = Image.open(image_path).convert('RGB')
        # Resize for faster processing
        img = img.resize((50, 50))
        # Get pixels in the center area (where the flowers typically are)
        w, h = img.size
        center_crop = img.crop((w * 0.2, h * 0.2, w * 0.8, h * 0.8))
        pixels = list(center_crop.getdata())
        
        # Color buckets
        # Red, Pink, Blue, Purple, Yellow, Orange, White/Cream, Green, Black
        r_sum = sum(p[0] for p in pixels)
        g_sum = sum(p[1] for p in pixels)
        b_sum = sum(p[2] for p in pixels)
        n = len(pixels)
        avg_r = r_sum / n
        avg_g = g_sum / n
        avg_b = b_sum / n

        # Check color dominance
        color_counts = {
            'red': 0, 'pink': 0, 'blue': 0, 'purple': 0,
            'yellow': 0, 'orange': 0, 'white': 0, 'pastel': 0
        }
        for r, g, b in pixels:
            # brightness
            brightness = (r + g + b) / 3
            if brightness > 220:
                color_counts['white'] += 1
            elif r > 160 and g < 100 and b < 100:
                color_counts['red'] += 1
            elif r > 180 and g > 110 and b > 140 and r > g and b > g:
                color_counts['pink'] += 1
            elif b > r + 30 and b > g + 20:
                color_counts['blue'] += 1
            elif r > 120 and b > 120 and g < 100:
                color_counts['purple'] += 1
            elif r > 170 and g > 150 and b < 110:
                color_counts['yellow'] += 1
            elif r > 180 and g > 100 and b < 90:
                color_counts['orange'] += 1
            else:
                color_counts['pastel'] += 1

        top_color = max(color_counts, key=color_counts.get)
        return top_color, (int(avg_r), int(avg_g), int(avg_b)), img.size
    except Exception as e:
        return 'unknown', (0,0,0), (0,0)

base_dir = 'public/production'
price_dirs = ['189k', '259k', '279k', '359k', '459k', '559k', '679k']

print(f"{'Price':<8} | {'Flower':<10} | {'Images':<6} | {'Color':<8} | {'Avg RGB':<16} | {'First Image'}")
print("-" * 90)

for p in price_dirs:
    p_path = os.path.join(base_dir, p)
    if not os.path.exists(p_path): continue
    for f in sorted(os.listdir(p_path), key=lambda x: (len(x), x)):
        f_path = os.path.join(p_path, f)
        if not os.path.isdir(f_path) or f.startswith('.'): continue
        imgs = sorted([x for x in os.listdir(f_path) if x.lower().endswith(('.jpg', '.jpeg', '.png', '.webp'))])
        if not imgs: continue
        first_img = os.path.join(f_path, imgs[0])
        col, avg_rgb, size = get_dominant_color(first_img)
        print(f"{p:<8} | {f:<10} | {len(imgs):<6} | {col:<8} | {str(avg_rgb):<16} | {imgs[0][:30]}...")
