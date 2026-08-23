FROM python:3.14-slim

# 1. Update system packages and clean cache
RUN apt-get update && apt-get upgrade -y && rm -rf /var/lib/apt/lists/*

# 2. Set Python optimizations and add the uv virtual environment to PATH
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PATH="/app/.venv/bin:$PATH"

# 3. Create a non-root user for security
RUN useradd -m appuser

WORKDIR /app

# 4. Install secure versions of build tools and uv
RUN pip install --no-cache-dir --upgrade pip "setuptools>=83.0.0" "msgpack>=1.2.1" uv \
    && rm -rf /usr/local/lib/python3.14/ensurepip/_bundled

# 5. Cache dependencies
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-install-project

# 6. Copy application code and grant permissions to the non-root user
COPY src ./src
COPY migrations ./migrations
COPY alembic.ini .
COPY entrypoint.sh .
RUN chown -R appuser:appuser /app
RUN chmod +x entrypoint.sh

# 7. Switch to the unprivileged user
USER appuser

EXPOSE 8000

ENTRYPOINT ["./entrypoint.sh"]