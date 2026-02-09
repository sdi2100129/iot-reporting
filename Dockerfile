# Use official Python image
FROM python:3.12-slim

# Set environment variables
#   Prevent .pyc garbage inside containers
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    #   Many Python packages (including psycopg2) contain C code that must be compiled.
    build-essential \
    #   PostgreSQL driver
    libpq-dev \
    #   Clean up after installing.
    && rm -rf /var/lib/apt/lists/*          

# Copy requirements and install
COPY requirements.txt .
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

# Copy app
COPY . .

# Expose port (same as uvicorn)
EXPOSE 8000

# Run the app with uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
