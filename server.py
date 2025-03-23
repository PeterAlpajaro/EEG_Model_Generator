from flask import Flask, render_template, request, redirect, url_for
import os
import signal
import sys
from flask_cors import CORS
from pipeline import create_electrodes_stl

request_number = 0

app = Flask(__name__)
CORS(app)
UPLOAD_FOLDER = 'input_gltf'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER


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
            file_glb.save(os.path.join(app.config['UPLOAD_FOLDER'], filename_glb))
            file_png.save(os.path.join(app.config['UPLOAD_FOLDER'], filename_png))
            request_number += 1
            return 'Files successfully uploaded'
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

if __name__ == '__main__':
    app.run(port=8080)