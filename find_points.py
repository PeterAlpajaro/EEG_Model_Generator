import numpy as np
import open3d as o3d

# Load your point cloud data
xyz_data = np.loadtxt("landmarks.xyz")
#xyz_data = xyz_data.asarray(new, dtype=np.float32)


# Extract the important points from the data

nasion = xyz_data[57]  # Nasion (Point 58)
left_preauricular = xyz_data[0]  # Left preauricular point (Point 1)
right_preauricular = xyz_data[16]  # Right preauricular point (Point 17)

# To find the inion, we need to find the point at the back of the head
# Knowing that the point should align along the axis formed between the 
# Left and right auricular points, we can calculate the inion as follows:

# Find the vector betweens between the left and right auricular points.
# Find the midpoint of this vector.
# Find the vector between this midpoint and the nasion.
# Multiply this projection vector by 1.8 to get the anion's location.
# (Found by experimental measurements (Jeremy's head)) 
midpoint = (left_preauricular + right_preauricular) / 2
nasion_midpoint_vec = midpoint - nasion
inion = nasion + nasion_midpoint_vec * 1.8

# Therefore, our reference points are.....
reference_points = np.array([nasion, left_preauricular, right_preauricular, inion])

def create_labels(points, scale=0.5, offset=5):
    labels = []
    for key, value in points.items():
        # Create text mesh with proper parameters
        text = o3d.t.geometry.TriangleMesh.create_text(
            text=key, 
            depth=0.2  # Extrusion depth (not height)
        )
        
        # Scale and position the text
        text.scale(scale, center=text.get_center())
        text.translate(value + np.array([0, offset, 0]))  # Y-offset
        
        label_legacy = text.to_legacy()

        # Change color to black
        label_legacy.paint_uniform_color([0, 0, 0])  # RGB for black

        # Fix: Disable back-face culling
        label_legacy.triangle_material_ids = o3d.utility.IntVector(
            [0] * len(label_legacy.triangles)
        )

        # Convert to legacy format for visualization
        labels.append(label_legacy)
    return labels

reference_points_dictionary = {"Nasion": nasion, "Left Preauricular": left_preauricular, "Right Preauricular": right_preauricular, "Inion": inion}

pcd = o3d.geometry.PointCloud()
pcd.points = o3d.utility.Vector3dVector(reference_points)

# Create labels and adjust parameters
labels = create_labels(reference_points_dictionary, scale=0.5, offset=5)

o3d.visualization.draw_geometries([pcd] + labels, mesh_show_back_face=True)
print(reference_points.shape)

def save_to_xyz(preds, filename="reference_points.xyz"):
    single_face_landmarks = []
    for point in preds:
        single_face_landmarks.append(point)
    np.savetxt(filename, single_face_landmarks, fmt="%.6f")

save_to_xyz(reference_points, "reference_points.xyz")
#In order of Nasion, Left Preauricular, Right Preauricular, Inion