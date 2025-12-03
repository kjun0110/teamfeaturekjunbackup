FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Chrome 및 ChromeDriver 설치 (한 번에 처리하여 레이어 최소화)
RUN apt-get update && apt-get install -y --no-install-recommends \
    wget \
    gnupg \
    unzip \
    curl \
    ca-certificates \
    fonts-liberation \
    libgbm1 \
    libnss3 \
    libx11-6 \
    libxcb1 \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | gpg --dearmor -o /usr/share/keyrings/google-chrome.gpg \
    && echo "deb [arch=amd64 signed-by=/usr/share/keyrings/google-chrome.gpg] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list \
    && apt-get update \
    && apt-get install -y --no-install-recommends google-chrome-stable \
    && CHROME_VERSION=$(google-chrome --version | awk '{print $3}' | cut -d. -f1) \
    && CHROMEDRIVER_VERSION=$(curl -s "https://googlechromelabs.github.io/chrome-for-testing/LATEST_RELEASE_${CHROME_VERSION}" || curl -s "https://chromedriver.storage.googleapis.com/LATEST_RELEASE_${CHROME_VERSION}") \
    && if [ -z "$CHROMEDRIVER_VERSION" ]; then \
        CHROMEDRIVER_VERSION=$(curl -s "https://chromedriver.storage.googleapis.com/LATEST_RELEASE_${CHROME_VERSION}"); \
    fi \
    && wget -q -O /tmp/chromedriver.zip "https://storage.googleapis.com/chrome-for-testing-public/${CHROMEDRIVER_VERSION}/linux64/chromedriver-linux64.zip" 2>/dev/null || \
       wget -q -O /tmp/chromedriver.zip "https://chromedriver.storage.googleapis.com/${CHROMEDRIVER_VERSION}/chromedriver_linux64.zip" \
    && unzip -q /tmp/chromedriver.zip -d /tmp/ \
    && find /tmp -name "chromedriver" -type f -executable -exec mv {} /usr/local/bin/chromedriver \; \
    && chmod +x /usr/local/bin/chromedriver \
    && rm -rf /tmp/chromedriver.zip /tmp/chromedriver-linux64 /tmp/chromedriver \
    && apt-get purge -y wget gnupg unzip curl \
    && apt-get autoremove -y \
    && rm -rf /var/lib/apt/lists/*

# 기본 Python 패키지 설치 (FastAPI, Uvicorn)
RUN pip install --no-cache-dir fastapi uvicorn

# crawlerservice의 requirements.txt 복사 및 설치 (gateway에서 crawlerservice 코드 사용)
COPY feed/crawlerservice/requirements.txt ./crawlerservice-requirements.txt
RUN if [ -s ./crawlerservice-requirements.txt ]; then pip install --no-cache-dir -r crawlerservice-requirements.txt; fi

# services 디렉토리 구조 생성 (gateway의 main.py가 services 구조를 기대함)
RUN mkdir -p services/crawlerservice services/chatbotservice

# 실제 서비스 코드를 services 디렉토리로 복사
COPY feed/crawlerservice ./services/crawlerservice
COPY rag/chatbotservice ./services/chatbotservice

COPY gateway/app ./app

EXPOSE 9000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "9000"]

