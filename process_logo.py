from rembg import remove
from PIL import Image
import io

input_path = r'C:\Users\SAHARA\Downloads\flowline pro logo\flowline pro logo.png'
# The output path will be the public directory
output_paths = [
    r'C:\Users\SAHARA\Downloads\nextcrm-app-main\nextcrm-app-main\public\logo.png',
    r'C:\Users\SAHARA\Downloads\nextcrm-app-main\nextcrm-app-main\public\logo-light.png',
    r'C:\Users\SAHARA\Downloads\nextcrm-app-main\nextcrm-app-main\public\logo-dark.png'
]

with open(input_path, 'rb') as i:
    input_data = i.read()
    output_data = remove(input_data)
    
    img = Image.open(io.BytesIO(output_data))
    for path in output_paths:
        img.save(path, format="PNG")

print("Logo processed and saved to public directory.")
