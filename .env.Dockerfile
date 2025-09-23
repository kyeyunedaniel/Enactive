# Base: FrankenPHP with PHP 8.2
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
    libwebp-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js (22.x)
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y nodejs

# Install PHP extensions (Railway’s defaults + GD)
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

# Copy package files first (for build cache)
COPY package*.json ./
RUN npm ci

# Copy composer files and install PHP dependencies
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-interaction --prefer-dist --optimize-autoloader

# Copy application code
COPY . .

# Build frontend and prune dev node modules
RUN npm run build && npm prune --omit=dev --ignore-scripts

# Prepare Laravel storage & bootstrap directories
RUN mkdir -p storage/framework/{sessions,views,cache,testing} storage/logs bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

# Cache Laravel config
RUN php artisan config:cache \
    && php artisan event:cache \
    && php artisan route:cache \
    && php artisan view:cache

# Expose default port (Railway sets $PORT env anyway)
EXPOSE 8000

# Start app with FrankenPHP instead of artisan serve
CMD ["frankenphp", "php-server", "--document-root=/app/public", "--port=$PORT"]
