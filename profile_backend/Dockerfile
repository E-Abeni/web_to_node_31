FROM python:3.12-slim

# Prevent Python from writing .pyc files and enable unbuffered logging
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Install dependencies
# We copy this separately to leverage Docker's layer caching
COPY req.txt .
RUN pip install --no-cache-dir -r req.txt

# Explicitly copy ONLY the main.py file as requested
COPY main.py .

# Expose the Uvicorn port
EXPOSE 17004

# Run the app
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "17004"]
