#!/bin/sh
set -eu

version=$1

timestamp=$(date +%Y-%m-%d)

cd "$(git rev-parse --show-toplevel)"
outdir="artefacts/dist/django"

name="kp-django-${timestamp}_v$version"

path="$outdir/$name.tar"

mkdir -p "$outdir"
git archive --prefix="$name/" -o "$path" HEAD
tar --delete -f "$path" "$name/react/" "$name/kp-dev/"
gzip "$path"
