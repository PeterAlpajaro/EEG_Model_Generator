import numpy as np
from points_to_eeg import create_eeg_scene_and_export

# Define EEG points in the main script
eeg_points = np.array([
    [0.1, 0.2, 0.3],
    [-0.1, 0.15, 0.25],
    [0.05, -0.1, 0.3],
    [-0.05, 0.1, 0.28]
])

# Specify output file path
output_file = "eeg_scene.stl"

# Call the function with eeg_points as an argument
create_eeg_scene_and_export(output_file, eeg_points)