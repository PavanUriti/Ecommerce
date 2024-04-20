# E-Commerce Microservices System

## Introduction

This assignment focuses on building a microservices-based system for a simple e-commerce application using Node.js, MongoDB, RabbitMQ, Redis, and Cloudinary. The system will handle user authentication, product management, and order processing, with a strong emphasis on concurrency control, high availability and rate limiting.

## Microservices Architecture

### Portal Microservice

- Responsible for handling API requests from clients.
- Implements user authentication, product CRUD operations, and order CRUD operations.
- Uses Express.js for building RESTful APIs.
- Utilizes JSON Web Tokens (JWT) for authentication and role-based access control (RBAC).
- Integrates rate limiting using Redis to prevent abuse and maintain system performance.

### Product-Consumer Microservice

- Processes product-related data asynchronously.
- Listens to RabbitMQ queues for product CRUD operations initiated by the portal.
- Implements business logic for managing products and updates to the database (MongoDB).

### Order-Consumer Microservice

- Processes order-related data asynchronously.
- Listens to RabbitMQ queues for order management operations initiated by the portal.
- Implements business logic for managing orders, order processing, and updates to the database (MongoDB).

## Image Storage

- Utilizes Cloudinary as the image storage solution for product images.
- Integrates Cloudinary SDK for uploading, managing, and serving images within the application.

### High Availability

- Utilize Docker Swarm for clustering and high availability.
- Deploy microservices across multiple nodes in a Swarm to ensure fault tolerance and continuous uptime.

## Deployment Steps

### Local Development with Docker Compose

1. Create Docker Compose tags: docker-compose -f docker-compose.yml build

2. Start the services: docker-compose -f docker-compose.yml up -d

3. Access the microservice API at `http://localhost:PORT` (replace `PORT` with the specified port in the Docker Compose file).

### Deployment on Docker Swarm

1. Initialize Docker Swarm: docker swarm init

2. Deploy the stack: docker stack deploy -c docker-stack.yml <stack-name>

3. Access the deployed services on the Swarm cluster.

4. Remove the stack: docker stack rm <stack-name>
