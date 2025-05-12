#!/bin/bash

# This script launches Chrome with our extension loaded for testing

# Get the absolute path of the extension directory
EXTENSION_PATH=$(pwd)

echo "Launching Chrome with the extension loaded from: $EXTENSION_PATH"
echo "Visit test.html or a D&D website to test the extension"

# Launch Chrome with a new temporary profile and load the extension
# Note: this assumes Chrome is installed at the standard location
# Modify this path if Chrome is installed elsewhere on your system
google-chrome \
  --disable-web-security \
  --user-data-dir=/tmp/chrome-test-profile \
  --load-extension="$EXTENSION_PATH" \
  --no-first-run \
  file://$EXTENSION_PATH/test.html
