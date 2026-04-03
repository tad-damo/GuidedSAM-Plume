ARG BASE_IMAGE=pytorch/pytorch:2.5.1-cuda12.1-cudnn9-runtime

FROM ${BASE_IMAGE}

# Gunicorn environment variables
ENV GUNICORN_WORKERS=1
ENV GUNICORN_THREADS=2
ENV GUNICORN_PORT=5000

# App root environment variable
ENV APP_ROOT=/app/backend



# Install system requirements
COPY packages.txt .
RUN apt-get update && apt-get install -y $(cat packages.txt) --no-install-recommends



COPY requirements.txt .
RUN pip install --upgrade pip setuptools
RUN pip install --no-cache-dir -r requirements.txt


# Make app directory. This directory will host all files required for the
# backend and SAM 2 inference files.

WORKDIR ${APP_ROOT}

# Copy backend server files
COPY ./server ${APP_ROOT}/server


# Download SAM 2.1 checkpoints
ADD https://dl.fbaipublicfiles.com/segment_anything_2/092824/sam2.1_hiera_tiny.pt ${APP_ROOT}/checkpoints/sam2.1_hiera_tiny.pt
ADD https://dl.fbaipublicfiles.com/segment_anything_2/092824/sam2.1_hiera_small.pt ${APP_ROOT}/checkpoints/sam2.1_hiera_small.pt
ADD https://dl.fbaipublicfiles.com/segment_anything_2/092824/sam2.1_hiera_base_plus.pt ${APP_ROOT}/checkpoints/sam2.1_hiera_base_plus.pt
ADD https://dl.fbaipublicfiles.com/segment_anything_2/092824/sam2.1_hiera_large.pt ${APP_ROOT}/checkpoints/sam2.1_hiera_large.pt

WORKDIR ${APP_ROOT}/server

# https://pythonspeed.com/articles/gunicorn-in-docker/
CMD gunicorn --worker-tmp-dir /dev/shm \
    --worker-class gthread app:app \
    --log-level info \
    --access-logfile /dev/stdout \
    --log-file /dev/stderr \
    --workers ${GUNICORN_WORKERS} \
    --threads ${GUNICORN_THREADS} \
    --bind 0.0.0.0:${GUNICORN_PORT} \
    --timeout 60
