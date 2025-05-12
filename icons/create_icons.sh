#!/bin/bash

# This script creates placeholder icons for the extension
# It requires ImageMagick to be installed
# To install ImageMagick: sudo apt-get install imagemagick

# Create 16x16 icon
convert -size 16x16 -background '#2196F3' -fill white -gravity center -font Arial -pointsize 10 label:DM icons/icon16.png

# Create 48x48 icon
convert -size 48x48 -background '#2196F3' -fill white -gravity center -font Arial -pointsize 24 label:DM icons/icon48.png

# Create 128x128 icon
convert -size 128x128 -background '#2196F3' -fill white -gravity center -font Arial -pointsize 64 label:DM icons/icon128.png

echo "Icons created in the icons directory"
