# Inappropriate Image Detection
# **Overview**
Inappropriate Image Detection is **chrome extension based tool** that helps to avoid the inppropriate images while browsing.
In this project we consider the following images as inappropriate:
 - **Bloody Scenes**
 - **Weapons**
 - **Injuries**

**Inception-V3** model trained to classify inppropriate images. In the model we have 3 classes and we are using these classes to classify inppropriate images.

**Flask** api is used to server the model. We have exposed many api's to server the model such as:

 - **/predict**
 - **/Extension.zip**

# **Working**
1- Install requirements by and run the program:
    
    pip install -r requirements.txt

    python app.py

2- Now Flask server is running on locally on

    http://127.0.0.1:5000

3- Download the extension 

    http://127.0.0.1:5000/Extension.zip

4- Extract the extension and add it to the chrome.
   ![alt text](https://github.com/MuhammadTayyab-SE/inappropriate-image-detection/tree/main/images/Capture1.PNG)
   ![alt text](https://github.com/MuhammadTayyab-SE/inappropriate-image-detection/tree/main/images/Capture2.PNG)

5- After adding extension to the chrome enable the extension.
   ![alt text](https://github.com/MuhammadTayyab-SE/inappropriate-image-detection/tree/main/images/Capture3.PNG)

6- Now Whenever you search something in the chrome it will blur whole page initially after some time it will blur those areas that contian inappropriate images.
   ![alt text](https://github.com/MuhammadTayyab-SE/inappropriate-image-detection/tree/main/images/Capture4.PNG)
   ![alt text](https://github.com/MuhammadTayyab-SE/inappropriate-image-detection/tree/main/images/Capture5.PNG)


**NOTE**: Model accuracy is about *86%* and there are some images that might be not in-appropriate images but getting blur.
  


