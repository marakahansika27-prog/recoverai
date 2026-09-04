# Production Dockerfile for RecoverAI FastAPI Backend
FROM python:3.11-slim

WORKDIR /app

# Prevent Python from writing .pyc files & enable unbuffered stdout
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source code
COPY . .

# Expose default port 8000
EXPOSE 8000

# Production Uvicorn startup command (Single worker for SQLite demo stability)
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
