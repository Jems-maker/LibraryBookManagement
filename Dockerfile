# =====================================================================
# Library Management System — Production Dockerfile
#
# Architecture:
#   Internet → Nginx (separate container) → Laravel PHP-FPM (this image)
#                                              ├── MySQL (internal)
#                                              └── Redis (internal)
#
# This image builds the React/Vite frontend and runs PHP-FPM.
# Nginx runs in a separate container (see docker-compose.yml).
# =====================================================================

# ---------- Stage 1: Build frontend assets (Node) ----------
FROM node:20-alpine AS node-builder

WORKDIR /app

# Install exact dependencies from the lockfile (reproducible builds).
# .npmrc is copied because it sets ignore-scripts=true, which must be
# honored consistently for the build to match local behavior.
COPY package.json package-lock.json .npmrc ./
RUN npm ci

# Copy only the source/config files Vite actually needs.
COPY vite.config.ts tsconfig.json tailwind.config.js postcss.config.js ./
COPY resources ./resources

# Build production assets → public/build (laravel-vite-plugin default)
RUN npm run build

# ---------- Stage 2: Laravel runtime (PHP-FPM) ----------
FROM php:8.3-fpm-alpine

# System dependencies + PHP extensions.
# NOTE: nginx is intentionally NOT installed here — it runs as a separate
# container and talks to this container over the Docker network (app:9000).
RUN apk add --no-cache \
        libpng-dev \
        libjpeg-turbo-dev \
        freetype-dev \
        libwebp-dev \
        libxpm-dev \
        libzip-dev \
        icu-dev \
        oniguruma-dev \
        curl \
        git \
        unzip \
        zip \
        supervisor \
    && pecl install redis \
    && docker-php-ext-configure gd --with-freetype --with-jpeg --with-webp \
    && docker-php-ext-install pdo_mysql mbstring zip bcmath gd intl opcache \
    && docker-php-ext-enable redis \
    && rm -rf /var/cache/apk/*

# Composer (pinned major for reproducibility)
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Install production PHP dependencies.
# --no-scripts avoids running arbitrary lifecycle scripts at build time
# (e.g. post-create-project-cmd which would generate keys/migrate).
# Laravel package discovery is run explicitly afterwards.
COPY composer.json composer.lock ./
RUN composer install \
        --no-dev \
        --prefer-dist \
        --optimize-autoloader \
        --no-interaction \
        --no-scripts

# Copy application source (secrets excluded via .dockerignore)
COPY . .

# Copy built frontend assets from the Node stage
COPY --from=node-builder /app/public/build ./public/build

# Finalize autoloader + Laravel package discovery
RUN composer dump-autoload --optimize --no-dev --classmap-authoritative --no-scripts \
    && php artisan package:discover --ansi

# Backup the public directory so the entrypoint can seed the shared
# laravel_public volume on first start (a named volume would otherwise
# shadow the image's built assets with an empty directory).
RUN cp -a /var/www/html/public /var/www/public-backup

# PHP configuration
COPY docker/php.ini /usr/local/etc/php/conf.d/custom.ini

# Supervisor config (php-fpm + queue worker + scheduler; NO nginx)
COPY docker/supervisord.conf /etc/supervisord.conf

# Entrypoint: prepare storage dirs/permissions + storage symlink
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# Prepare runtime directories
RUN mkdir -p storage/framework/cache/data \
        storage/framework/sessions \
        storage/framework/views \
        storage/logs \
        bootstrap/cache \
        storage/app/public \
    && chown -R www-data:www-data storage bootstrap/cache

# PHP-FPM listens on 9000 (internal only; not published to the host)
EXPOSE 9000

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisord.conf"]
