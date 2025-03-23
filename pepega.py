import face_alignment
import numpy as np
from skimage import io

def save_to_xyz(preds, filename="landmarks.xyz"):
    # Extract first detected face (shape: (68, 3) for 3D landmarks)
    single_face_landmarks = preds[0]  # 2D array
    np.savetxt(filename, single_face_landmarks, fmt="%.6f")

fa = face_alignment.FaceAlignment(face_alignment.LandmarksType.THREE_D, device='mps')
input = io.imread('000002.jpg')
preds = fa.get_landmarks(input)

# Check if landmarks were detected
if preds is not None:
    # preds is a list of numpy arrays, typically with one array for each detected face
    # Let's assume we're working with the first (or only) detected face
    landmarks_3d = preds[0]  # This is a numpy array of shape (68, 3) for 68 landmarks

    print("3D Facial Landmarks:")
    for i, point in enumerate(landmarks_3d):
        print(f"Landmark {i+1}: ({point[0]:.2f}, {point[1]:.2f}, {point[2]:.2f})")

    # If you want a more compact representation:
    print("\nCompact representation:")
    print(np.array2string(landmarks_3d, precision=2, separator=', '))
else:
    print("No face detected in the image.")

#Save landmarks to .xyz file
save_to_xyz(preds, "landmarks.xyz")



print("Success!")