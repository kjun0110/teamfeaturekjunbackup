# Build stage
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app
RUN apk add --no-cache bash
COPY gradlew .
COPY gradle gradle
COPY build.gradle settings.gradle ./
COPY services/environment services/environment
COPY services/build.gradle services/
RUN chmod +x ./gradlew
RUN ./gradlew :services:environment:bootJar --no-daemon

# Runtime stage
FROM eclipse-temurin:21-jdk-alpine
VOLUME /tmp
RUN apk update && apk add --no-cache curl
COPY --from=build /app/services/environment/build/libs/environment-*.jar environment-service.jar
ENTRYPOINT ["java", "-jar", "/environment-service.jar"]
