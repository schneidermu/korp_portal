FROM python:3.9

RUN useradd -s /bin/sh -md /app user
WORKDIR /app

RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
  --mount=type=cache,target=/var/lib/apt,sharing=locked \
  apt-get update && apt-get --no-install-recommends install -y \
  libldap2-dev libsasl2-dev libssl-dev python-dev-is-python3

COPY requirements.txt .

RUN --mount=type=cache,target=/root/.cache/pip \
  pip install -r requirements.txt

COPY . .

RUN python manage.py collectstatic --noinput

RUN python manage.py makemigrations --noinput

USER user

CMD ["sh", "-c", "python manage.py migrate --noinput && \
  gunicorn --bind 0.0.0.0:8000 korp_portal.wsgi"]
