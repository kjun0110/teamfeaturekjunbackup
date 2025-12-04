# 환경 변수 설정 가이드

## 📋 .env 파일 구성

프로젝트 루트에 `.env` 파일을 생성하고 아래 내용을 추가하세요.

```bash
# ========================================
# Neon PostgreSQL 연결 정보
# ========================================
# Neon 대시보드 > Dashboard > Connection Details 에서 확인
NEON_DB_HOST=ep-withered-pond-a11avi67.ap-southeast-1.aws.neon.tech
NEON_DB_NAME=aifixrdb
NEON_DB_USER=neondb_owner
NEON_DB_PASSWORD=your-neon-password-here

# ========================================
# Upstash Redis 연결 정보 (Gateway 전용)
# ========================================
# Upstash Console > Details 탭에서 확인
# Endpoint: awaited-insect-5667.upstash.io
# Port: 6379
# TLS/SSL: Enabled
UPSTASH_REDIS_HOST=awaited-insect-5667.upstash.io
UPSTASH_REDIS_PORT=6379
UPSTASH_REDIS_PASSWORD=your_upstash_password_here

# ========================================
# Spring 설정
# ========================================
SPRING_PROFILES_ACTIVE=production

# JPA 설정
JPA_DDL_AUTO=validate
JPA_SHOW_SQL=false

# SQL 로깅 레벨
SQL_LOG_LEVEL=INFO
SQL_PARAM_LOG_LEVEL=INFO

# ========================================
# Redis 설정 (로컬 개발용)
# ========================================
REDIS_PASSWORD=Redis0930!
```

## 🔧 Neon PostgreSQL 연결 정보 확인

### 1. Neon Console 접속
- URL: https://console.neon.tech
- 프로젝트: `aifix`

### 2. Connection String 복사
Dashboard > Connection Details 에서 확인:

```
postgresql://neondb_owner:your-password@ep-withered-pond-a11avi67.ap-southeast-1.aws.neon.tech/aifixrdb?sslmode=require
```

### 3. 환경 변수 분리
위 Connection String을 분리하여 `.env`에 입력:

- `NEON_DB_HOST`: `ep-withered-pond-a11avi67.ap-southeast-1.aws.neon.tech`
- `NEON_DB_NAME`: `aifixrdb`
- `NEON_DB_USER`: `neondb_owner`
- `NEON_DB_PASSWORD`: `your-password` (실제 비밀번호)

## 🔧 Upstash Redis 연결 정보 확인

### 1. Upstash Console 접속
- URL: https://console.upstash.com

### 2. Redis 인스턴스 선택
- Details 탭에서 연결 정보 확인

### 3. TCP 연결 정보 확인
Details 탭 > **TCP** 탭에서 다음 정보를 확인:

```
redis-cli --tls -u redis://default:********@awaited-insect-5667.upstash.io:6379
```

### 4. 환경 변수 입력
위 명령어에서 정보를 추출하여 `.env`에 입력:

- `UPSTASH_REDIS_HOST`: `awaited-insect-5667.upstash.io`
- `UPSTASH_REDIS_PORT`: `6379`
- `UPSTASH_REDIS_PASSWORD`: `********` 부분의 실제 비밀번호 (Token / Readonly Token 중 **Token** 사용)

## 📁 파일 위치

```
feature-ys/
├── .env                          # ← 여기에 모든 환경 변수 통합
├── .gitignore                    # .env 파일 제외 (이미 설정됨)
├── application-production.yaml   # 프로덕션 설정 (Neon + Upstash)
├── docker-compose.yaml           # env_file: .env 사용
└── ENV-SETUP-GUIDE.md           # 이 가이드
```

## 🔒 보안 주의사항

1. **절대 Git에 커밋하지 마세요!**
   - `.env` 파일은 `.gitignore`에 포함됨
   - 민감한 정보 포함

2. **프로덕션 환경**
   - AWS Secrets Manager
   - HashiCorp Vault
   - GitHub Secrets (CI/CD)

3. **팀 공유**
   - 안전한 채널로만 공유 (Slack DM, 1Password 등)
   - 이메일/공개 채팅 금지

## 🎯 프로파일별 설정

### 로컬 개발 (기본)
```bash
SPRING_PROFILES_ACTIVE=default
# 로컬 PostgreSQL + 로컬 Redis 사용
```

### 프로덕션 (Neon + Upstash)
```bash
SPRING_PROFILES_ACTIVE=production
# Neon PostgreSQL + Upstash Redis 사용
```

## 🐛 트러블슈팅

### Neon 연결 실패
```bash
# 1. 비밀번호 확인
cat .env | grep NEON_DB_PASSWORD

# 2. 연결 테스트
psql "postgresql://$NEON_DB_USER:$NEON_DB_PASSWORD@$NEON_DB_HOST/$NEON_DB_NAME?sslmode=require"
```

### Upstash 연결 실패
```bash
# 1. Redis CLI로 테스트
redis-cli -h $UPSTASH_REDIS_HOST -p $UPSTASH_REDIS_PORT -a $UPSTASH_REDIS_PASSWORD ping

# 2. 응답 확인
# 예상: PONG
```

## 📊 리소스 제한

### Neon (Free Plan)
- Storage: 0.5 GB
- Compute: 최대 2 CU
- Branches: 10개

### Upstash (Free Plan)
- Commands: 10,000/day
- Max Data Size: 256 MB
- Max Request Size: 1 MB

---

**이 가이드를 참고하여 `.env` 파일을 설정하세요!**

