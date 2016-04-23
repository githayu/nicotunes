#!/bin/bash

project_dir=`pwd`

npm run pack

cd ${project_dir}/dist/osx/
zip -rq nicotunes-osx.zip nicotunes-darwin-x64

cd ${project_dir}/dist/win/
zip -rq nicotunes-win32.zip nicotunes-win32-ia32

cd ${project_dir}
node ./app/js/release

exit 0
