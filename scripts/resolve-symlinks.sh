#!/bin/bash
# Resolves all symlinks in .open-next using rsync --copy-links.
# Required because Cloudflare Pages cannot deploy symlinks.
# rsync exit 23 = some files skipped (dangling symlinks) - acceptable.
OPEN_NEXT_DIR="$(pwd)/.open-next"
TEMP_DIR="${OPEN_NEXT_DIR}_tmp"
echo "Resolving symlinks in ${OPEN_NEXT_DIR}..."
rsync -a --copy-links --safe-links "${OPEN_NEXT_DIR}/" "${TEMP_DIR}/"
RSYNC_EXIT=$?
if [ $RSYNC_EXIT -ne 0 ] && [ $RSYNC_EXIT -ne 23 ]; then
  echo "rsync failed with exit code $RSYNC_EXIT"
  exit $RSYNC_EXIT
fi
rm -rf "${OPEN_NEXT_DIR}"
mv "${TEMP_DIR}" "${OPEN_NEXT_DIR}"
echo "Done resolving symlinks."
