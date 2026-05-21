FROM python:3.11-slim

WORKDIR /app

COPY services/ml/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY services/ml/src ./src
COPY services/ml/models ./models

ENV PYTHONUNBUFFERED=1
ENV MODEL_PATH=/app/models

EXPOSE 5000

CMD ["python", "src/main.py"]
