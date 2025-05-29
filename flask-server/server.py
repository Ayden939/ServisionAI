from flask import Flask, jsonify,request
import requests
from classify import classify
from ultralytics import YOLO
import cv2
from PIL import Image
from flask_cors import CORS
import numpy as np
from werkzeug.middleware.proxy_fix import ProxyFix
import base64
import cv2


app = Flask(__name__)
app.wsgi_app = ProxyFix(app.wsgi_app, x_proto=1, x_host=1)

CORS(app)


model = YOLO("yolov8n.pt")   



@app.route('/about')
def home():
    return jsonify({"message": "python server is running!"})



@app.route('/video', methods=['POST'])
def classify_frame():   
    camera_name = request.form.get('camera_name')
    image = Image.open(request.files['frame']).convert('RGB')
    cv_image = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
    # cv2.imwrite("x.jpg", cv_image)
    classify(model,cv_image)
    
    return 'OK'


        
    



import os
from torchvision.ops import nms   
import torch
img_index = 0
@app.route('/collect', methods=['POST'])
def collect_route():
    global img_index
    allowed_classes = ["wine glass","bowl"]
    output_dir = "yolo"
    iou_threshold = 0.01

    image = Image.open(request.files['frame']).convert('RGB')
    cv_image = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)

    results = model(cv_image)

    for r in results:
        class_ids = r.boxes.cls.cpu().numpy().astype(int)
        boxes = r.boxes.xyxy.cpu().numpy()
        scores = r.boxes.conf.cpu().numpy()

        keep = nms(torch.tensor(boxes), torch.tensor(scores), iou_threshold)

        for i in keep:
            i = int(i)
            class_id = class_ids[i]
            box = boxes[i]
            x1, y1, x2, y2 = map(int, box)
            yolo_class_name = model.names[class_id]

            if yolo_class_name not in allowed_classes:
                continue

            cropped_object = cv_image[y1:y2, x1:x2]

            class_folder = os.path.join(output_dir, yolo_class_name)
            os.makedirs(class_folder, exist_ok=True)
            out_path = os.path.join(class_folder, f'{img_index}.jpg')
            cv2.imwrite(out_path, cropped_object)
            img_index += 1

            cv2.rectangle(cv_image, (x1, y1), (x2, y2), (0, 255, 0), 1)
            text_x, text_y = x1, y1 - 10 if y1 - 10 > 10 else y1 + 15
            cv2.putText(cv_image, yolo_class_name, (text_x, text_y),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.3, (0, 255, 0), 1, cv2.LINE_AA)

    return 'OK'
