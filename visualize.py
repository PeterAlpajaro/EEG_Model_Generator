import open3d as o3d
import numpy as np

def create_sphere(center, radius=1, color=[1, 0, 0]):
    mesh_sphere = o3d.geometry.TriangleMesh.create_sphere(radius=radius)
    mesh_sphere.translate(center)
    mesh_sphere.paint_uniform_color(color)
    return mesh_sphere

import open3d as o3d
import numpy as np

def create_labels(points, scale=0.5, offset=5):
    labels = []
    for i, point in enumerate(points):
        # Create text mesh with proper parameters
        text = o3d.t.geometry.TriangleMesh.create_text(
            text=f"{i+1}", 
            depth=0.1  # Extrusion depth (not height)
        )
        
        # Scale and position the text
        text.scale(scale, center=text.get_center())
        text.translate(point + np.array([0, offset, 0]))  # Y-offset
        
        label_legacy = text.to_legacy()

        # Change color to black
        label_legacy.paint_uniform_color([0, 0, 0])  # RGB for black

        # Convert to legacy format for visualization
        labels.append(label_legacy)
    return labels

# Load your point cloud data
xyz_data = np.loadtxt("landmarks.xyz")
pcd = o3d.geometry.PointCloud()
pcd.points = o3d.utility.Vector3dVector(xyz_data)

# Create a list to store spheres (labels)
spheres = []

# Create a small sphere for each point
for i, point in enumerate(xyz_data):
    sphere = create_sphere(point, radius=2, color=[1, 0, 0])  # Red spheres
    spheres.append(sphere)

# Create labels and adjust parameters
labels = create_labels(xyz_data, scale=0.5, offset=5)

# Visualize with labels
o3d.visualization.draw_geometries([pcd] + labels + spheres, mesh_show_back_face=True)
