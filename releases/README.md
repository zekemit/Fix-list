# Extension builds

`fixlist-extension-<version>.zip` is the Chrome extension built from this repository at the commit that added it. Unzip it, open `chrome://extensions`, turn on Developer mode, choose Load unpacked, and select the unzipped folder. Details and limits: [docs/EXTENSION.md](../docs/EXTENSION.md).

Rebuild it with `npm run build:extension` and copy `dist-ext/fixlist-extension-<version>.zip` here. A test (`tests/ext.mjs`) fails if the zip here no longer matches what the current source builds, so it cannot silently go stale.
