from glb_to_stl import convert_glb_to_stl

# GitHub raw URL to your GLB file
github_url = "https://github.com/PeterAlpajaro/EEG_Model_Generator/raw/refs/heads/glb-to-stl/input.glb"

# Convert the file
convert_glb_to_stl("input.glb", "output.stl", github_url=github_url)