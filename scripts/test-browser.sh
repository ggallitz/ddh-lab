#!/bin/sh
# Project-private libraries are optional; no system configuration is changed.
if [ -d "$PWD/.cache/browser-libs/usr/lib/aarch64-linux-gnu" ]; then
  export LD_LIBRARY_PATH="$PWD/.cache/browser-libs/usr/lib/aarch64-linux-gnu${LD_LIBRARY_PATH:+:$LD_LIBRARY_PATH}"
fi
if [ -z "${DDH_CHROMIUM:-}" ]; then
  for candidate in "$HOME"/.cache/ms-playwright/chromium_headless_shell-*/chrome-headless-shell-linux-*/chrome-headless-shell; do
    if [ -x "$candidate" ]; then export DDH_CHROMIUM="$candidate"; fi
  done
fi
exec playwright test "$@"
