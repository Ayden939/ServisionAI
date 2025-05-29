import torch
import torch.nn as nn
import torch.nn.functional as F

#how to improve this

class CNN(nn.Module):
    def __init__(self, num_classes):
        super(CNN, self).__init__()

        self.conv_block1 = nn.Sequential(
            nn.Conv2d(3, 32, kernel_size=3, padding=1),  # 128x128
            nn.BatchNorm2d(32),
            nn.LeakyReLU(),
            nn.MaxPool2d(2, 2)  # → 64x64
        )

        self.conv_block2 = nn.Sequential(
            nn.Conv2d(32, 64, kernel_size=3, padding=1),  # 64x64
            nn.BatchNorm2d(64),
            nn.LeakyReLU(),
            nn.MaxPool2d(2, 2)  # → 32x32
        )

        self.conv_block3 = nn.Sequential(
            nn.Conv2d(64, 128, kernel_size=3, padding=1),  # 32x32
            nn.BatchNorm2d(128),
            nn.LeakyReLU(),
            nn.MaxPool2d(2, 2)  # → 16x16
        )

        self.conv_block4 = nn.Sequential(
            nn.Conv2d(128, 264, kernel_size=3, padding=1),  # 32x32
            nn.BatchNorm2d(264),
            nn.LeakyReLU(),
            nn.MaxPool2d(2, 2)  # → 16x16
        )

        self.dropout = nn.Dropout(0.5) #random

        self.fc1 = nn.Linear(264 * 8 * 8, 256)  # ← Adjusted for 128x128 input
        self.fc2 = nn.Linear(256, num_classes)

    def forward(self, x):
        x = self.conv_block1(x)
        x = self.conv_block2(x)
        x = self.conv_block3(x)
        x = self.conv_block4(x)

        x = x.view(x.size(0), -1)
        x = self.dropout(F.relu(self.fc1(x)))
        x = self.fc2(x)
        return x
    

