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
