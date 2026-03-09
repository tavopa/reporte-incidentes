FROM python:3.12-slim

WORKDIR /app

# psycopg2-binary bundles libpq, no extra system deps needed
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["python", "main.py"]
