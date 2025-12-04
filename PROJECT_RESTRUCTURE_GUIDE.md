# 프로젝트 구조 변경 가이드

## 개요
이 문서는 `api.aifixr.site/services`를 독립 프로젝트 `core.aifixr.site`로 분리하는 리팩토링 전략을 설명합니다.

## 변경 목적
- **Gateway와 Services의 독립성 확보**: `api.aifixr.site`는 Gateway만, `core.aifixr.site`는 비즈니스 서비스만 관리
- **빌드 프로세스 최적화**: 각 프로젝트가 독립적으로 빌드 가능
- **확장성 향상**: 새로운 서비스 추가 시 명확한 구조 제공
- **Docker 빌드 단순화**: 각 서비스의 Dockerfile이 명확한 경로 참조

## 현재 구조 vs 변경 후 구조

### 변경 전
```
project/
├── api.aifixr.site/
│   ├── gateway/
│   ├── services/           # ← 이 폴더를 분리
│   │   ├── common/
│   │   ├── user/
│   │   ├── environment/
│   │   ├── social/
│   │   └── governance/
│   ├── settings.gradle     # gateway + services 포함
│   └── docker-compose.yaml
└── ai.aifixr.site/
    └── docker-compose.yaml
```

### 변경 후
```
project/
├── api.aifixr.site/
│   ├── gateway/
│   └── settings.gradle     # gateway만 포함
├── core.aifixr.site/       # ← 새로 분리된 독립 프로젝트
│   ├── common/
│   ├── user/
│   ├── environment/
│   ├── social/
│   ├── governance/
│   ├── settings.gradle     # 서비스들만 포함
│   └── build.gradle
├── ai.aifixr.site/
└── docker-compose.yaml     # ← 통합 docker-compose
```

## 단계별 마이그레이션 가이드

### 1단계: 프로젝트 구조 분리

#### 1.1. `core.aifixr.site` 폴더 생성
```bash
mkdir core.aifixr.site
```

#### 1.2. 서비스 폴더 이동
```bash
# api.aifixr.site/services의 모든 서비스를 core.aifixr.site로 복사
cp -r api.aifixr.site/services/* core.aifixr.site/
```

#### 1.3. `core.aifixr.site/settings.gradle` 생성
```gradle
rootProject.name = 'core-services'

// Service modules
include 'common'
include 'user'
include 'environment'
include 'social'
include 'governance'
```

#### 1.4. `core.aifixr.site/build.gradle` 생성
`api.aifixr.site/build.gradle`의 내용을 복사하여 생성합니다.

```gradle
plugins {
	id 'java'
	id 'org.springframework.boot' version '3.4.7' apply false
	id 'io.spring.dependency-management' version '1.1.7'
}

allprojects {
	group = 'site.aifixr'
	version = '0.0.1-SNAPSHOT'

	repositories {
		mavenCentral()
	}
}

subprojects {
	apply plugin: 'java'
	apply plugin: 'org.springframework.boot'
	apply plugin: 'io.spring.dependency-management'

	java {
		toolchain {
			languageVersion = JavaLanguageVersion.of(21)
		}
	}

	configurations {
		compileOnly {
			extendsFrom annotationProcessor
		}
	}

	dependencyManagement {
		imports {
			mavenBom "org.springframework.cloud:spring-cloud-dependencies:2024.0.1"
		}
	}

	dependencies {
		compileOnly 'org.projectlombok:lombok'
		annotationProcessor 'org.projectlombok:lombok'
		testImplementation 'org.springframework.boot:spring-boot-starter-test'
		testRuntimeOnly 'org.junit.platform:junit-platform-launcher'
	}
	
	tasks.named('test') {
		useJUnitPlatform()
	}
}
```

### 2단계: `api.aifixr.site/settings.gradle` 수정

Gateway만 포함하도록 수정합니다.

