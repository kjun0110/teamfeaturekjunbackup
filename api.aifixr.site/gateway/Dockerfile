# Build stage
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app
RUN apk add --no-cache bash
COPY gradlew .
COPY gradle gradle
COPY build.gradle settings.gradle ./
COPY gateway gateway
RUN chmod +x ./gradlew
RUN ./gradlew :gateway:bootJar --no-daemon

# Runtime stage
FROM eclipse-temurin:21-jdk-alpine
VOLUME /tmp
COPY --from=build /app/gateway/build/libs/gateway-*.jar gateway.jar
ENTRYPOINT ["java", "-jar", "/gateway.jar"]
