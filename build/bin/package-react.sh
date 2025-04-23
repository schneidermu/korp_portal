#!/bin/sh
set -eu

version=$1

timestamp=$(date +%Y-%m-%d)

cd "$(git rev-parse --show-toplevel)"
outdir="artefacts/dist/react"
mkdir -p "$outdir"

name=korp-portal-portlet

. react/.env

path="$outdir/$name-${timestamp}_v$version.war"

docker build --build-arg "NAME=$name" -t kp-portlet ./build/portlet/
docker build --target portlet -t kp-portlet-react ./react/
docker run --rm kp-portlet-react >"$path"

ln -srf "$path" "$outdir/$name.war"
