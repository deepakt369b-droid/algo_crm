import os
import sys

try:
    from rembg import remove
    from PIL import Image
except ImportError:
    print("Installing rembg and pillow...")
    os.system('pip install rembg[cli] pillow')
    from rembg import remove
    from PIL import Image

input_path = r"C:\Users\SAHARA\Downloads\flowline pro logo\flowline pro logo.png"
output_path = r"C:\Users\SAHARA\Downloads\nextcrm-app-main\nextcrm-app-main\public\logo.png"

try:
    input_image = Image.open(input_path)
    output_image = remove(input_image)
    output_image.save(output_path)
    print("Logo processed and saved to", output_path)
    
    output_image.save(output_path.replace('logo.png', 'logo-dark.png'))
    output_image.save(output_path.replace('logo.png', 'logo-light.png'))
    print("Copied to logo-dark.png and logo-light.png")
except Exception as e:
    print("Error processing logo:", e)
