import numpy as np
from stl import mesh
import stl_reader
import pyvista as pv
import trimesh
from scipy.spatial.transform import Rotation as R
# Places the electrodes in the given locations from the 10-20 electrode placement system
# The electrodes should be placed on the surface of the head model such the the negative y direction of
# the electrode is pointing towards the center of the head model.
# The model will always be facing towards the positive x direction and the top of the head will be in the postive y direction.
# Parameters:
    # ten_twenty_locations (list): List of strings representing the locations on the 10-20 system.
    # stl_file_path (str): Path to the STL file of the head model.
    # scaled_ref_points (list): List of 4 points representing the scaled reference points, corresponding to:
        # (nasion, left ear, right ear, inion)
# Returns:
    # final_electrode_path (str): Path to the STL file of the positioned electrodes this should be seperate from the head.
def place_electrodes(ten_twenty_locations, stl_file_path, scaled_ref_points):
    electrode_model_path = "electrode.stl"
    head_mesh = mesh.Mesh.from_file(stl_file_path)
    
    # Load the same STL file using PyVista for intersection operations
    pv_head_mesh = pv.read(stl_file_path)

    electrode_meshes = []
    
    # Extract reference points
    nasion, left_ear, right_ear, inion = [np.array(p) for p in scaled_ref_points]
    
    # Calculate head coordinate system
    head_center = (nasion + left_ear + right_ear + inion) / 4
    sagittal_axis = inion - nasion
    coronal_axis = right_ear - left_ear

    # Normalize axes
    sagittal_axis /= np.linalg.norm(sagittal_axis)
    coronal_axis /= np.linalg.norm(coronal_axis)
    vertical_axis = np.cross(sagittal_axis, coronal_axis)


    # Load electrode model
    electrode = mesh.Mesh.from_file(electrode_model_path)

    # Scale down electrodes
    electrode_center = np.mean(electrode.vectors.reshape(-1, 3), axis=0)
    electrode.vectors -= electrode_center  # Translate to origin
    electrode.vectors /= 10000               # Scale down

    # If we start with a vector <1, 0, 0> from the head, we can rotate it to where it's supposed to be depending on the given inputs
    for point in ten_twenty_locations:
        coronal_axis_angle = point[0]
        sagittal_axis_angle = point[1]

        intersection_vector = np.array([1, 0, 0])
        
        # Rotate the vector about the coronal axis
        rotation_matrix_coronal = np.array([
            [1, 0, 0],
            [0, np.cos(coronal_axis_angle), -np.sin(coronal_axis_angle)],
            [0, np.sin(coronal_axis_angle), np.cos(coronal_axis_angle)]
        ])
        intersection_vector = np.dot(rotation_matrix_coronal, intersection_vector)

        # Rotate the vector about the sagittal axis
        rotation_matrix_sagittal = np.array([
            [np.cos(sagittal_axis_angle), 0, np.sin(sagittal_axis_angle)],
            [0, 1, 0],
            [-np.sin(sagittal_axis_angle), 0, np.cos(sagittal_axis_angle)]
        ])
        intersection_vector = np.dot(rotation_matrix_sagittal, intersection_vector)

        # Find the intersection point with the head mesh.
        surface_point = ray_mesh_intersection(pv_head_mesh, head_center, intersection_vector)

        # Align the electrode such that its y axis aligns with the intersection vector
        
        # Move the electrode to this position
        transformed_electrode = mesh.Mesh(electrode.data.copy())
        transformed_electrode.translate(surface_point)

        # Assuming intersection_vector is already normalized
        # Rotate the electrode to align its y-axis with the intersection vector
        current_y_axis = np.array([0, 1, 0])
        rotation_axis = np.cross(current_y_axis, intersection_vector)
        rotation_angle = np.arccos(np.dot(current_y_axis, intersection_vector))
        rotation_quaternion = R.from_rotvec(rotation_angle * rotation_axis).as_quat()

        transformed_electrode.apply_rotation(rotation_quaternion)

        electrode_meshes.append(transformed_electrode)

    # Combine all transformed meshes into a single STL file
    final_mesh = mesh.Mesh(np.concatenate([e.data for e in electrode_meshes]))
    final_mesh.save("placed_electrodes.stl")

    return "placed_electrodes.stl"

# Helper functions ------------------------------------------------------------


def ray_mesh_intersection(mesh, ray_origin, ray_direction):
    """
    Find the closest mesh vertex to a line that's above the Y-coordinate of the ray origin.
    
    Args:
        mesh: Trimesh mesh object
        ray_origin: (3,) array - line origin point
        ray_direction: (3,) array - line direction vector
    
    Returns:
        (3,) array or None: Closest vertex coordinates or None if none found
    """
    # Get all mesh vertices
    vertices = mesh.vertices
    
    # Filter vertices above the ray origin's Y-coordinate
    y_threshold = ray_origin[1]
    above_vertices = vertices[vertices[:, 1] > y_threshold]
    
    if len(above_vertices) == 0:
        return None
    
    # Find closest vertex to the line using vector projection
    line_vec = ray_direction / np.linalg.norm(ray_direction)
    closest_distances = []
    
    for vertex in above_vertices:
        # Vector from ray origin to vertex
        vec_to_vertex = vertex - ray_origin
        
        # Project onto line direction
        projection = np.dot(vec_to_vertex, line_vec)
        
        # Closest point on line to this vertex
        closest_point = ray_origin + projection * line_vec
        
        # Calculate distance between vertex and line
        distance = np.linalg.norm(vertex - closest_point)
        closest_distances.append(distance)
    
    # Find index of closest vertex
    closest_idx = np.argmin(closest_distances)
    
    return above_vertices[closest_idx]