```gradle
rootProject.name = 'spring-server'

// Gateway module
include 'gateway'
```

### 3단계: Dockerfile 수정

모든 `core.aifixr.site` 서비스의 Dockerfile을 다음과 같이 수정합니다.

#### 변경 전 (예: `common/Dockerfile`)
```dockerfile
# Build stage
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app
RUN apk add --no-cache bash
COPY api.aifixr.site/gradlew .
COPY api.aifixr.site/gradle gradle
COPY api.aifixr.site/build.gradle api.aifixr.site/settings.gradle ./
COPY core.aifixr.site/common services/common
COPY core.aifixr.site/build.gradle services/
RUN chmod +x ./gradlew
RUN for i in 1 2 3; do ./gradlew :services:common:bootJar --no-daemon && break || sleep 5; done

# Runtime stage
FROM eclipse-temurin:21-jdk-alpine
VOLUME /tmp
COPY --from=build /app/services/common/build/libs/common-*.jar common-service.jar
ENTRYPOINT ["java", "-jar", "/common-service.jar"]
```

#### 변경 후
```dockerfile
# Build stage
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app
RUN apk add --no-cache bash
COPY api.aifixr.site/gradlew .
COPY api.aifixr.site/gradle gradle
COPY core.aifixr.site/build.gradle core.aifixr.site/settings.gradle ./
COPY core.aifixr.site/common common
RUN chmod +x ./gradlew
RUN for i in 1 2 3; do ./gradlew :common:bootJar --no-daemon && break || sleep 5; done

# Runtime stage
FROM eclipse-temurin:21-jdk-alpine
VOLUME /tmp
COPY --from=build /app/common/build/libs/common-*.jar common-service.jar
ENTRYPOINT ["java", "-jar", "/common-service.jar"]
```

#### 핵심 변경 사항
1. **settings.gradle 경로 변경**: `api.aifixr.site/settings.gradle` → `core.aifixr.site/settings.gradle`
2. **build.gradle 경로 변경**: `api.aifixr.site/build.gradle` → `core.aifixr.site/build.gradle`
3. **COPY 경로 단순화**: `core.aifixr.site/common services/common` → `core.aifixr.site/common common`
4. **Gradle 빌드 명령 변경**: `:services:common:bootJar` → `:common:bootJar`
5. **JAR 파일 경로 변경**: `/app/services/common/build/libs/` → `/app/common/build/libs/`
6. **services/ 디렉토리 제거**: 더 이상 중간 `services/` 디렉토리 불필요

### 4단계: 모든 서비스 Dockerfile 일괄 적용

다음 서비스들의 Dockerfile을 동일한 패턴으로 수정합니다:

#### `core.aifixr.site/user/Dockerfile`
```dockerfile
# Build stage
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app
RUN apk add --no-cache bash
COPY api.aifixr.site/gradlew .
COPY api.aifixr.site/gradle gradle
COPY core.aifixr.site/build.gradle core.aifixr.site/settings.gradle ./
COPY core.aifixr.site/user user
RUN chmod +x ./gradlew
RUN for i in 1 2 3; do ./gradlew :user:bootJar --no-daemon && break || sleep 5; done

# Runtime stage
FROM eclipse-temurin:21-jdk-alpine
VOLUME /tmp
COPY --from=build /app/user/build/libs/user-*.jar user-service.jar
ENTRYPOINT ["java", "-jar", "/user-service.jar"]
```

#### `core.aifixr.site/environment/Dockerfile`
```dockerfile
# Build stage
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app
RUN apk add --no-cache bash
COPY api.aifixr.site/gradlew .
COPY api.aifixr.site/gradle gradle
COPY core.aifixr.site/build.gradle core.aifixr.site/settings.gradle ./
COPY core.aifixr.site/environment environment
RUN chmod +x ./gradlew
RUN for i in 1 2 3; do ./gradlew :environment:bootJar --no-daemon && break || sleep 5; done

# Runtime stage
FROM eclipse-temurin:21-jdk-alpine
VOLUME /tmp
RUN apk update && apk add --no-cache curl
COPY --from=build /app/environment/build/libs/environment-*.jar environment-service.jar
ENTRYPOINT ["java", "-jar", "/environment-service.jar"]
```

