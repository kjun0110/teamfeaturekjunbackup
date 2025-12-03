# Build stage
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app
RUN apk add --no-cache bash
COPY gradlew .
COPY gradle gradle
COPY build.gradle settings.gradle ./
COPY services/governance services/governance
COPY services/build.gradle services/
RUN chmod +x ./gradlew
RUN ./gradlew :services:governance:bootJar --no-daemon

# Runtime stage
FROM eclipse-temurin:21-jdk-alpine
VOLUME /tmp
RUN apk update && apk add --no-cache curl
COPY --from=build /app/services/governance/build/libs/governance-*.jar governance-service.jar
ENTRYPOINT ["java", "-jar", "/governance-service.jar"]

