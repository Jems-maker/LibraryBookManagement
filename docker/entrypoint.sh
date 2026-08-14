#!/bin/sh
set -e

# ------------------------------------------------------------------
# Seed the shared public volume with the image's built assets on
# first start. A named volume mounted over /var/www/html/public would
# otherwise shadow the image's built assets with an empty directory.
# ------------------------------------------------------------------
if [ -d /var/www/public-backup ] && [ -z "$(ls -A /var/www/html/public 2>/dev/null)" ]; then
    echo "[entrypoint] Seeding public volume from image backup..."
    cp -a /var/www/public-backup/. /var/www/html/public/
fi

# Ensure Laravel runtime directories exist and are writable by www-data.
# These may be mounted as named volumes, so permissions must be set at
# container start (not only at image build time).
mkdir -p \
    /var/www/html/storage/framework/cache/data \
    /var/www/html/storage/framework/sessions \
    /var/www/html/storage/framework/views \
    /var/www/html/storage/logs \
    /var/www/html/bootstrap/cache \
    /var/www/html/storage/app/public

chown -R www-data:www-data \
    /var/www/html/storage \
    /var/www/html/bootstrap/cache

# Create the public storage symlink so uploaded files (covers, QR codes)
# are served by Nginx from the shared storage volume.
ln -sfn /var/www/html/storage/app/public /var/www/html/public/storage

# Run the container command (supervisord)
exec "$@"