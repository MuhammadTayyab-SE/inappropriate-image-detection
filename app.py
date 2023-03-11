import base64
import json
from io import BytesIO
from unicodedata import name
from PIL import Image
import numpy as np
import re
import requests
from flask import Flask, request, jsonify, render_template, send_file
from keras.applications import inception_v3
from keras.preprocessing import image
from flask_cors import CORS
from colorama import Fore
import random
from keras.models import load_model

# for sending emails
import os
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

bs64_rg=re.compile(r'data:image\/([a-zA-Z]*);base64,([^\"]*)')

app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

# load the model
model = load_model(r"model.h5")

# email api key
SENDGRID_API_KEY = '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'
SENDER_EMAIL = 'blurextension@gmail.com'

# SENDGRID_API_KEY = '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'


# to test if server is up and running
@app.route('/', methods=['GET', 'POST'])
def index():
    # return 'Server is working fine.'
    return render_template('index.html')

@app.route('/Extension.zip', methods=['GET', 'POST'])
def download():
    return send_file('Extension.zip', as_attachment=True)


@app.route('/predict', methods=['GET', 'POST'])
def make_prediction():
    try:
        
        url = request.form['lnk']
        url = base64.b64decode(url).decode('utf-8')
        
        bs64=bs64_rg.search(url)
        if bs64:
            
            r=bs64.group(2)
            r=base64.b64decode(r)
            
            img = Image.open(BytesIO(r))
            # img = image.img_to_array(image.load_img(img,target_size=(150,150))) / 255
        else:
            r=requests.get(url).content
            img = Image.open(BytesIO(r))


        img=np.asanyarray(img.resize((150,150))) / 255
        
       
        # reshape to shape that tensorflow expects

        # if there is only 1 channel expand to 3 channels
        if len(img.shape) == 2:
            img = img[:, :, None] * np.ones(3, dtype=int)[None, None, :]

        # if there are 4 channels reduce to 3 channels 
        # slice off the alpha channel
        elif len(img.shape) > 2 and img.shape[2] == 4: 
            img = img[:, :, :3]
        
        img = img.astype('float16')
        img = np.expand_dims(img, axis=0)
        img = np.array(img)


        payload = {
            "instances": [img.tolist()]
        }


        # pass uploaded image to Tensorflow model for detection
        pred = model.predict(img)
        ch = np.argmax(pred)
        
        pred = pred[0][np.argmax(pred)]

        # ch = np.argmax(pred)

        if (ch==0):
            sign = "Bloody scene"
        elif (ch==1):
            sign ="Guns"
        elif (ch==2):
            sign = "Injury"
        elif (ch==3):
            sign = "Knifes"
   
        if pred > 0.37:
            return {
                'isBlur': 1,
                'sign': sign,
                'pred': pred*100,
                'url': url}
        else:
            return {
                'isBlur': 0,
                'sign': sign,
                'pred': pred*100,
                'url': url

            }
    except Exception as e:
        print ('--->except '+str(e))
        return {
            'isBlur': 2,
            'pred': '0',
            'url': url

        }


@app.route('/test-predict')
def test_prediction():
    try:
        
        url = (request.args.get('lnk'))
        url = base64.b64decode(url).decode('utf-8')

        # get random predictions for testing
        pred = random.randint(0, 100)
        is_blur = random.randint(0, 1)

        return {
                'isBlur': is_blur,
                'sign': 'sign',
                'pred': pred*100,
                'url': url

        }

    except Exception as e:
        print ('--->except '+str(e))
        return {
            'isBlur': 2,
            'pred': '0',
            'url': url

        }


# to send emails to client using sendgrid API
@app.route('/send-mail', methods=['GET', 'POST'])

def send_mail():
    email = request.form['email']
    code = request.form['code']

    message = Mail(
        # from_email='ju_najjar@outlook.com',
        from_email=SENDER_EMAIL,
        to_emails=email,
        subject='Inappropriate Images Blur Unlock Code',
        html_content='Your Code is: <strong>'+code+'</strong>'
    )
    try:
        sg = SendGridAPIClient(SENDGRID_API_KEY)
        response = sg.send(message)
        print(response.status_code)
        print(response.body)
        print(response.headers)
        print('success')
        return {
            'status': 'success'
        }
    except Exception as e:
        # print(email, code)
        print(e)
        return {
            'status': 'error'
        }


if __name__ == '__main__':
   app.debug = True
   app.run()