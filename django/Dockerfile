FROM python:3.9

WORKDIR /app

COPY requirements.txt .

RUN apt-get update && apt-get install -y libsasl2-dev python-dev-is-python3 libldap2-dev libssl-dev

RUN pip install -r requirements.txt --no-cache-dir

COPY . .

CMD ["gunicorn", "--bind", "0.0.0.0:8082", "korp_portal.wsgi"]
