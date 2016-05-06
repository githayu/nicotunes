#!/bin/bash

# 0: Mac & Linux
# 1: Win32
# 2: Win64

readonly LINUX=(amd64 i386)
readonly WINDOWS=(ia32 x64)
readonly PROJECT_DIR=`pwd`
readonly PROJECT_NAME=`cat ${PROJECT_DIR}/app/package.json | jq -r .name`
readonly PROJECT_VER=`cat ${PROJECT_DIR}/app/package.json | jq -r .version`

# rm -dr ./dist

# Distribution
# npm run dist

cd ${PROJECT_DIR}/dist/
mkdir -p ./release

# OSX
if [ -d ./${PROJECT_NAME}-darwin-x64 ]; then
  cd ${PROJECT_DIR}/dist/${PROJECT_NAME}-darwin-x64

  # app
  if [ -f ${PROJECT_NAME}-${PROJECT_VER}-mac.zip ]; then
    mv ${PROJECT_NAME}-${PROJECT_VER}-mac.zip ../release/${PROJECT_NAME}-${PROJECT_VER}-mac-app.zip
  fi

  # dmg
  if [ -f ${PROJECT_NAME}-${PROJECT_VER}.dmg ]; then
    zip ../release/${PROJECT_NAME}-${PROJECT_VER}-mac-dmg.zip ${PROJECT_NAME}-${PROJECT_VER}.dmg
  fi
fi

cd ${PROJECT_DIR}/dist/

# Linux
for i in ${LINUX[@]}; do
  if [ -f ${PROJECT_NAME}-${PROJECT_VER}-${i}.deb ]; then
    zip ./release/${PROJECT_NAME}-${PROJECT_VER}-linux-${i}.zip ${PROJECT_NAME}-${PROJECT_VER}-${i}.deb
  fi
done

# Windows 32 64 zip
for i in ${WINDOWS[@]}; do
  cd ${PROJECT_DIR}/dist/
  dir="${PROJECT_NAME}-win32-${i}"
  if [ -d $dir ]; then
    zip -qr ./release/${PROJECT_NAME}-${PROJECT_VER}-win-${i}.zip $dir
  fi
done

# Windows 32 exe
if [ -f ${PROJECT_DIR}/dist/win/${PROJECT_NAME}Setup-${PROJECT_VER}-ia32.exe ]; then
  cd ${PROJECT_DIR}/dist/win
  zip ../release/NicoTunesSetup-${PROJECT_VER}-win-ia32.zip ${PROJECT_NAME}Setup-${PROJECT_VER}-ia32.exe
fi

# Windows 64 exe
if [ -f ${PROJECT_DIR}/dist/win-x64/${PROJECT_NAME}Setup-${PROJECT_VER}.exe ]; then
  cd ${PROJECT_DIR}/dist/win-x64
  zip ../release/NicoTunesSetup-${PROJECT_VER}-win-x64.zip ${PROJECT_NAME}Setup-${PROJECT_VER}.exe
fi
