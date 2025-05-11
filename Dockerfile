# Use Java 17 base image
FROM eclipse-temurin:17-jdk

# Create app directory
WORKDIR /app

# Copy everything into the container
COPY . .

RUN chmod +x mvnw

# Build the project using Maven Wrapper
RUN ./mvnw clean package -DskipTests

# Run the Spring Boot app
CMD ["java", "-jar", "target/15puzzle-0.0.1-SNAPSHOT.jar"]
