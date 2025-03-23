# High level controller for the data pipeline
from glb_to_stl import convert_glb_to_stl
from landmarks import find_landmarks
from reference_points import find_reference_points
from reference_point_scaling import get_scaled_reference_points
from electrode_modelling import place_electrodes
from model_generation import shift_centered_with_central_target
# Jeremy's final part

def create_electrodes_stl(glb_file_path, image_file_path):

    # Convert the GLB File to STL Format
    stl_file_path = convert_glb_to_stl(glb_file_path)

    # Get facial landmarks from the image,
    landmarks = find_landmarks(image_file_path)

    # Based on the landmarks, find the 4 reference points of the 10-20 system.
    ref_points = find_reference_points(landmarks)

    # Scale the reference points to the size of the head in the STL file
    final_stl_file_path, scaled_ref_points = get_scaled_reference_points(stl_file_path, ref_points)

    # Generate the electrode STL files based on the scaled reference points and the STL file
    central_electrode_stl = shift_centered_with_central_target(
        xyz_file_path="aligned_points.xyz",
        head_mesh_file=final_stl_file_path,
        electrode_file="electrode.stl",
        sphere_radius=0.01,
        intermediate_ratio=0.5,
        output_path="final_electrode_model.stl"
    )

    # invisible_head_stl = shift_centered_with_invisible_head(
    # xyz_file_path="aligned_points.xyz",
    # head_mesh_file=final_stl_file_path,
    # electrode_file="electrode.stl",
    # sphere_radius=0.01,
    # intermediate_ratio=0.5,
    # output_path="final_electrode_model.stl"
    # )

    print("End of Pipeline Reached")

    # Return the path to the electrode STL File.
    return final_stl_file_path, "final_electrode_model.stl"

if __name__ == "__main__":
    create_electrodes_stl("input_gltf/peter_test.glb", "input_png/000002.jpg")