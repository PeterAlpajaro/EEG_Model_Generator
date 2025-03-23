import open3d as o3d
import numpy as np
import pyvista as pv
import stl_reader
import numpy as np

# Find the z-level of the neck.
# We can do this by finding the level with the smallest area.
def find_neck_y(vertices):

    y_values = vertices[:, 1]  # Extract all y coordinates
    sorted_vertices_y = vertices[vertices[:, 2].argsort()]

    min_x_diff = 1000000000
    min_x_diff_index = -1
    # Loop through blocks of vertices.
    block_size = 10
    for i in range(0, len(sorted_vertices_y), block_size):
        # Find the largest and smallest x_value in that block
        largest_x = np.max(sorted_vertices_y[i:i+block_size, 0])
        smallest_x = np.min(sorted_vertices_y[i:i+block_size, 0])
        print(largest_x, smallest_x)
        # Find the difference in x values
        x_diff = largest_x - smallest_x
        if x_diff < min_x_diff:
            min_x_diff = x_diff
            min_x_diff_index = i
    return sorted_vertices_y[min_x_diff_index][2]

def find_nose_and_back_of_head(vertices, neck_height, midline_tolerance=0.2, visualize=True):
    """
    Find the nose and back of head points from an STL model of a human head and shoulders.
    
    Parameters: TODO: UPDATE
    stl_file_path (str): Path to the STL file
    neck_height_percentage (float): Percentage of height from bottom where the neck is located
    midline_tolerance (float): Tolerance for considering points near the midline (as a percentage of total y-width)
    visualize (bool): Whether to visualize the results (requires PyVista)
    
    Returns:
    tuple: (nose_point, back_head_point)
    """
    print(vertices.shape)
    y_values = vertices[:, 1]

    # Filter vertices that are above the neck
    above_neck_mask = y_values > neck_height
    if not np.any(above_neck_mask):
        print("No vertices found above the calculated neck height. Try reducing the neck_height_percentage.")
        return None, None
    
    vertices_above_neck = vertices[above_neck_mask]
    
    # Find the midline (center in terms of y-coordinate)
    y_values = vertices_above_neck[:, 1]
    y_min, y_max = np.min(y_values), np.max(y_values)
    y_center = (y_min + y_max) / 2
    
    # Define a tolerance range around the midline
    y_range = y_max - y_min
    y_tolerance = midline_tolerance * y_range
    
    # Filter vertices near the midline
    midline_mask = np.abs(vertices_above_neck[:, 1] - y_center) < y_tolerance
    if not np.any(midline_mask):
        print("No vertices found near the midline. Try increasing the midline_tolerance.")
        return None, None
    
    vertices_midline = vertices_above_neck[midline_mask]
    
    # Find the nose (maximum x-coordinate)
    nose_index = np.argmax(vertices_midline[:, 0])
    nose_point = vertices_midline[nose_index]
    
    # Find the back of the head (minimum x-coordinate)
    back_head_index = np.argmin(vertices_midline[:, 0])
    back_head_point = vertices_midline[back_head_index]


    return nose_point, back_head_point

