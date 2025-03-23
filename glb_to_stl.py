import os
import numpy as np
import trimesh
import argparse

def convert_glb_to_stl(input_file, output_file=None):
    """
    Convert a GLB file to STL format
    
    Parameters:
    -----------
    input_file : str
        Path to input GLB file
    output_file : str, optional
        Path to output STL file. If not provided, will use same name as input file with .stl extension
    
    Returns:
    --------
    str
        Path to the saved STL file
    """
    # If no output file is specified, create one based on the input filename
    if output_file is None:
        base_name = os.path.splitext(input_file)[0]
        output_file = f"{base_name}.stl"
    
    # Check if the input file is a GLB file
    if not input_file.lower().endswith('.glb'):
        raise ValueError("Input file must be a GLB file (.glb extension)")
    
    # Load the GLB file
    print(f"Loading GLB file: {input_file}...")
    mesh = trimesh.load(input_file)
    
    # Handle scenes (GLB files typically contain scenes with multiple meshes)
    if isinstance(mesh, trimesh.Scene):
        print("Processing scene with multiple meshes...")
        # Extract all meshes from the scene and combine them
        meshes = []
        for name, m in mesh.geometry.items():
            print(f"Processing mesh: {name}")
            # Get transform for this mesh
            transform = np.eye(4)
            for node_name in mesh.graph.nodes_geometry:
                if mesh.graph[node_name][1] == name:
                    transform = mesh.graph[node_name][0]
                    break
            
            # Apply transform
            m = m.copy()
            m.apply_transform(transform)
            meshes.append(m)
        
        # Combine all meshes
        if meshes:
            combined_mesh = trimesh.util.concatenate(meshes)
            print(f"Combined {len(meshes)} meshes into a single mesh")
        else:
            raise ValueError("No meshes found in the GLB file")
    else:
        combined_mesh = mesh
    
    # Export the mesh to STL
    print(f"Exporting to STL: {output_file}...")
    combined_mesh.export(output_file, file_type='stl')
    
    print(f"Conversion complete: {output_file}")
    return output_file

if __name__ == "__main__":
    # Command-line interface
    parser = argparse.ArgumentParser(description="Convert GLB files to STL format")
    parser.add_argument("input", help="Path to input GLB file")
    parser.add_argument("-o", "--output", help="Path to output STL file (optional)")
    
    args = parser.parse_args()
    convert_glb_to_stl(args.input, args.output)