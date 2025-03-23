import os
from google import genai
from google.genai import types
from PIL import Image
from io import BytesIO
import base64
import PIL.Image
from dotenv import load_dotenv

load_dotenv()
api_key = os.environ.get('GEMINI_API_KEY')
client = genai.Client(api_key=api_key)

# Load the input image
image = PIL.Image.open("head.png")

# Define the text prompt for modifying the image
text_input = "Turn this person's head with electrodes on top into an interconnected network of wires that connect to each electrode and form a hat-looking structure."

# Call the Gemini API for image modification
response = client.models.generate_content(
    model="gemini-2.0-flash-exp-image-generation",
    contents=[text_input, image],  # Pass text and image directly
    config=types.GenerateContentConfig(
        response_modalities=['Text', 'Image']  # Request both text and image in response
    )
)

# Process and display the modified image
for part in response.candidates[0].content.parts:
    if part.text is not None:
        print(part.text)
    elif part.inline_data is not None:
        modified_image = Image.open(BytesIO(part.inline_data.data))
        modified_image.show()  # Display the modified image