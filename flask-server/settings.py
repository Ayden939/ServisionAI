from cnn import *



import json
with open('class_map.json', 'r') as f:
    class_map = json.load(f)


#define number of classes
classes=len(class_map)
print(classes,"number of classes")
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = CNN(num_classes=classes).to(device)
model.load_state_dict(torch.load('model.pth', map_location=device))
model.eval()
model.to(device)