#### `core.aifixr.site/social/Dockerfile`
```dockerfile
# Build stage
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app
RUN apk add --no-cache bash
COPY api.aifixr.site/gradlew .
COPY api.aifixr.site/gradle gradle
COPY core.aifixr.site/build.gradle core.aifixr.site/settings.gradle ./
COPY core.aifixr.site/social social
RUN chmod +x ./gradlew
RUN for i in 1 2 3; do ./gradlew :social:bootJar --no-daemon && break || sleep 5; done

# Runtime stage
FROM eclipse-temurin:21-jdk-alpine
VOLUME /tmp
RUN apk update && apk add --no-cache curl
COPY --from=build /app/social/build/libs/social-*.jar social-service.jar
ENTRYPOINT ["java", "-jar", "/social-service.jar"]
```

#### `core.aifixr.site/governance/Dockerfile`
```dockerfile
# Build stage
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app
RUN apk add --no-cache bash
COPY api.aifixr.site/gradlew .
COPY api.aifixr.site/gradle gradle
COPY core.aifixr.site/build.gradle core.aifixr.site/settings.gradle ./
COPY core.aifixr.site/governance governance
RUN chmod +x ./gradlew
RUN for i in 1 2 3; do ./gradlew :governance:bootJar --no-daemon && break || sleep 5; done

# Runtime stage
FROM eclipse-temurin:21-jdk-alpine
VOLUME /tmp
RUN apk update && apk add --no-cache curl
COPY --from=build /app/governance/build/libs/governance-*.jar governance-service.jar
ENTRYPOINT ["java", "-jar", "/governance-service.jar"]
```

### 5단계: Docker Compose 통합

루트에 통합 `docker-compose.yaml`을 생성합니다.

#### 핵심 포인트
1. **Build Context**: 모든 서비스는 루트(`.`)를 context로 사용
2. **Dockerfile 경로**: `dockerfile: ./core.aifixr.site/{service}/Dockerfile`
3. **네트워크 통합**: 모든 서비스가 `aifixr-network` 사용
4. **컨테이너 이름**: 간단명료하게 설정 (예: `common`, `user`, `gateway`)

```yaml
services:
  # Spring Cloud Gateway
  gateway:
    build:
      context: ./api.aifixr.site
      dockerfile: ./gateway/Dockerfile
    container_name: gateway
    ports:
      - "8080:8080"
    networks:
      - aifixr-network

  # Core Services
  common-service:
    build:
      context: .
      dockerfile: ./core.aifixr.site/common/Dockerfile
    container_name: common
    ports:
      - "8101:8080"
    networks:
      - aifixr-network

  user-service:
    build:
      context: .
      dockerfile: ./core.aifixr.site/user/Dockerfile
    container_name: user
    ports:
      - "8104:8080"
    networks:
      - aifixr-network

  environment-service:
    build:
      context: .
      dockerfile: ./core.aifixr.site/environment/Dockerfile
    container_name: environment
    ports:
      - "8105:8080"
    networks:
      - aifixr-network

  social-service:
    build:
      context: .
      dockerfile: ./core.aifixr.site/social/Dockerfile
    container_name: social
    ports:
      - "8106:8080"
    networks:
      - aifixr-network

  governance-service:
    build:
      context: .
      dockerfile: ./core.aifixr.site/governance/Dockerfile
    container_name: governance
    ports:
      - "8107:8080"
    networks:
      - aifixr-network

  # FastAPI Services
  crawler-service:
    build:
      context: ./ai.aifixr.site/feed/crawlerservice
      dockerfile: Dockerfile
    container_name: crawler-service
    ports:
      - "9001:9001"
    networks:
      - aifixr-network

  chatbot-service:
    build:
      context: ./ai.aifixr.site/rag/chatbotservice
      dockerfile: Dockerfile
    container_name: chatbot-service
    ports:
      - "9002:9002"
    networks:
      - aifixr-network

networks:
  aifixr-network:
    driver: bridge
```

