from flask import Flask, render_template, request, redirect, url_for
import os
import signal
import sys

app = Flask(__name__)
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
    if request.method == 'POST':
        if 'file' not in request.files:
            return redirect(request.url)
        file = request.files['file']
        if file.filename == '':
            return redirect(request.url)
        if file:
            filename = file.filename
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            return 'File successfully uploaded'
    return '''
    <!doctype html>
    <title>Upload new File</title>
    <h1>Upload new File</h1>
    <form method=post enctype=multipart/form-data>
      <input type=file name=file>
      <input type=submit value=Upload>
    </form>
    '''

if __name__ == '__main__':
    app.run(port=8080)