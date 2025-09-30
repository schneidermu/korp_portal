#!/bin/bash
set -eu

if [ $# != 1 ]; then
  echo >&2 "usage: $0 <portlet-name>"
  exit 2
fi

portlet_name=$1

if ! [ -d /art/ ]; then
  echo >&2 "error: no volume found at /art/"
  exit 1
fi

out_file="/art/${portlet_name}_base.war"

blade create -t war-mvc-portlet -v 7.0 \
  -p "com.example.$portlet_name" \
  -c "$portlet_name" \
  "$portlet_name"

cp build.gradle "modules/$portlet_name/"
./gradlew build

# Customize WAR: remove extra files, fix casing in roles.
mkdir /war
cd /war
unzip -q "/workspace/modules/$portlet_name/build/libs/$portlet_name.war"
rm -rf view.jsp css/
# TODO
# sed -i /css/d WEB-INF/liferay-portlet.xml
sed -i s/administator/Administator/ WEB-INF/*portlet.xml
sed -i s/guest/Guest/ WEB-INF/*portlet.xml
sed -i 's/power-user/Power-User/' WEB-INF/*portlet.xml
sed -i s/user/User/ WEB-INF/*portlet.xml

rm -f "$out_file"
zip -r "$out_file" .
