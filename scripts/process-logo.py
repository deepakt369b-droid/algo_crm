import sys
from rembg import remove
from PIL import Image

input_path = r"C:\Users\SAHARA\Downloads\flowline pro logo\flowline pro logo.png"
output_path = r"c:\Users\SAHARA\Downloads\nextcrm-app-main\nextcrm-app-main\public\logo.png"

try:
    input_image = Image.open(input_path)
    output_image = remove(input_image)
    output_image.save(output_path)
    print("Successfully removed background and saved logo.png")
except Exception as e:
    print("Error processing image:", e)
