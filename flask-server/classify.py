import os
import cv2
import torch
import json
import numpy as np
from PIL import Image
from torchvision.ops import nms
from cnn import * 
from settings import *  
import base64
import requests


from torchvision import transforms
transform = transforms.Compose([transforms.Resize((128, 128)),transforms.CenterCrop(128),transforms.ToTensor(),])


with open('class_map.json', 'r') as f:
    class_map = json.load(f)

print("Class Map:", class_map)


def classify_single_image(image):
    if isinstance(image, np.ndarray):
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        image = Image.fromarray(image)

    input_tensor = transform(image).unsqueeze(0).to(device)

    with torch.no_grad():
        output = model(input_tensor)
        probabilities = torch.softmax(output, dim=1).squeeze()
        predicted_index = torch.argmax(probabilities).item()
        confidence = probabilities[predicted_index].item()

    predicted_class = class_map[str(predicted_index)]

    return predicted_class, confidence

cnn_to_yolo = {
    "emptyGlass": "wine glass",
    "emptyBowl": "bowl"
}
def classify(yolo_model, image, camera_name="default", iou_threshold=0.01):
    img_height, img_width = image.shape[:2]
    results = yolo_model(image)

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

            yolo_class_name = yolo_model.names[class_id]
            if yolo_class_name not in ["wine glass", "bowl"]:
                continue

            cropped_object = image[y1:y2, x1:x2]
            class_name, confidence = classify_single_image(cropped_object)

            if class_name not in ["emptyBowl", "emptyGlass"]:
                continue
            if cnn_to_yolo.get(class_name) != yolo_class_name:
                continue
            if confidence < 0.5:
                continue

            print(f"Sending detection: YOLO={yolo_class_name} | CNN={class_name} ({confidence:.2f})")

            boxed_image = image.copy()
            text = f'{yolo_class_name} : {class_name} {confidence:.2f}'
            text_x, text_y = x1, y1 - 10 if y1 - 10 > 10 else y1 + 15
            cv2.rectangle(boxed_image, (x1, y1), (x2, y2), (0, 255, 0), 1)
            cv2.putText(boxed_image, text, (text_x, text_y), cv2.FONT_HERSHEY_SIMPLEX,
                        0.5, (0, 255, 0), 1, cv2.LINE_AA)

            _, buffer = cv2.imencode('.jpg', boxed_image)
            encoded_image = base64.b64encode(buffer).decode('utf-8')

            task = {
                "classname": class_name,
                "yoloname": yolo_class_name,
                "location": "left" if (x1 + x2) / 2 < img_width / 2 else "right",
                "image": encoded_image,
                "camera_name": camera_name
            }

            requests.post("http://node-server:5000/api/add-task", json=task)
