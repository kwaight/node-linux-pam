#!/bin/bash

# If on mac os skip this
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "Skipping installation on macOS"
    exit 0
fi
node-pre-gyp install --fallback-to-build
