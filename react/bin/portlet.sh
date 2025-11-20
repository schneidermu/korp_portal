#!/bin/sh
set -eu

if ! [ -d /art/ ]; then
  echo >&2 "error: no volume found at /art/"
  exit 1
fi

portlet_name=korp-portal-portlet
base_portlet="/art/${portlet_name}_base.war"

out_file="/art/$(date +%F/%s).war"

pnpm panda
pnpm build

js=$(grep -oE 'index-[0-9A-Za-z_-]+.js' dist/index.html) || {
  echo >&2 "error: index js did not match"
  exit 1
}
css=$(grep -oE 'index-[0-9A-Za-z_-]+.css' dist/index.html) || {
  echo >&2 "error: index css did not match"
  exit 1
}

sed -i "s/INDEX_JS/$js/" view.jsp
sed -i "s/INDEX_CSS/$css/" view.jsp

rm -rf dist/index.html dist/dev/

mkdir -p "$(dirname "$out_file")"
cp "$base_portlet" "$out_file"
zip -r "$out_file" view.jsp dist/
cp "$out_file" "/art/$portlet_name.war"
