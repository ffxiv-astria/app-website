#!/usr/bin/env bash
set -euo pipefail
export COPYFILE_DISABLE=1

DEPLOY_HOST="${DEPLOY_HOST:-lite}"
DEPLOY_DIR="${DEPLOY_DIR:-/var/www/astria}"
TMP_ROOT=".tmp/deploy-dist"
ARCHIVE_NAME="second-saturn-dist.tar.gz"
ARCHIVE_PATH="${TMP_ROOT}/${ARCHIVE_NAME}"

for bin in tar scp ssh; do
  if ! command -v "${bin}" >/dev/null 2>&1; then
    echo "${bin} is required"
    exit 1
  fi
done

echo "Building production site"
pnpm build

if [ ! -d "dist" ]; then
  echo "Missing build output: dist"
  exit 1
fi

echo "Preparing archive: ${ARCHIVE_PATH}"
mkdir -p "${TMP_ROOT}"
rm -f "${ARCHIVE_PATH}"

pushd dist >/dev/null
shopt -s dotglob nullglob
DIST_ENTRIES=(*)
popd >/dev/null

if [ "${#DIST_ENTRIES[@]}" -eq 0 ]; then
  echo "Build output is empty: dist"
  exit 1
fi

tar \
  --no-xattrs \
  --no-mac-metadata \
  --exclude='._*' \
  --exclude='.DS_Store' \
  -czf "${ARCHIVE_PATH}" \
  -C dist \
  "${DIST_ENTRIES[@]}"

echo "Uploading to ${DEPLOY_HOST}:~/$(basename "${ARCHIVE_PATH}")"
scp "${ARCHIVE_PATH}" "${DEPLOY_HOST}:~/"

echo "Extracting on ${DEPLOY_HOST}:${DEPLOY_DIR}"
ssh "${DEPLOY_HOST}" "mkdir -p ${DEPLOY_DIR} && cd ${DEPLOY_DIR} && find . -mindepth 1 -maxdepth 1 -exec rm -rf {} + && tar -xzf ~/${ARCHIVE_NAME} && find . -name '._*' -type f -delete"

echo "Cleaning remote archive"
ssh "${DEPLOY_HOST}" "rm ~/${ARCHIVE_NAME}"

echo "Cleaning local archive"
rm -f "${ARCHIVE_PATH}"

echo "Deploy upload completed: ${DEPLOY_HOST}:${DEPLOY_DIR}"
