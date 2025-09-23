# Use FrankenPHP (same as Railway was using)
FROM dunglas/frankenphp:php8.2.29-bookworm

# Install system dependencies
RUN apt-get update && apt-get install -y \
    ca-certificates \
    git \
    unzip \
    zip \
    curl \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js (same version Railway was using)
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y nodejs

# Install PHP extensions (including the ones Railway was installing + GD)
RUN install-php-extensions \
    ctype \
    curl \
    dom \
    fileinfo \
    filter \
    hash \
    mbstring \
    openssl \
    pcre \
    pdo \
    session \
    tokenizer \
    xml \
    pdo_mysql \
    redis \
    gd

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /app

# Copy package files first (for better caching)
COPY package*.json ./

# Install Node dependencies
RUN npm ci

# Copy composer files
COPY composer.json composer.lock ./

# Install PHP dependencies
RUN composer install --optimize-autoloader --no-scripts --no-interaction --no-dev

# Copy application code
COPY . .

# Prune dev node modules and build assets
RUN npm prune --omit=dev --ignore-scripts
RUN npm run build

# Create Laravel required directories and set permissions
RUN mkdir -p storage/framework/{sessions,views,cache,testing} storage/logs bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

# Cache Laravel configuration (only in production)
RUN php artisan config:cache \
    && php artisan event:cache \
    && php artisan route:cache \
    && php artisan view:cache

# Create start script
RUN echo '#!/bin/bash\nphp artisan serve --host=0.0.0.0 --port=$PORT' > /start-container.sh \
    && chmod +x /start-container.sh

# Expose port
EXPOSE $PORT

# Start the application
CMD ["/start-container.sh"]