# 🔄 Gateway 통합 전략: FastAPI → Spring Cloud Gateway

## 📋 목차
1. [현재 상황 분석](#현재-상황-분석)
2. [통합 전략 개요](#통합-전략-개요)
3. [단계별 실행 계획](#단계별-실행-계획)
4. [기술적 고려사항](#기술적-고려사항)
5. [마이그레이션 체크리스트](#마이그레이션-체크리스트)

---

## 🔍 현재 상황 분석

### 기존 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│                         클라이언트                            │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┴──────────────┐
        │                             │
        ▼                             ▼
┌───────────────┐            ┌────────────────┐
│  FastAPI      │            │  Spring Cloud  │
│  Gateway      │            │  Gateway       │
│  (Port 9000)  │            │  (Port 8080)   │
└───────┬───────┘            └────────┬───────┘
        │                             │
   ┌────┴────┐                   ┌────┴──────────────────┐
   │         │                   │                       │
   ▼         ▼                   ▼                       ▼
┌─────┐  ┌─────┐         ┌──────────┐          ┌──────────┐
│Crawl│  │Chat │         │User      │          │Common    │
│er   │  │bot  │         │Service   │          │Service   │
│9001 │  │9002 │         │8104      │          │8101      │
└─────┘  └─────┘         └──────────┘          └──────────┘
                         ┌──────────┐          ┌──────────┐
                         │Environ   │          │Social    │
                         │ment      │          │Service   │
                         │8105      │          │8106      │
                         └──────────┘          └──────────┘
                         ┌──────────┐
                         │Govern    │
                         │ance      │
                         │8107      │
                         └──────────┘
```

### 문제점
1. **이중 게이트웨이 구조**: FastAPI와 Spring Gateway가 분리되어 관리 복잡도 증가
2. **일관성 부족**: Rate Limiting, Circuit Breaker 등의 정책이 통일되지 않음
3. **모니터링 분산**: 두 게이트웨이의 메트릭을 따로 관리해야 함
4. **배포 복잡도**: 두 개의 게이트웨이를 각각 배포하고 관리해야 함

---

## 🎯 통합 전략 개요

### 목표 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│                         클라이언트                            │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
              ┌────────────────┐
              │  Spring Cloud  │
              │  Gateway       │
              │  (Port 8080)   │
              └────────┬───────┘
                       │
    ┌──────────────────┼──────────────────────┐
    │                  │                      │
    ▼                  ▼                      ▼
┌─────────┐      ┌──────────┐          ┌──────────┐
│Crawler  │      │Chatbot   │          │User      │
│Service  │      │Service   │          │Service   │
│(FastAPI)│      │(FastAPI) │          │(Spring)  │
│9001     │      │9002      │          │8104      │
└─────────┘      └──────────┘          └──────────┘
                                       ┌──────────┐
                                       │Common    │
                                       │Service   │
                                       │8101      │
                                       └──────────┘
                                       ┌──────────┐
                                       │Environ   │
                                       │ment      │
                                       │8105      │
                                       └──────────┘
                                       ┌──────────┐
                                       │Social    │
                                       │Service   │
                                       │8106      │
                                       └──────────┘
                                       ┌──────────┐
                                       │Govern    │
                                       │ance      │
                                       │8107      │
                                       └──────────┘
```

### 핵심 전략
1. **FastAPI Gateway 제거**: `ai.aifixr.site/gateway` 삭제
2. **FastAPI 서비스 독립화**: Crawler, Chatbot 서비스를 독립 실행
3. **Spring Gateway 라우팅 추가**: FastAPI 서비스로의 라우팅 설정
4. **통합 모니터링**: 모든 서비스를 Spring Gateway를 통해 관리

---

## 📝 단계별 실행 계획

### Phase 1: FastAPI 서비스 독립화 (우선순위: 높음)

#### 1.1 Crawler Service 독립 실행 설정

**목표**: Crawler 서비스가 Gateway 없이 독립적으로 실행되도록 수정

**작업 내용**:
```yaml
# ai.aifixr.site/docker-compose.yaml 수정
services:
  crawlerservice:
    build:
      context: ./feed/crawlerservice
      dockerfile: Dockerfile
    ports:
      - "9001:9001"
    container_name: crawler-service
    networks:
      spring-network:  # ← 네트워크 통합
        aliases:
          - crawler.local
    restart: unless-stopped
```

**Dockerfile 확인**:
```dockerfile
# ai.aifixr.site/feed/crawlerservice/Dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app

EXPOSE 9001

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "9001"]
```

#### 1.2 Chatbot Service 독립 실행 설정

**작업 내용**:
```yaml
# ai.aifixr.site/docker-compose.yaml 수정
services:
  chatbotservice:
    build:
      context: ./rag/chatbotservice
      dockerfile: Dockerfile
    ports:
      - "9002:9002"
    container_name: chatbot-service
    networks:
      spring-network:  # ← 네트워크 통합
        aliases:
          - chatbot.local
    restart: unless-stopped
```

---

### Phase 2: Spring Gateway 라우팅 추가 (우선순위: 높음)

#### 2.1 application.yaml에 FastAPI 서비스 라우팅 추가

**파일**: `api.aifixr.site/gateway/src/main/resources/application.yaml`

```yaml
spring:
  cloud:
    gateway:
      routes:
        # ========================================
        # FastAPI Services (AI/ML)
        # ========================================
        
        # Crawler Service - Rate Limiting + Circuit Breaker
        - id: crawler-service
          uri: http://crawler:9001
          predicates:
            - Path=/api/crawler/**
          filters:
            - StripPrefix=1
            - name: RequestRateLimiter
              args:
                redis-rate-limiter.replenishRate: 10
                redis-rate-limiter.burstCapacity: 20
                redis-rate-limiter.requestedTokens: 1
                key-resolver: "#{@ipKeyResolver}"
            - name: CircuitBreaker
              args:
                name: crawlerCircuitBreaker
        
        # Chatbot Service - Rate Limiting + Circuit Breaker
        - id: chatbot-service
          uri: http://chatbot:9002
          predicates:
            - Path=/api/chatbot/**
          filters:
            - StripPrefix=1
            - name: RequestRateLimiter
              args:
                redis-rate-limiter.replenishRate: 15
                redis-rate-limiter.burstCapacity: 30
                redis-rate-limiter.requestedTokens: 1
                key-resolver: "#{@ipKeyResolver}"
            - name: CircuitBreaker
              args:
                name: chatbotCircuitBreaker
        
        # Crawler Service - OpenAPI Docs
        - id: crawler-api-docs
          uri: http://crawler:9001
          predicates:
            - Path=/api-docs/crawler
          filters:
            - RewritePath=/api-docs/crawler, /openapi.json
        
        # Chatbot Service - OpenAPI Docs
        - id: chatbot-api-docs
          uri: http://chatbot:9002
          predicates:
            - Path=/api-docs/chatbot
          filters:
            - RewritePath=/api-docs/chatbot, /openapi.json

# Resilience4j Circuit Breaker 설정 추가
resilience4j:
  circuitbreaker:
    instances:
      crawlerCircuitBreaker:
        sliding-window-size: 10
        failure-rate-threshold: 50
        wait-duration-in-open-state: 10s
        permitted-number-of-calls-in-half-open-state: 3
        automatic-transition-from-open-to-half-open-enabled: true
      chatbotCircuitBreaker:
        sliding-window-size: 10
        failure-rate-threshold: 50
        wait-duration-in-open-state: 10s
        permitted-number-of-calls-in-half-open-state: 3
        automatic-transition-from-open-to-half-open-enabled: true
```

#### 2.2 Swagger UI에 FastAPI 서비스 추가

```yaml
springdoc:
  swagger-ui:
    urls:
      - url: /v3/api-docs
        name: Gateway
      - url: /api-docs/user
        name: User Service
      - url: /api-docs/common
        name: Common Service
      - url: /api-docs/environment
        name: Environment Service
      - url: /api-docs/social
        name: Social Service
      - url: /api-docs/governance
        name: Governance Service
      - url: /api-docs/crawler
        name: Crawler Service (FastAPI)
      - url: /api-docs/chatbot
        name: Chatbot Service (FastAPI)
```

---

### Phase 3: Docker Compose 분리 운영 설정 (우선순위: 중간)

#### 3.1 네트워크 분리 전략

**목표**: `api.aifixr.site`와 `ai.aifixr.site`를 **별도로 docker-compose up** 하되, Spring Gateway가 FastAPI 서비스에 접근 가능하도록 설정

**전략**:
- 두 Docker Compose는 **독립적으로 실행**
- FastAPI 서비스는 **호스트 네트워크를 통해 접근** (`localhost:9001`, `localhost:9002`)
- 또는 **외부 Docker 네트워크 생성**하여 공유

#### 3.2 방법 1: 호스트 네트워크 접근 (권장)

**장점**: 간단하고 관리 용이, Docker Compose 완전 분리

**api.aifixr.site/gateway/src/main/resources/application.yaml 수정**:
```yaml
spring:
  cloud:
    gateway:
      routes:
        # Crawler Service - 호스트를 통해 접근
        - id: crawler-service
          uri: http://host.docker.internal:9001  # ← 호스트 접근
          predicates:
            - Path=/api/crawler/**
          filters:
            - StripPrefix=1
            - name: RequestRateLimiter
              args:
                redis-rate-limiter.replenishRate: 10
                redis-rate-limiter.burstCapacity: 20
                redis-rate-limiter.requestedTokens: 1
                key-resolver: "#{@ipKeyResolver}"
            - name: CircuitBreaker
              args:
                name: crawlerCircuitBreaker
        
        # Chatbot Service - 호스트를 통해 접근
        - id: chatbot-service
          uri: http://host.docker.internal:9002  # ← 호스트 접근
          predicates:
            - Path=/api/chatbot/**
          filters:
            - StripPrefix=1
            - name: RequestRateLimiter
              args:
                redis-rate-limiter.replenishRate: 15
                redis-rate-limiter.burstCapacity: 30
                redis-rate-limiter.requestedTokens: 1
                key-resolver: "#{@ipKeyResolver}"
            - name: CircuitBreaker
              args:
                name: chatbotCircuitBreaker
```

**실행 방법**:
```bash
# Terminal 1: API 서비스 실행
cd api.aifixr.site
docker-compose up -d

# Terminal 2: AI 서비스 실행
cd ai.aifixr.site
docker-compose up -d
```

**주의사항**:
- Windows/Mac: `host.docker.internal` 사용
- Linux: `extra_hosts` 설정 필요 (아래 참고)

**Linux용 설정** (`api.aifixr.site/docker-compose.yaml`):
```yaml
services:
  gateway:
    build:
      context: .
      dockerfile: ./gateway/Dockerfile
    container_name: gateway
    ports:
      - "8080:8080"
    extra_hosts:
      - "host.docker.internal:host-gateway"  # ← Linux용 추가
    depends_on:
      - redis
    environment:
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - REDIS_PASSWORD=${REDIS_PASSWORD:-Redis0930!}
    networks:
      spring-network:
        aliases:
          - gateway.local
```

#### 3.3 방법 2: 외부 Docker 네트워크 공유 (고급)

**장점**: 컨테이너 간 직접 통신, 더 나은 성능

**1단계: 외부 네트워크 생성**:
```bash
docker network create aifixr-shared-network
```

**2단계: api.aifixr.site/docker-compose.yaml 수정**:
```yaml
services:
  gateway:
    build:
      context: .
      dockerfile: ./gateway/Dockerfile
    container_name: gateway
    ports:
      - "8080:8080"
    depends_on:
      - redis
    environment:
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - REDIS_PASSWORD=${REDIS_PASSWORD:-Redis0930!}
    networks:
      - spring-network
      - aifixr-shared-network  # ← 외부 네트워크 추가

networks:
  spring-network:
    driver: bridge
  aifixr-shared-network:
    external: true  # ← 외부 네트워크 사용
```

**3단계: ai.aifixr.site/docker-compose.yaml 수정**:
```yaml
services:
  crawlerservice:
    build:
      context: ./feed/crawlerservice
      dockerfile: Dockerfile
    ports:
      - "9001:9001"
    container_name: crawler-service
    networks:
      - ai-network
      - aifixr-shared-network  # ← 외부 네트워크 추가
    restart: unless-stopped

  chatbotservice:
    build:
      context: ./rag/chatbotservice
      dockerfile: Dockerfile
    ports:
      - "9002:9002"
    container_name: chatbot-service
    networks:
      - ai-network
      - aifixr-shared-network  # ← 외부 네트워크 추가
    restart: unless-stopped

networks:
  ai-network:
    driver: bridge
  aifixr-shared-network:
    external: true  # ← 외부 네트워크 사용
```

**4단계: application.yaml에서 컨테이너 이름으로 접근**:
```yaml
spring:
  cloud:
    gateway:
      routes:
        - id: crawler-service
          uri: http://crawler-service:9001  # ← 컨테이너 이름 직접 사용
          predicates:
            - Path=/api/crawler/**
```

#### 3.4 ai.aifixr.site 폴더 정리

**작업 내용**:
1. `ai.aifixr.site/gateway` 폴더 **삭제**
2. `ai.aifixr.site/docker-compose.yaml` **유지** (독립 실행용)
3. FastAPI Gateway 관련 코드 제거

---

### Phase 4: 테스트 및 검증 (우선순위: 높음)

#### 4.1 기능 테스트

**Crawler Service 테스트**:
```bash
# Spring Gateway를 통한 접근
curl http://localhost:8080/api/crawler/
curl http://localhost:8080/api/crawler/bugsmusic
curl http://localhost:8080/api/crawler/danawa

# 직접 접근 (개발용)
curl http://localhost:9001/
curl http://localhost:9001/bugsmusic
curl http://localhost:9001/danawa
```

**Chatbot Service 테스트**:
```bash
# Spring Gateway를 통한 접근
curl http://localhost:8080/api/chatbot/

# 직접 접근 (개발용)
curl http://localhost:9002/
```

#### 4.2 Rate Limiting 테스트

```bash
# Crawler Service Rate Limit 테스트 (10 req/s)
for i in {1..15}; do
  curl -w "\n%{http_code}\n" http://localhost:8080/api/crawler/
  sleep 0.05
done

# 429 Too Many Requests 응답 확인
```

#### 4.3 Circuit Breaker 테스트

```bash
# Crawler Service 중단 후 Circuit Breaker 동작 확인
docker stop crawler

# 여러 번 요청하여 Circuit Open 확인
for i in {1..15}; do
  curl http://localhost:8080/api/crawler/
done

# 503 Service Unavailable 응답 확인
```

#### 4.4 Swagger UI 통합 확인

```bash
# Swagger UI 접근
http://localhost:8080/swagger-ui.html

# FastAPI 서비스가 드롭다운에 표시되는지 확인:
# - Crawler Service (FastAPI)
# - Chatbot Service (FastAPI)
```

---

## 🔧 기술적 고려사항

### 1. FastAPI와 Spring Gateway 통합 시 주의사항

#### 1.1 OpenAPI 스펙 차이
- **문제**: FastAPI는 OpenAPI 3.0, Spring은 OpenAPI 3.0/3.1 지원
- **해결**: FastAPI의 `/openapi.json` 엔드포인트를 그대로 프록시

#### 1.2 CORS 설정
- **문제**: FastAPI 서비스에 자체 CORS 설정이 있을 수 있음
- **해결**: FastAPI 서비스의 CORS 미들웨어 제거, Gateway에서 통합 관리

```python
# ai.aifixr.site/feed/crawlerservice/app/main.py
# CORS 미들웨어 제거 (Gateway에서 처리)
# app.add_middleware(CORSMiddleware, ...) ← 삭제
```

#### 1.3 경로 매핑
- **기존**: `/crawler/bugsmusic` (FastAPI Gateway)
- **변경**: `/api/crawler/bugsmusic` (Spring Gateway)
- **프론트엔드 수정 필요**: API 호출 경로 업데이트

### 2. 네트워크 통신

#### 2.1 Docker Compose 분리 운영
- **api.aifixr.site**: 독립 실행 (`spring-network`)
- **ai.aifixr.site**: 독립 실행 (`ai-network`)
- **통신 방법**:
  - **방법 1 (권장)**: `host.docker.internal`을 통한 호스트 네트워크 접근
  - **방법 2**: 외부 Docker 네트워크 공유 (`aifixr-shared-network`)

#### 2.2 서비스 디스커버리
- Spring 서비스: Docker DNS 또는 Eureka (선택사항)
- FastAPI 서비스: 
  - 방법 1: `host.docker.internal:9001`, `host.docker.internal:9002`
  - 방법 2: `crawler-service:9001`, `chatbot-service:9002` (외부 네트워크 사용 시)

### 3. 모니터링 및 로깅

#### 3.1 통합 로깅
```yaml
# api.aifixr.site/gateway/src/main/resources/application.yaml
logging:
  level:
    org.springframework.cloud.gateway: DEBUG
    reactor.netty.http.client: DEBUG  # FastAPI 호출 로깅
```

#### 3.2 메트릭 수집
```yaml
# Actuator를 통한 메트릭 노출
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics,prometheus,gateway
```

### 4. 성능 최적화

#### 4.1 Connection Pool 설정
```yaml
# Gateway의 HTTP 클라이언트 튜닝
spring:
  cloud:
    gateway:
      httpclient:
        pool:
          max-connections: 100
          max-idle-time: 30s
```

#### 4.2 Timeout 설정
```yaml
spring:
  cloud:
    gateway:
      routes:
        - id: crawler-service
          uri: http://crawler:9001
          predicates:
            - Path=/api/crawler/**
          filters:
            - StripPrefix=1
          metadata:
            response-timeout: 30000  # 30초
            connect-timeout: 5000    # 5초
```

---

## ✅ 마이그레이션 체크리스트

### Phase 1: 준비 단계
- [ ] 현재 FastAPI Gateway의 라우팅 규칙 문서화
- [ ] FastAPI 서비스의 엔드포인트 목록 작성
- [ ] 프론트엔드의 API 호출 경로 파악
- [ ] 백업 및 롤백 계획 수립

### Phase 2: FastAPI 서비스 독립화
- [ ] Crawler Service Dockerfile 검증
- [ ] Chatbot Service Dockerfile 검증
- [ ] 독립 실행 테스트 (로컬)
- [ ] 환경 변수 및 설정 확인

### Phase 3: Spring Gateway 설정
- [ ] `application.yaml`에 Crawler 라우팅 추가
- [ ] `application.yaml`에 Chatbot 라우팅 추가
- [ ] Rate Limiting 설정 추가
- [ ] Circuit Breaker 설정 추가
- [ ] Swagger UI 통합

### Phase 4: Docker Compose 분리 운영 설정
- [ ] 네트워크 접근 방법 선택 (호스트 접근 vs 외부 네트워크)
- [ ] `application.yaml`에서 FastAPI 서비스 URI 설정
- [ ] Linux 환경인 경우 `extra_hosts` 설정
- [ ] 두 Docker Compose 독립 실행 테스트

### Phase 5: 테스트
- [ ] 로컬 환경에서 전체 스택 실행
- [ ] Crawler Service 기능 테스트
- [ ] Chatbot Service 기능 테스트
- [ ] Rate Limiting 동작 확인
- [ ] Circuit Breaker 동작 확인
- [ ] Swagger UI 통합 확인
- [ ] 성능 테스트 (부하 테스트)

### Phase 6: 프론트엔드 업데이트
- [ ] API 호출 경로 변경 (`/crawler/**` → `/api/crawler/**`)
- [ ] 에러 처리 로직 확인
- [ ] 통합 테스트

### Phase 7: 정리
- [ ] `ai.aifixr.site/gateway` 폴더 삭제
- [ ] `ai.aifixr.site/docker-compose.yaml` 유지 (독립 실행용)
- [ ] FastAPI Gateway 관련 코드 제거
- [ ] 문서 업데이트

### Phase 8: 배포
- [ ] 스테이징 환경 배포
- [ ] 스테이징 환경 검증
- [ ] 프로덕션 배포 계획 수립
- [ ] 프로덕션 배포
- [ ] 모니터링 및 알림 설정

---

## 🚀 실행 순서 요약

1. **FastAPI 서비스 독립화** (1-2시간)
   - Dockerfile 검증
   - 독립 실행 테스트

2. **Spring Gateway 설정** (2-3시간)
   - `application.yaml` 수정
   - Rate Limiting, Circuit Breaker 설정

3. **Docker Compose 분리 운영 설정** (1-2시간)
   - 네트워크 접근 방법 선택
   - URI 설정 (`host.docker.internal` 또는 외부 네트워크)

4. **테스트 및 검증** (2-4시간)
   - 기능 테스트
   - 성능 테스트
   - Swagger UI 확인

5. **프론트엔드 업데이트** (1-2시간)
   - API 경로 변경
   - 통합 테스트

6. **정리 및 배포** (1-2시간)
   - 불필요한 파일 제거
   - 문서 업데이트
   - 배포

**총 예상 시간**: 8-15시간

---

## 📊 기대 효과

### 1. 운영 효율성
- ✅ 단일 게이트웨이로 관리 복잡도 감소
- ✅ 통합 모니터링 및 로깅
- ✅ 일관된 보안 정책 적용

### 2. 성능
- ✅ 게이트웨이 홉 감소 (2-hop → 1-hop)
- ✅ Spring WebFlux의 논블로킹 I/O 활용
- ✅ Redis 기반 Rate Limiting

### 3. 확장성
- ✅ 새로운 서비스 추가 용이
- ✅ 언어에 구애받지 않는 아키텍처
- ✅ 마이크로서비스 패턴 준수

### 4. 개발 생산성
- ✅ Swagger UI 통합으로 API 문서 통합
- ✅ 일관된 에러 처리
- ✅ 표준화된 라우팅 규칙

---

## 🔄 롤백 계획

만약 통합 과정에서 문제가 발생하면:

1. **즉시 롤백**:
   ```bash
   # 기존 FastAPI Gateway 재시작
   cd ai.aifixr.site
   docker-compose up -d gateway
   ```

2. **프론트엔드 경로 복원**:
   - API 호출 경로를 원래대로 복원

3. **문제 분석**:
   - 로그 확인
   - 에러 메시지 분석
   - 네트워크 연결 확인

4. **재시도**:
   - 문제 해결 후 단계별로 재시도

---

## 📚 참고 자료

- [Spring Cloud Gateway 공식 문서](https://spring.io/projects/spring-cloud-gateway)
- [FastAPI 공식 문서](https://fastapi.tiangolo.com/)
- [Resilience4j Circuit Breaker](https://resilience4j.readme.io/docs/circuitbreaker)
- [Redis Rate Limiting](https://redis.io/docs/manual/patterns/rate-limiter/)

---

**작성일**: 2025-12-02  
**작성자**: AI Assistant  
**버전**: 1.0

