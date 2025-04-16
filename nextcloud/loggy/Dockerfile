# Use the official Python image as the base image
FROM python:3.9-slim

# Set the Current Working Directory inside the container
WORKDIR /app

# Copy the source code into the container
COPY main.py .

# Expose port 8080 to the outside world
EXPOSE 8080

# Command to run the Python script
CMD ["python", "main.py"]
