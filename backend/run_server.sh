set -a
source .env
source .gunicorn-env
set +a

cd server

gunicorn \
    --worker-class gthread app:app \
    --workers ${GUNICORN_WORKERS} \
    --threads ${GUNICORN_THREADS} \
    --bind 0.0.0.0:${GUNICORN_PORT} \
    --timeout 60