### 6단계: 기존 파일 정리

변경 완료 후 불필요한 파일/폴더를 정리합니다.

```bash
# api.aifixr.site/services 폴더 삭제
rm -rf api.aifixr.site/services

# 기존 docker-compose 파일 삭제 (선택사항)
rm api.aifixr.site/docker-compose.yaml
rm ai.aifixr.site/docker-compose.yaml
```

## 검증 체크리스트

마이그레이션 후 다음 항목을 확인하세요:

### 1. 파일 구조 검증
- [ ] `core.aifixr.site/` 폴더가 루트에 생성되었는가?
- [ ] `core.aifixr.site/settings.gradle`이 존재하는가?
- [ ] `core.aifixr.site/build.gradle`이 존재하는가?
- [ ] 모든 서비스 폴더가 `core.aifixr.site/` 아래에 있는가?
- [ ] `api.aifixr.site/settings.gradle`에 gateway만 포함되어 있는가?

### 2. Dockerfile 검증
각 서비스의 Dockerfile이 다음을 포함하는지 확인:
- [ ] `COPY core.aifixr.site/build.gradle core.aifixr.site/settings.gradle ./`
- [ ] `COPY core.aifixr.site/{service} {service}` (services/ 없이)
- [ ] `./gradlew :{service}:bootJar` (services: 프리픽스 없이)
- [ ] `COPY --from=build /app/{service}/build/libs/` (services/ 없이)

### 3. Docker Compose 검증
- [ ] 루트에 `docker-compose.yaml`이 존재하는가?
- [ ] 모든 서비스가 `context: .` (루트)를 사용하는가?
- [ ] 모든 서비스가 `aifixr-network`를 사용하는가?
- [ ] 컨테이너 이름이 명확하게 설정되어 있는가?

### 4. 빌드 테스트
```bash
# 개별 서비스 빌드 테스트
docker compose build common-service
docker compose build user-service

# 전체 빌드 테스트
docker compose build

# 실행 테스트
docker compose up -d
```

### 5. Gateway 라우팅 검증
- [ ] Gateway가 정상적으로 시작되는가?
- [ ] `/api/common/**`이 common 서비스로 라우팅되는가?
- [ ] `/api/user/**`이 user 서비스로 라우팅되는가?
- [ ] Swagger UI (`/swagger-ui.html`)가 정상 동작하는가?

## 트러블슈팅

### 문제 1: "Could not find or load main class"
**원인**: JAR 파일을 찾을 수 없거나 빌드 실패

**해결책**:
1. Dockerfile에서 `core.aifixr.site/settings.gradle` 사용 확인
2. Gradle 빌드 명령에서 `:services:` 프리픽스 제거 확인
3. Docker 빌드 로그에서 실제 JAR 파일 생성 경로 확인

```bash
# 빌드 로그 확인
docker compose build common-service --no-cache --progress=plain
```

### 문제 2: "Project with path ':services' not found"
**원인**: Dockerfile이 여전히 `api.aifixr.site/settings.gradle` 사용

**해결책**:
Dockerfile 7번째 줄 확인 및 수정
```dockerfile
# 잘못된 예
COPY api.aifixr.site/build.gradle api.aifixr.site/settings.gradle ./

# 올바른 예
COPY core.aifixr.site/build.gradle core.aifixr.site/settings.gradle ./
```

### 문제 3: Gateway 라우팅 실패
**원인**: 컨테이너 이름 불일치

