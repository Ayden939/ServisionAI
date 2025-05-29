import torchvision.transforms as transforms

transform = transforms.Compose([
    transforms.Resize(128),  
    transforms.CenterCrop(128), 
    # transforms.RandomRotation(10),
    # transforms.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.2, hue=0.1),
    # transforms.RandomApply([transforms.GaussianBlur(kernel_size=3, sigma=(0.1, 1.5))], p=0.3),
    transforms.ToTensor(),
    # transforms.RandomErasing(p=0.2),
    # transforms.Normalize(mean=[0.5]*3, std=[0.5]*3),
])


