FROM python:3.10-slim

COPY . /code
WORKDIR /code

RUN pip install -r requirements.txt
RUN alembic upgrade head

EXPOSE 8888

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8888", "--reload", "--workers", "1"]