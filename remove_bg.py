from rembg import remove
from PIL import Image
import sys

def remove_background(input_path, output_path):
    """Remove background from image"""
    try:
        # Open image
        input_image = Image.open(input_path)
        
        # Remove background
        output_image = remove(input_image)
        
        # Save as PNG with transparency
        output_image.save(output_path, 'PNG')
        
        print(f"Success! Background removed. Saved to: {output_path}")
        return True
    except Exception as e:
        print(f"Error: {str(e)}")
        return False

if __name__ == "__main__":
    input_file = r"C:\Users\Eng Abdullah Sherif\.gemini\antigravity\brain\4e198935-6431-4e4a-b263-7fb960b5a456\uploaded_image_1767972593332.png"
    output_file = r"d:\my_website\public\assets\images\personal-transparent.png"
    
    print("Removing background...")
    remove_background(input_file, output_file)
