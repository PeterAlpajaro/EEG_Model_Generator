import numpy as np
from scipy.spatial import KDTree
import trimesh
import os
import re

def display_landmarks_only(xyz_file_path, sphere_radius=0.01, intermediate_ratio=0.75, output_path="landmarks_only.stl"):
    """
    Reads landmarks from an XYZ file and creates a visualization with 9 total landmarks:
    - 4 original landmarks (red)
    - 1 center landmark/centroid (yellow)
    - 4 intermediate landmarks between each original and the center (blue)
    
    Parameters:
    xyz_file_path (str): Path to the .xyz file containing the landmark points
    sphere_radius (float): Radius of the spheres representing landmarks (default: 0.01)
    intermediate_ratio (float): Determines position of intermediate landmarks between 
                               original landmarks and center (0.5 = halfway)
    output_path (str): File path to save the resulting STL file
    
    Returns:
    str: Path to the saved STL file
    """
    try:
        # Read the xyz file as a single line of text
        with open(xyz_file_path, 'r') as f:
            content = f.read().strip()
        
        # Parse the coordinates - Extract all floating point numbers
        coords = re.findall(r'-?\d+\.\d+e[+-]\d+|\d+\.\d+', content)
        
        # Convert to floats
        coords = [float(x) for x in coords]
        
        # We expect exactly 12 values (4 points × 3 coordinates)
        if len(coords) != 12:
            raise ValueError(f"Expected 12 coordinate values (4 points × 3 coordinates). Found {len(coords)}")
            
        # Reshape into 4 points with 3 coordinates each
        original_points = np.array(coords).reshape(4, 3)
        
        print(f"Successfully loaded 4 landmark points from {xyz_file_path}")
        print("Original landmarks:")
        for i, point in enumerate(original_points):
            print(f"Point {i+1}: {point}")
        
    except Exception as e:
        print(f"Error loading XYZ file: {e}")
        raise
    
    # Calculate the center point (centroid) of all original landmarks
    center_point = np.mean(original_points, axis=0)
    print(f"Calculated center point: {center_point}")
    
    # Calculate the intermediate points
    intermediate_points = []
    for i, original in enumerate(original_points):
        # Calculate point that is intermediate_ratio of the way from original to center
        intermediate = original * (1 - intermediate_ratio) + center_point * intermediate_ratio
        intermediate_points.append(intermediate)
        print(f"Intermediate point {i+1}: {intermediate}")
    
    # Create a scene to hold all our meshes
    scene = trimesh.Scene()
    
    # Function to create a sphere at a point
    def create_sphere(point, color, name):
        sphere = trimesh.creation.icosphere(radius=sphere_radius)
        sphere.apply_translation(point)
        sphere.visual.face_colors = color
        return sphere
    
    # Add original landmarks as red spheres
    for i, point in enumerate(original_points):
        sphere = create_sphere(point, [255, 0, 0, 255], f"original_point_{i+1}")
        scene.add_geometry(sphere)
    
    # Add center point as a yellow sphere
    center_sphere = create_sphere(center_point, [255, 255, 0, 255], "center_point")
    scene.add_geometry(center_sphere)
    
    # Add intermediate points as blue spheres
    for i, point in enumerate(intermediate_points):
        sphere = create_sphere(point, [0, 0, 255, 255], f"intermediate_point_{i+1}")
        scene.add_geometry(sphere)
    
    # Export the scene as an STL file
    meshes = list(scene.geometry.values())
    combined_mesh = trimesh.util.concatenate(meshes)
    combined_mesh.export(output_path)
    
    print(f"Final STL file with 9 landmarks (4 original, 1 center, 4 intermediate) saved to: {output_path}")
    
    return output_path

