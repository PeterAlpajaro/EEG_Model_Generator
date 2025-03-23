# High level controller for the data pipeline
from glb_to_stl import convert_glb_to_stl
from landmarks import find_landmarks
from reference_points import find_reference_points
from reference_point_scaling import get_scaled_reference_points
# Jeremy's final part

def create_electrodes_stl(glb_file_path, image_file_path):

    # Convert the GLB File to STL Format
    stl_file_path = convert_glb_to_stl(glb_file_path)

    # Get facial landmarks from the image,
    landmarks = find_landmarks(image_file_path)

    # Based on the landmarks, find the 4 reference points of the 10-20 system.
    ref_points = find_reference_points(landmarks)

    # Scale the reference points to the size of the head in the STL file
    scaled_ref_points = get_scaled_reference_points(stl_file_path, ref_points)

    print("End Reached")
    # Generate the electrode STL files based on the scaled reference points and the STL file
    #TODO: Integrate from Jeremy.

    # Return the path to the electrode STL File.
    return stl_file_path, stl_file_path

if __name__ == "__main__":
    create_electrodes_stl("input_gltf/peter_test.glb", "input_png/000002.jpg")