def align_points(original_pts, ref_A, ref_B):
    """
    Aligns two points in a 3D set to reference positions while preserving shape.
    
    Args:
        original_pts: 4x3 array of [A, B, C, D] original points
        ref_A: Target position for point A
        ref_B: Target position for point B
    
    Returns:
        Transformed 4x3 array of points
    """
    A, B = original_pts[0], original_pts[3] # The nasion and inion respectively.
    
    # 1. Translation to origin
    T_origin = np.eye(4)
    T_origin[:3, 3] = -A
    pts_homog = np.column_stack([original_pts, np.ones(4)]).T
    
    # 2. Scaling
    original_dist = np.linalg.norm(B - A)
    target_dist = np.linalg.norm(ref_B - ref_A)
    scale = target_dist / original_dist if original_dist != 0 else 1.0
    S = np.diag([scale, scale, scale, 1])
    
    # 3. Rotation
    v = (B - A) / (original_dist + 1e-8)  # Original direction
    v_prime = (ref_B - ref_A) / (target_dist + 1e-8)  # Target direction
    
    # Axis-angle rotation
    cross = np.cross(v, v_prime)
    dot = np.dot(v, v_prime)
    angle = np.arccos(np.clip(dot, -1.0, 1.0))
    
    if np.linalg.norm(cross) < 1e-8:  # Handle parallel vectors
        R = np.eye(3) if dot > 0 else -np.eye(3)
    else:
        k = cross / np.linalg.norm(cross)
        K = np.array([[0, -k[2], k[1]],
                      [k[2], 0, -k[0]],
                      [-k[1], k[0], 0]])
        R = np.eye(3) + np.sin(angle)*K + (1 - np.cos(angle))*(K@K)
    
    # Convert to 4x4 homogeneous matrix
    R_homog = np.eye(4)
    R_homog[:3, :3] = R
    
    # 4. Final translation
    T_final = np.eye(4)
    T_final[:3, 3] = ref_A
    
    # Combine transformations: T_final * R * S * T_origin
    M = T_final @ R_homog @ S @ T_origin
    
    # Apply transformation to all points
    transformed = (M @ pts_homog).T[:, :3]
    
    # 5. Additional rotation around AD axis
    AD_vector = ref_B - ref_A
    AD_length = np.linalg.norm(AD_vector)
    if AD_length < 1e-8:
        return transformed  # No rotation possible
    
    # Get current CB vector from transformed points
    CB_vector = transformed[1] - transformed[2]  # B - C
    
    # Calculate current cross product and desired direction
    current_cross = np.cross(AD_vector, CB_vector)
    current_cross_norm = np.linalg.norm(current_cross)
    if current_cross_norm < 1e-8:
        return transformed
    
    AD_dir = AD_vector / AD_length
    current_cross_dir = current_cross / current_cross_norm
    desired_dir = np.array([0, 1, 0])  # Y-axis

    # Calculate rotation angle and axis
    desired_proj = desired_dir - np.dot(desired_dir, AD_dir) * AD_dir
    desired_proj_norm = np.linalg.norm(desired_proj)
    if desired_proj_norm < 1e-8:
        return transformed
    
    desired_proj_dir = desired_proj / desired_proj_norm
    dot = np.dot(current_cross_dir, desired_proj_dir)
    angle = np.arccos(np.clip(dot, -1.0, 1.0))
    
    # Determine rotation direction
    cross_product = np.cross(current_cross_dir, desired_proj_dir)
    angle *= np.sign(np.dot(cross_product, AD_dir))

    # Create rotation matrix using Rodrigues' formula
    K = np.array([[0, -AD_dir[2], AD_dir[1]],
                  [AD_dir[2], 0, -AD_dir[0]],
                  [-AD_dir[1], AD_dir[0], 0]])
    R_extra = np.eye(3) + np.sin(angle)*K + (1-np.cos(angle))*(K@K)

    # Apply rotation about ref_A
    T1 = np.eye(4); T1[:3, 3] = -ref_A
    T2 = np.eye(4); T2[:3, 3] = ref_A
    M_extra = T2 @ np.block([[R_extra, np.zeros((3,1))], [np.zeros(3), 1]]) @ T1
    
    return (M_extra @ np.column_stack([transformed, np.ones(4)]).T).T[:, :3]

def get_scaled_reference_points(stl_file, original_pts):
    stl_file = "head_model.stl"

    # Step 1: Read the STL file
    try:
        vertices, indices = stl_reader.read(stl_file)
    except Exception as e:
        print(f"Error reading STL file: {e}")

    print(vertices)    
    
    neck_height = find_neck_y(vertices)

    #Now we want to reorient the model so that the nasion is facing towards the postiive x-axis
    #and the inion is facing towards the negative x-axis.

    # We can determine which axis is shoulder-left-to-right by finding the extremeities distances.

    if shoulder_along_z():
        # Rotate the model so that the nasion is facing towards postive/negative x-axis
        D = np.array([0, 0, 1])

    
    nose, back_head = find_nose_and_back_of_head(vertices, neck_height)
    
    print("Nose, back of head found, moving on")   

    if nose is not None and back_head is not None:
        print(f"Nose point: {nose}")
        print(f"Back of head point: {back_head}")
        
        # Calculate distance between nose and back of head
        distance = np.linalg.norm(nose - back_head)
        print(f"Distance between nose and back of head: {distance}")
    
    # Our nose point and our back of head point are our reference points.
    ref_A = nose
    ref_D = back_head

    # Align the points to the reference positions
    new_pts = align_points(original_pts, ref_A, ref_D)

    print("Points Scaled, saving to aligned_points.xyz")

    # Save the aligned points
    np.savetxt("aligned_points.xyz", new_pts)

    # VISUALIZATION -----------------------------------------------------------

    # # Display the aligned points in 3D along with the original Mesh.

    # # Display the mesh
    # mesh = stl_reader.read_as_mesh(stl_file)
    # plotter = pv.Plotter()
    # plotter.add_mesh(mesh, opacity=0.5)
            
    # # Neck plane visualization
    # bounds = mesh.bounds
    # neck_plane = pv.Plane(
    #     center=[(bounds[0]+bounds[1])/2, neck_height, (bounds[4]+bounds[5])/2],
    #     direction=[0, 1, 0],
    #     i_size=(bounds[1]-bounds[0])*1.2,
    #     j_size=(bounds[5]-bounds[4])*1.2
    #     )
    # plotter.add_mesh(neck_plane, color='red', opacity=0.3)

    # labels = ["Nasion", "Preauricular L", "Preauricular R", "Inion"]

    # # Add aligned points
    # i = 0
    # for point in new_pts: 
    #     plotter.add_mesh(pv.PolyData([point]), color='green', point_size=10)
    #     plotter.add_point_labels([point], [labels[i]], font_size=14)
    #     i+=1
    # plotter.show()

    # ---------------------------------------------------------------------------
    return 3


# Determine whether the shoulders are along the z-axis
def shoulder_along_z(vertices):
    # We can check this by finding the distance along z and seeing if the maximum is larger than the distance along x.
    #First, sort the vertices by y
    sorted_vertices_y = vertices[vertices[:, 1].argsort()]
    #Now, in blocks, find the z and x distance between points.

    #Finally, take this data and 

    return False