# Start by visualizing the STL and the reference points
def visualize(stl_file_path, scaled_ref_points, electrode_points, electrode_mesh=None):
    # Display the aligned points in 3D along with the original Mesh.

    # Display the mesh
    mesh = stl_reader.read_as_mesh(stl_file_path)
    plotter = pv.Plotter()
    plotter.add_mesh(mesh, opacity=0.5)
            
    labels = ["Nasion", "Preauricular L", "Preauricular R", "Inion"]

    # Add aligned points
    i = 0
    for point in scaled_ref_points: 
        plotter.add_mesh(pv.PolyData([point]), color='green', point_size=10)
        plotter.add_point_labels([point], [labels[i]], font_size=14)
        i+=1

    #Add electrode points
    for point in electrode_points:
        plotter.add_mesh(pv.PolyData([point]), color='red', point_size=10)
        plotter.add_point_labels([point], ["Electrode"], font_size=14)

    # Add electrode mesh
    if electrode_mesh is not None:
        plotter.add_mesh(electrode_mesh, color='red', opacity=0.5)

    plotter.show()

if __name__ == "__main__":
    #Get points from aligned_points.xyz
    aligned_points = np.loadtxt("aligned_points.xyz")

    # Find the electrode positions and display these points
    electrode_positions = []

    
    head_mesh = mesh.Mesh.from_file('input_gltf/peter_test.stl')
    
    # Load the same STL file using PyVista for intersection operations
    trimesh_head_mesh = trimesh.load_mesh('input_gltf/peter_test.stl')

    electrode_meshes = []
    
    # Extract reference points
    nasion, left_ear, right_ear, inion = [np.array(p) for p in aligned_points]
    
    # Calculate head coordinate system
    head_center = (nasion + left_ear + right_ear + inion) / 4


    # If we start with a vector <1, 0, 0> from the head, we can rotate it to where it's supposed to be depending on the given inputs
    for point in np.array([[np.pi, 0.05], [np.pi / 4, 0.05]]):

        intersection_vector = np.array([0, 1, 0])
        
        # Find the appropriate location
        point = head_center + np.array([np.cos(point[0]), 0, np.sin(point[0])]) * point[1]
        print(point)

        #visualize('input_gltf/peter_test.stl', aligned_points, [point])

        # Find the intersection point with the head mesh.
        surface_point = ray_mesh_intersection(trimesh_head_mesh, point, intersection_vector)

        print(surface_point)
        #visualize('input_gltf/peter_test.stl', aligned_points, [surface_point])


        if (surface_point is not None):
            print(len(surface_point))
            electrode_positions.append(surface_point)
    
    # Final list of points and visualiations TODO: REMOVE AFTER FUNCTION IMPLEMENTATION
    electrode_points = np.array(electrode_positions)
    visualize("input_gltf/peter_test.stl", aligned_points, electrode_points)

    #Now that we have our points....

    # For each point, we can generate the electrode stl
    electrode_model_path = "electrode.stl"
    electrode_mesh = mesh.Mesh.from_file(electrode_model_path)
    
    #Scale down electrodes by 1600 times
    electrode_mesh.vectors -= np.mean(electrode_mesh.vectors.reshape(-1, 3), axis=0)  # Translate to origin
    electrode_mesh.vectors /= 7000

    for point in electrode_points:
        transformed_electrode = mesh.Mesh(electrode_mesh.data.copy())
        transformed_electrode.center = [0, 0, 0]

        default_direction = np.array([0, -1, 0])

        # Calculate direction vector from electrode to center
        direction = head_center - point

        rotation_axis = np.cross(default_direction, direction)
        if np.linalg.norm(rotation_axis) > 1e-6:  # Check if cross product is not zero
            
            # Calculate rotation angle
            angle = np.arccos(np.dot(default_direction, direction))
            
            # Rotate the mesh around the point
            transformed_electrode.rotate(rotation_axis, angle)
        transformed_electrode.translate(point)
        electrode_meshes.append(transformed_electrode)


    # Combine all transformed meshes into a single STL file
    final_mesh = mesh.Mesh(np.concatenate([e.data for e in electrode_meshes]))

    # Save the final mesh as STL
    final_mesh.save("placed_electrodes.stl")


    # VISUALIZATION -----------------------------------------------------------

    peter_mesh = mesh.Mesh.from_file("input_gltf/peter_test.stl")

    import tempfile

    # Convert final_mesh to PyVista format
    with tempfile.NamedTemporaryFile(suffix='.stl') as tmp:
        final_mesh.save(tmp.name)
        pv_final_mesh = pv.read(tmp.name)

    # Convert peter_mesh to PyVista format
    with tempfile.NamedTemporaryFile(suffix='.stl') as tmp:
        peter_mesh.save(tmp.name)
        pv_peter_mesh = pv.read(tmp.name)

    # Create a plotter
    p = pv.Plotter()

    # Add both meshes to the plotter with different colors
    p.add_mesh(pv_final_mesh, color='red', opacity=0.8)
    p.add_mesh(pv_peter_mesh, color='blue', opacity=0.6)

    # Add points for the head center
    p.add_mesh(pv.PolyData(head_center), color='green', point_size=10)


    # Set up the view
    p.view_isometric()
    p.show_grid()

    # Display the plot
    p.show()
    visualize("input_gltf/peter_test.stl", aligned_points, electrode_points, pv_final_mesh)

    # ---------------------------------------------------------------------------


   
