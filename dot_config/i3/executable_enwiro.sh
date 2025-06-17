#!/bin/bash

export RUST_PATH="/home/kantord/.cargo/bin/"
export PATH="$PATH:$RUST_PATH"

if command -v enwiro >/dev/null 2>&1; then
    exec enwiro "$@"
else
    exec "$@"
fi
