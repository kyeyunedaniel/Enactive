FROM dunglas/frankenphp:php8.2-bookworm

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

# Install PHP extensions (ADD GD HERE)
RUN curl -sSL https://github.com/mlocati/docker-php-extension-installer/releases/latest/download/install-php-extensions -o /usr/local/bin/install-php-extensions \
    && chmod +x /usr/local/bin/install-php-extensions \
    && install-php-extensions gd ctype curl dom fileinfo filter hash mbstring openssl pcre pdo session tokenizer xml pdo_mysql redis

# Set working directory
WORKDIR /app

# Copy Composer and project files
COPY composer.json composer.lock artisan ./
COPY . /app

# Install Composer dependencies (remove --no-dev for now to match Railway)
RUN composer install --optimize-autoloader --no-scripts --no-interaction

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

# Use Railway's default port (remove custom Caddyfile setup)
# Let Railway handle the port configuration

# Create start script
RUN echo '#!/bin/sh\nfrankenphp php-server --root /app/public' > /start-container.sh \
    && chmod +x /start-container.sh

# Start the container
CMD ["/start-container.sh"]