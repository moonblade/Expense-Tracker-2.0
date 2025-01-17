# Use a lightweight Python image
FROM python:3.10-slim

# Set the working directory inside the container
LABEL org.opencontainers.image.licenses="private"
WORKDIR /app

# Copy the requirements file and install dependencies
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application code into the container
COPY . .

# Expose the port the app runs on
EXPOSE 9000

# Command to run the FastAPI application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "9000"]
