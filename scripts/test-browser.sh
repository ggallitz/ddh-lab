#!/bin/sh
# Project-private libraries are optional; no system configuration is changed.
browser_lib_dir="$PWD/.cache/browser-libs/usr/lib/$(uname -m)-linux-gnu"
if [ -d "$browser_lib_dir" ]; then
  export LD_LIBRARY_PATH="$browser_lib_dir${LD_LIBRARY_PATH:+:$LD_LIBRARY_PATH}"
fi
if [ -d "$PWD/.cache/browser-libs/usr/share/fonts" ]; then
  export FONTCONFIG_FILE="$PWD/scripts/browser-fonts.conf"
fi
if [ -z "${DDH_CHROMIUM:-}" ]; then
  for candidate in "$HOME"/.cache/ms-playwright/chromium_headless_shell-*/chrome-headless-shell-linux-*/chrome-headless-shell; do
    if [ -x "$candidate" ]; then export DDH_CHROMIUM="$candidate"; fi
  done
fi
exec playwright test "$@"
