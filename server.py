from flask import Flask, render_template, request, redirect, url_for, send_file
import os
import signal
import sys
from flask_cors import CORS
from pipeline import create_electrodes_stl
import zipfile
import io

request_number = 0

app = Flask(__name__)
CORS(app)

# Handle SIGINT (CTRL+C) gracefully
def signal_handler(sig, frame):
    print('\nShutting down the server...')
    sys.exit(0)

signal.signal(signal.SIGINT, signal_handler)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/upload', methods=['GET', 'POST'])
def upload_file():
    global request_number
    if request.method == 'POST':
        if 'file_glb' not in request.files or 'file_png' not in request.files:
            return redirect(request.url)
        file_glb = request.files['file_glb']
        file_png = request.files['file_png']
        if file_glb.filename == '' or file_png.filename == '':
            return redirect(request.url)
        if file_glb and file_png:
            filename_glb = "input_gltf/request_" + str(request_number) + ".glb"
            filename_png = "input_png/request_" + str(request_number) + ".png"
            file_glb.save(filename_glb)
            file_png.save(filename_png)
            request_number += 1

            # Call the pipeline function
            stl_file_path_person, stl_file_path_electrode = create_electrodes_stl(filename_glb, filename_png)


            print("Returning STL file:", stl_file_path_person, "and, ", stl_file_path_electrode)

            # Create a zip file in memory
            memory_file = io.BytesIO()
            with zipfile.ZipFile(memory_file, 'w') as zf:
                zf.write(stl_file_path_person, "person.stl")
                zf.write(stl_file_path_electrode, "electrode.stl")

            # Reset the memory file pointer
            memory_file.seek(0)

            # Return the zip file
            return send_file(
                memory_file,
                mimetype='application/zip',
                as_attachment=True,
                download_name='stl_files.zip'
            )
        
    return '''
    <!doctype html>
    <title>Upload new Files</title>
    <h1>Upload new Files</h1>
    <form method=post enctype=multipart/form-data>
      <input type=file name=file_glb>
      <input type=file name=file_png>
      <input type=submit value=Upload>
    </form>
    '''

@app.route('/shutdown', methods=['GET'])
def shutdown():
    func = request.environ.get('werkzeug.server.shutdown')
    if func is None:
        raise RuntimeError('Not running with the Werkzeug Server')
    func()
    return 'Server shutting down...'


if __name__ == '__main__':
    app.run(port=8080)