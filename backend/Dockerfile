FROM python:3.14-slim

RUN apt-get update && apt-get upgrade -y && rm -rf /var/lib/apt/lists/*

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

RUN pip install --no-cache-dir --upgrade pip "setuptools>=78.1.1" uv \
    && rm -rf /usr/local/lib/python3.14/ensurepip/_bundled

COPY pyproject.toml uv.lock ./

RUN uv sync --frozen --no-install-project

COPY src ./src
COPY migrations ./migrations
COPY alembic.ini .

COPY entrypoint.sh .
RUN chmod +x entrypoint.sh

EXPOSE 8000

ENTRYPOINT ["./entrypoint.sh"]