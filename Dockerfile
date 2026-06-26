FROM python:3.11-slim-bookworm

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_INDEX_URL=http://mirrors.tencentyun.com/pypi/simple \
    PIP_TRUSTED_HOST=mirrors.tencentyun.com

WORKDIR /app

RUN printf '%s\n' \
        'deb http://mirrors.tencentyun.com/debian bookworm main' \
        'deb http://mirrors.tencentyun.com/debian bookworm-updates main' \
        'deb http://mirrors.tencentyun.com/debian-security bookworm-security main' \
        > /etc/apt/sources.list \
    && rm -f /etc/apt/sources.list.d/debian.sources \
    && apt-get update \
    && apt-get install -y --no-install-recommends \
        default-jre-headless \
        gcc \
        g++ \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN mkdir -p /app/storage/uploads /app/storage/reports /app/storage/logs /app/storage/phunter_cache /app/outputs/raw

EXPOSE 8000

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
