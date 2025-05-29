FROM python:3.10-slim

RUN apt-get update && apt-get install -y gcc libgl1 libglib2.0-0 libsm6 libxext6 libxrender-dev && apt-get clean

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir torch torchvision --extra-index-url https://download.pytorch.org/whl/cpu

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Run the Flask app using Gunicorn with Gevent workers
CMD ["gunicorn", "server:app", "-w", "2", "-k", "gevent", "-b", "0.0.0.0:8000"]