**해결책**:
1. `docker-compose.yaml`의 `container_name` 확인
2. `application.yaml`의 서비스 URI 확인
3. 모든 서비스가 동일 네트워크(`aifixr-network`) 사용 확인

```bash
# 네트워크 확인
docker network inspect aifixr-network

# 컨테이너 연결 상태 확인
docker compose ps
```

### 문제 4: 로컬 개발 시 Gradle 빌드 실패
**원인**: IDE가 `api.aifixr.site/settings.gradle` 참조

**해결책**:
1. `api.aifixr.site`와 `core.aifixr.site`를 별도 프로젝트로 열기
2. 또는 루트 `settings.gradle` 생성하여 두 프로젝트 모두 포함

## Dockerfile 패턴 요약

모든 `core.aifixr.site` 서비스는 다음 패턴을 따릅니다:

```dockerfile
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app
RUN apk add --no-cache bash

# Gradle wrapper 및 의존성 (api.aifixr.site에서 가져옴)
COPY api.aifixr.site/gradlew .
COPY api.aifixr.site/gradle gradle

# 빌드 설정 (core.aifixr.site에서 가져옴)
COPY core.aifixr.site/build.gradle core.aifixr.site/settings.gradle ./

# 서비스 소스 코드 (core.aifixr.site에서 가져옴)
COPY core.aifixr.site/{SERVICE_NAME} {SERVICE_NAME}

RUN chmod +x ./gradlew
RUN for i in 1 2 3; do ./gradlew :{SERVICE_NAME}:bootJar --no-daemon && break || sleep 5; done

FROM eclipse-temurin:21-jdk-alpine
VOLUME /tmp
COPY --from=build /app/{SERVICE_NAME}/build/libs/{SERVICE_NAME}-*.jar {SERVICE_NAME}-service.jar
ENTRYPOINT ["java", "-jar", "/{SERVICE_NAME}-service.jar"]
```

**{SERVICE_NAME}을 실제 서비스 이름(common, user, environment, social, governance)으로 대체**

## 이점 정리

이 리팩토링의 주요 이점:

1. **명확한 책임 분리**
   - `api.aifixr.site`: API Gateway 전용
   - `core.aifixr.site`: 비즈니스 로직 서비스 전용
   - `ai.aifixr.site`: AI/ML 서비스 전용

2. **독립적인 빌드 프로세스**
   - 각 프로젝트를 독립적으로 빌드 가능
   - 의존성 충돌 방지

3. **Dockerfile 단순화**
   - 불필요한 `services/` 중간 디렉토리 제거
   - 명확한 경로 구조

4. **확장성 향상**
   - 새로운 서비스 추가 시 명확한 위치
   - 일관된 패턴으로 유지보수 용이

5. **Docker 빌드 최적화**
   - 명확한 build context
   - 캐싱 효율성 향상

## 추가 참고사항

### 로컬 개발 환경 설정
IntelliJ IDEA나 Eclipse에서 두 프로젝트를 동시에 열려면:

1. `api.aifixr.site`를 별도 프로젝트로 open
2. `core.aifixr.site`를 별도 프로젝트로 open
3. 각 프로젝트의 Gradle 설정이 독립적으로 작동

### CI/CD 파이프라인 수정
CI/CD 파이프라인에서 다음을 고려:

```yaml
# GitHub Actions 예시
- name: Build Gateway
  run: |
    cd api.aifixr.site
    ./gradlew build

- name: Build Core Services
  run: |
    cd core.aifixr.site
    ./gradlew build
```

## 결론

이 가이드를 따르면 프로젝트 구조를 성공적으로 리팩토링할 수 있습니다. 각 단계를 신중하게 진행하고, 검증 체크리스트를 활용하여 누락된 부분이 없는지 확인하세요.

문제 발생 시 트러블슈팅 섹션을 참고하거나, 빌드 로그를 자세히 확인하여 원인을 파악하세요.