def shift_centered_with_central_target(xyz_file_path, head_mesh_file, electrode_file="electrode.stl", sphere_radius=0.01, intermediate_ratio=0.75, output_path="head_with_electrodes_pointing_center.stl"):
    """
    Creates a symmetric electrode layout with a central electrode and concentric rings of electrodes.
    All peripheral electrodes are oriented to point towards the central electrode.
    Original landmarks are hidden but used to define the head boundary.
    
    Parameters:
    xyz_file_path (str): Path to the .xyz file containing the landmark points
    head_mesh_file (str): Path to the head mesh file
    electrode_file (str): Path to the electrode STL file to use
    sphere_radius (float): Radius of the spheres representing landmarks (default: 0.01)
    intermediate_ratio (float): Determines position of intermediate landmarks between 
                               original landmarks and center (0.75 = 75% toward center)
    output_path (str): File path to save the resulting STL file
    
    Returns:
    str: Path to the saved STL file
    """
    try:
        # Read the xyz file as a single line of text
        with open(xyz_file_path, 'r') as f:
            content = f.read().strip()
        
        # Parse the coordinates - Extract all floating point numbers
        coords = re.findall(r'-?\d+\.\d+e[+-]\d+|\d+\.\d+', content)
        
        # Convert to floats
        coords = [float(x) for x in coords]
        
        # We expect exactly 12 values (4 points × 3 coordinates)
        if len(coords) != 12:
            raise ValueError(f"Expected 12 coordinate values (4 points × 3 coordinates). Found {len(coords)}")
            
        # Reshape into 4 points with 3 coordinates each
        original_points = np.array(coords).reshape(4, 3)
        
        print(f"Successfully loaded 4 landmark points from {xyz_file_path}")
        print("Original landmarks (will be hidden):")
        for i, point in enumerate(original_points):
            print(f"Point {i+1}: {point}")
        
    except Exception as e:
        print(f"Error loading XYZ file: {e}")
        raise
    
    # Load the head mesh
    try:
        head_mesh = trimesh.load(head_mesh_file)
        print(f"Successfully loaded head mesh from {head_mesh_file}")
    except Exception as e:
        print(f"Error loading head mesh: {e}")
        raise
    
    # Load the electrode model
    try:
        electrode_mesh = trimesh.load(electrode_file)
        print(f"Successfully loaded electrode model from {electrode_file}")
        
        # Scale the electrode to an appropriate size
        # Calculate the bounding box of the electrode
        electrode_extents = electrode_mesh.bounding_box.extents
        # Set a target size for the longest dimension
        target_size = sphere_radius * 1.5
        # Calculate scale factor
        scale_factor = target_size / max(electrode_extents)
        # Apply scaling to the electrode mesh
        electrode_mesh.apply_scale(scale_factor)
        
    except Exception as e:
        print(f"Error loading electrode model: {e}")
        raise
    
    # Calculate the central point (centroid) of all original landmarks
    center_point = np.mean(original_points, axis=0)
    print(f"Calculated center point: {center_point}")
    
    # Compute distances from center to establish the outer radius
    distances = [np.linalg.norm(point - center_point) for point in original_points]
    outer_radius = np.mean(distances)
    
    # Create a symmetrical electrode layout with multiple concentric rings
    all_points = []
    
    # Inner ring (closest to center) - 4 electrodes at 90° intervals
    inner_ring_radius = outer_radius * 0.3
    inner_ring_points = []
    for i in range(4):
        angle = 2 * np.pi * i / 4
        x_offset = inner_ring_radius * np.cos(angle)
        z_offset = inner_ring_radius * np.sin(angle)
        new_point = center_point + np.array([x_offset, 0, z_offset])
        inner_ring_points.append(new_point)
    all_points.extend(inner_ring_points)
    
    # Middle ring - 8 electrodes at 45° intervals
    middle_ring_radius = outer_radius * 0.55
    middle_ring_points = []
    for i in range(8):
        angle = 2 * np.pi * i / 8
        x_offset = middle_ring_radius * np.cos(angle)
        z_offset = middle_ring_radius * np.sin(angle)
        new_point = center_point + np.array([x_offset, 0, z_offset])
        middle_ring_points.append(new_point)
    all_points.extend(middle_ring_points)
    
    # Outer ring - 8 electrodes at 45° intervals but none at the bottom
    outer_ring_radius = outer_radius * 0.8
    outer_ring_points = []
    for i in range(7):  # Reduced from 8 to 7 to avoid placing one at the bottom
        angle = 2 * np.pi * i / 7  # Adjusted divisor to ensure even spacing
        
        # Skip any angles that would place an electrode at the bottom
        # This is roughly where z component would be strongly negative
        if -0.5 < np.sin(angle) < 0.9:  # Only place electrodes where z isn't too negative
            x_offset = outer_ring_radius * np.cos(angle)
            z_offset = outer_ring_radius * np.sin(angle)
            new_point = center_point + np.array([x_offset, 0, z_offset])
            outer_ring_points.append(new_point)
    
    all_points.extend(outer_ring_points)
    
    print(f"Created a total of {len(all_points)} electrode points in a symmetric arrangement (excluding central target)")
    
    # Function to shift a point along the Y-axis until it reaches the mesh
    def shift_along_y_until_intersection(point):
        # Create a ray starting from the point in the positive Y-direction
        ray_origin = point
        ray_direction = np.array([0.0, 1.0, 0.0])  # Positive Y-direction
        
        # Use trimesh's ray-mesh intersection
        intersections, index_ray, index_tri = head_mesh.ray.intersects_location(
            ray_origins=[ray_origin],
            ray_directions=[ray_direction]
        )
        
        if len(intersections) > 0:
            # Calculate distances from origin to each intersection
            distances = np.linalg.norm(intersections - ray_origin, axis=1)
            # Get the closest intersection (in case there are multiple)
            closest_idx = np.argmin(distances)
            return intersections[closest_idx]
        else:
            # If no intersection found, return original point
            print(f"Warning: No intersection found for point {point} when projecting along Y-axis. Keeping original position.")
            return point
    
    # Shift each point along Y-axis until it intersects the mesh
    shifted_points = []
    for i, point in enumerate(all_points):
        shifted = shift_along_y_until_intersection(point)
        
        # Calculate direction from center to shifted point (outward direction)
        direction_from_center = shifted - center_point
        if np.linalg.norm(direction_from_center) > 1e-6:
            direction_from_center = direction_from_center / np.linalg.norm(direction_from_center)
            
            # Move the point outward from the head surface
            outward_offset = 0.02  # Amount to move outward from surface
            shifted = shifted + direction_from_center * outward_offset
        
        shifted_points.append(shifted)
        if i < 4:
            print(f"Shifted inner ring point {i+1}: {shifted}")
        elif i < 12:
            print(f"Shifted middle ring point {i-3}: {shifted}")
        else:
            print(f"Shifted outer ring point {i-11}: {shifted}")
    
    # Filter out any electrodes that are positioned too low
    # First, sort the shifted points by their z-coordinate (lowest first)
    sorted_indices = np.argsort([p[2] for p in shifted_points])
    sorted_points = [shifted_points[i] for i in sorted_indices]
    
    # Print information about the lowest points for debugging
    print("\nElectrode z-coordinates (lowest first):")
    for i in range(min(5, len(sorted_points))):
        print(f"  Point {sorted_indices[i]}: z={sorted_points[i][2]}")
    
    # Remove the lowest point if it's significantly lower than the second lowest
    if len(sorted_points) >= 2 and (sorted_points[1][2] - sorted_points[0][2]) > 0.01:
        print(f"Removing electrode at {sorted_points[0]} as it is significantly lower than others")
        shifted_points = [p for i, p in enumerate(shifted_points) if i != sorted_indices[0]]
    
    print(f"After filtering, {len(shifted_points)} electrodes remain")
            
    # Adjust the central target electrode position to stick out more
    central_electrode_outward_offset = 0.025
    central_target_position = center_point + np.array([0, central_electrode_outward_offset, 0])
    
    # Create a scene to hold all our meshes
    scene = trimesh.Scene()
    
    # Add the head mesh to the scene
    scene.add_geometry(head_mesh)
    
    # Create a central target electrode (larger and distinct)
    central_target_electrode = electrode_mesh.copy()
    # Make it larger than regular electrodes
    central_target_electrode.apply_scale(2.5)
    # Position it at the offset center point
    central_target_electrode.apply_translation(central_target_position)
    # Set a distinctive color (purple)
    central_target_electrode.visual.face_colors = [128, 0, 128, 255]  # Purple
    scene.add_geometry(central_target_electrode)
    
    # Function to create an electrode at a point pointing towards the center
    def create_electrode(point, center, color, name):
        # Create a copy of the electrode mesh
        electrode_copy = electrode_mesh.copy()
        
        # Calculate direction from point to center (this is where electrodes will point)
        direction = center - point
        direction = direction / np.linalg.norm(direction)
        
        # Default electrode orientation is along Y-axis
        y_axis = np.array([0.0, 1.0, 0.0])
        
        # Calculate rotation axis and angle
        rotation_axis = np.cross(y_axis, direction)
        
        # Check if rotation_axis is not near-zero
        if np.linalg.norm(rotation_axis) > 1e-6:
            rotation_axis = rotation_axis / np.linalg.norm(rotation_axis)
            rotation_angle = np.arccos(np.clip(np.dot(y_axis, direction), -1.0, 1.0))
            
            # Create rotation matrix
            rotation_matrix = trimesh.transformations.rotation_matrix(
                angle=rotation_angle,
                direction=rotation_axis,
                point=[0, 0, 0]
            )
            
            # Apply rotation
            electrode_copy.apply_transform(rotation_matrix)
        
        # Then translate to the point
        electrode_copy.apply_translation(point)
        
        # Color the electrode
        electrode_copy.visual.face_colors = color
        
        return electrode_copy
    
    # Color definitions
    blue_color = [0, 0, 255, 255]       # Inner ring
    green_color = [0, 255, 0, 255]      # Middle ring
    orange_color = [255, 165, 0, 255]   # Outer ring
    
    # Add electrodes for each valid point, all pointing toward the center
    # Use different colors for points based on their distance from center
    for i, point in enumerate(shifted_points):
        # Calculate distance from center to determine color
        distance = np.linalg.norm(point - center_point)
        
        # Inner ring (closest)
        if distance < (outer_radius * 0.4):
            color = blue_color
            name = f"inner_ring_electrode_{i+1}"
        # Middle ring
        elif distance < (outer_radius * 0.65):
            color = green_color
            name = f"middle_ring_electrode_{i+1}"
        # Outer ring
        else:
            color = orange_color
            name = f"outer_ring_electrode_{i+1}"
            
        # Create and add electrode
        electrode = create_electrode(point, center_point, color, name)
        scene.add_geometry(electrode)
    
    # Export the scene as an STL file
    meshes = list(scene.geometry.values())
    combined_mesh = trimesh.util.concatenate(meshes)
    combined_mesh.export(output_path)
    
    print(f"Final STL file with head model and symmetric electrodes pointing to central target saved to: {output_path}")
    
    return output_path

# # Example usage
# central_electrode_stl = shift_centered_with_central_target(
#     xyz_file_path="aligned_points.xyz",
#     head_mesh_file="head_model.stl",
#     electrode_file="electrode.stl",
#     sphere_radius=0.01,
#     intermediate_ratio=0.5,
#     output_path="head_with_central_target_electrode.stl"
# )

# Example usage of landmarks-only function
# landmarks_only_stl = display_landmarks_only(
#     xyz_file_path="aligned_points.xyz",
#     sphere_radius=0.01,
#     intermediate_ratio=0.75,  # Controls how close intermediate points are to center
#     output_path="landmarks_only.stl"
# )