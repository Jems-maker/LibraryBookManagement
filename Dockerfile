# Dockerfile for Library Management System
# Multi-stage build for production optimization

# Stage 1: Node.js build for frontend assets
FROM node:20-alpine AS node-builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install Node dependencies and build
RUN npm install && npm run build

# Stage 2: PHP 8.3 FPM for application
FROM php:8.3-fpm-alpine

# Install system dependencies
RUN apk update && apk add --no-cache \
    nginx \
    supervisor \
    libpng-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    libwebp-dev \
    libxpm-dev \
    libzip-dev \
    icu-dev \
    oniguruma-dev \
    mysql-client \
    curl \
    git \
    unzip \
    zip \
    sqlite-dev \
    sqlite \
    && pecl install redis \
    && docker-php-ext-configure gd --with-freetype --with-jpeg --with-webp \
    && docker-php-ext-install pdo_mysql mbstring zip bcmath gd intl opcache \
    && docker-php-ext-enable redis \
    && rm -rf /var/cache/apk/*

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/html

# Copy composer files
COPY composer.json composer.lock ./

# Install PHP dependencies (without dev dependencies)
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist

# Copy application code
COPY . .

# Copy built assets from Node stage
COPY --from=node-builder /app/public/build ./public/build

# Complete Composer installation
RUN composer dump-autoload --optimize \
    && composer run-script post-autoload-dump \
    && composer run-script post-update-cmd \
    && composer run-script post-root-package-install \
    && composer run-script post-create-project-cmd \
    && composer run-script pre-package-uninstall \
    && composer run-script post-package-install

# Configure PHP-FPM
RUN mkdir -p /var/run/php-fpm && chown -R www-data:www-data /var/www/html

# Copy Nginx configuration
COPY docker/nginx.conf /etc/nginx/http.d/default.conf

# Copy Supervisor configuration
COPY docker/supervisord.conf /etc/supervisord.conf

# Create storage directories and set permissions
RUN mkdir -p storage/framework/{cache,sessions,views} \
    && mkdir -p storage/logs \
    && mkdir -p bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache

# Expose ports
EXPOSE 80 443

# Start Supervisor to manage services
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisord.conf"]