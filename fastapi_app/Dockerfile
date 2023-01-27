FROM python:3.10-slim

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

COPY . /code
WORKDIR /code

RUN apt update && \ 
    apt -y upgrade && \ 
    apt install -y libmagic1 && \ 
    pip install -r requirements.txt && \
    alembic upgrade head

EXPOSE 8888

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8888", "--reload", "--workers", "1"]