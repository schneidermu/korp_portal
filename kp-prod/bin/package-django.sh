#!/bin/sh
set -eu

version=$1
outdir=$2

timestamp=$(date +%Y-%m-%d)

name="kp-django-${timestamp}_v$version"

path="$outdir/$name.tar"

mkdir -p "$outdir"
git archive --prefix="$name/" -o "$path" HEAD
tar --delete -f "$path" "$name/react/" "$name/kp-dev/"
gzip "$path"
