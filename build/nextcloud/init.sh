#!/bin/sh
set -eu

# Enable custom CSS app:
./occ app:enable theming_customcss

# The app doesn't officially support Nextcloud v31 (only v29).
./occ app:enable user_external --force

# Disable some apps.
./occ app:disable \
  firstrunwizard \
  nextcloud_announcements \
  dashboard

# Run maintenance commands:
./occ maintenance:repair --include-expensive
./occ db:add-missing-indices
