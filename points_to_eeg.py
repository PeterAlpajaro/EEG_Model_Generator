import numpy as np
import trimesh

def create_eeg_scene_and_export(output_file, eeg_points):
    """
    Creates a 3D scene with a head model and EEG electrodes, then exports it as an STL file.

    Parameters:
    output_file (str): Path to save the STL file.
    eeg_points (np.array): Array of 3D coordinates for EEG sensor locations.
    """

    # Load meshes
    head_mesh = trimesh.load_mesh('head_model.stl')
    electrode_mesh = trimesh.load_mesh('electrode.stl')

    # Scale electrode appropriately (adjust based on your electrode model)
    electrode_mesh.apply_scale(0.0001)  # More reasonable scaling

    scene = trimesh.Scene()
    scene.add_geometry(head_mesh)

    for point in eeg_points:
        # Find closest point and normal
        closest_point, _, triangle_id = head_mesh.nearest.on_surface([point])
        normal = head_mesh.face_normals[triangle_id[0]].flatten()
        
        if normal.shape != (3,):
            continue

        # Create electrode instance
        electrode = electrode_mesh.copy()
        
        # Create rotation to align electrode with surface normal
        # First check electrode's inherent orientation
        # If electrode's "contact surface" faces +Z, use [0,0,1]
        # If it faces another direction, adjust accordingly
        rotation = trimesh.geometry.align_vectors(
            [0, 1, 0],  # Electrode's inherent "up" direction
            normal       # Target normal direction
        )
        
        # Apply rotation first
        electrode.apply_transform(rotation)
        
        # Then apply translation offset by half the electrode height
        # This ensures the base of the electrode touches the head surface
        electrode_height = electrode.bounds[1][2] - electrode.bounds[0][2]
        offset_position = closest_point[0] - normal * (electrode_height / 2)
        electrode.apply_translation(offset_position)

        scene.add_geometry(electrode)

    #scene.show()

    # Export combined mesh
    combined_mesh = trimesh.util.concatenate(scene.dump())
    combined_mesh.export(output_file)
