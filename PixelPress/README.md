# Pixelpress — Image compressor and converter

Pixelpress is a browser-only image utility for compressing, resizing, cropping, and converting JPG, PNG, WebP, and supported AVIF images.

## Features

- Drag-and-drop or file-picker input
- Local-only processing with Canvas APIs
- Fit-to-bounds, custom width, custom height, and original-size modes
- Numeric crop controls with center-crop presets
- JPG, PNG, WebP, and feature-detected AVIF output
- Quality slider for lossy formats
- JPG transparency background color
- Original vs processed preview
- File size, dimensions, format, and savings comparison
- Download processed image
- Copy a compact result summary
- Responsive desktop and mobile layout

## Run

Open `index.html` directly in a modern browser. No build step, server, account, or dependency is required.

## Privacy

Pixelpress does not upload or store image files remotely. The selected file is decoded and processed in the browser. Object URLs are revoked when the image is replaced or reset.

## Browser notes

AVIF output is shown only when the browser's Canvas encoder reports support. PNG output is lossless and does not use the quality slider. JPG cannot retain transparency, so transparent pixels are composited over the selected background color.

## Design language

The reusable visual system, component rules, motion principles, responsive layout guidance, content voice, and accessibility guardrails are documented in [design-language.md](design-language.md).
