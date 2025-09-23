FROM dunglas/frankenphp:php8.2.29-bookworm

# Set labels
LABEL maintainer="Railway"

# Environment variables
ENV DEBIAN_FRONTEND=noninteractive \
    PHP_INI_DIR=/usr/local/etc/php/conf.d \
    APP_BASE_PATH=/app \
    CADDY_GLOBAL_OPTIONS=""

# Install system dependencies and clean up
RUN apt-get update && apt-get install -y \
    ca-certificates \
    git \
    unzip \
    zip \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js 22
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y nodejs \
    && npm install -g npm \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN curl -sSL https://github.com/mlocati/docker-php-extension-installer/releases/latest/download/install-php-extensions -o /usr/local/bin/install-php-extensions \
    && chmod +x /usr/local/bin/install-php-extensions \
    && install-php-extensions ctype curl dom fileinfo filter hash mbstring openssl pcre pdo session tokenizer xml pdo_mysql redis

# Set working directory
WORKDIR /app

# Copy Composer and project files
COPY composer.json composer.lock artisan ./
COPY . /app

# Install Composer dependencies
RUN composer install --optimize-autoloader --no-scripts --no-interaction --no-dev

# Install Node dependencies and build assets
COPY package.json package-lock.json* ./
RUN npm ci && npm prune --omit=dev --ignore-scripts && npm run build

# Create Laravel storage directories and set permissions
RUN mkdir -p storage/framework/{sessions,views,cache,testing} storage/logs bootstrap/cache \
    && chmod -R a+rw storage bootstrap/cache

# Cache Laravel configurations
RUN php artisan config:cache \
    && php artisan event:cache \
    && php artisan route:cache \
    && php artisan view:cache

# Create Caddyfile for FrankenPHP
RUN echo "{\n  auto_https off\n}\n\n:8000 {\n  root * /app/public\n  php_server\n}" > /Caddyfile

# Create start script (mimicking Railway's /start-container.sh)
RUN echo '#!/bin/sh\nfrankenphp php-server --root /app/public --listen 0.0.0.0:8000' > /start-container.sh \
    && chmod +x /start-container.sh

# Expose port
EXPOSE 8000

# Start the container
CMD ["/start-container.sh"]