#!/bin/bash

# 0: Mac & Linux
# 1: Win32
# 2: Win64

readonly LINUX=(amd64 i386)
readonly PROJECT_DIR=`pwd`
readonly PROJECT_NAME=`cat ${PROJECT_DIR}/app/package.json | jq -r .name`
readonly PROJECT_VER=`cat ${PROJECT_DIR}/app/package.json | jq -r .version`

# Distribution
# case $CIRCLE_NODE_INDEX in
#   0) node_modules/.bin/build --platform darwin --platform linux --arch all ;;
#   1) node_modules/.bin/build --platform win32 --arch ia32 ;;
#   2) node_modules/.bin/build --platform win32 --arch x64 ;;
# esac

cd ${PROJECT_DIR}/dist/

mkdir -p ./release

if [ -d ${PROJECT_DIR}/dist/${PROJECT_NAME}-darwin-x64 -a ${PROJECT_DIR}/dist/${PROJECT_NAME}-darwin-x64/${PROJECT_NAME}.app ]; then
  cd ${PROJECT_DIR}/dist/${PROJECT_NAME}-darwin-x64
  zip ../release/${PROJECT_NAME}-${PROJECT_VER}-mac.zip ${PROJECT_NAME}.app
fi

cd ${PROJECT_DIR}/dist/

for i in ${LINUX[@]}; do
  if [ -e ${PROJECT_NAME}-${PROJECT_VER}-${i}.deb ]; then
    zip release/${PROJECT_NAME}-${PROJECT_VER}-${i}.zip ${PROJECT_NAME}-${PROJECT_VER}-${i}.deb
  fi
done

cd ${PROJECT_DIR}/dist/

if [ -d ${PROJECT_DIR}/dist/win -a ${PROJECT_DIR}/dist/win/${PROJECT_NAME}Setup-${PROJECT_VER}-ia32.exe ]; then
  cd ${PROJECT_DIR}/dist/win
  zip ../release/NicoTunesSetup-${PROJECT_VER}-ia32.zip ${PROJECT_NAME}Setup-${PROJECT_VER}-ia32.exe
fi ;;

if [ -d ${PROJECT_DIR}/dist/win-x64 -a ${PROJECT_DIR}/dist/win/${PROJECT_NAME}Setup-${PROJECT_VER}.exe ]; then
  cd ${PROJECT_DIR}/dist/win-x64
  zip ../release/NicoTunesSetup-${PROJECT_VER}.zip ${PROJECT_NAME}Setup-${PROJECT_VER}.exe
fi
