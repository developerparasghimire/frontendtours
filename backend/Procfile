web: gunicorn config.wsgi --log-file -
worker: celery -A config worker --loglevel=info --concurrency=2
release: python manage.py collectstatic --noinput && python manage.py migrate --noinput
