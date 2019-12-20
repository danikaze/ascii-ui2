#!/usr/bin/env bash

##
# Retrieve a field value from a json file:
#  getJsonField "filename.json" "fieldName"
##
getJsonField() {
  local filename=$1
  local field=$2

  local value=$(cat "$filename" \
    | grep "\"$field\"" \
    | head -1 \
    | awk -F: '{ print $2 }' \
    | sed 's/[",]//g' \
    | tr -d '[[:space:]]')

  echo "$value"
}

##
# Stops the execution of the build with an error code and error message
##
error() {
  local errorCode=$1
  local errorMsg=$2
  echo -e " ${C_RED}(!)${C_DEFAULT} Build stopped because of an error while ${C_YELLOW}${errorMsg}${C_DEFAULT}"
  exit $errorCode
}

C_YELLOW='\033[1;37m'
C_RED='\033[1;31m'
C_DEFAULT='\033[0m'
PWD=`pwd`
PROJECT_ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"/..
TARGET_DIR="${PROJECT_ROOT}/dist"
TSC="${PROJECT_ROOT}/node_modules/.bin/tsc --project tsconfig.build.json"
PACKAGE_JSON="${PROJECT_ROOT}/package.json"
MANIFEST_JSON="${PROJECT_ROOT}/manifest.json"
PACKAGE_NAME=$(getJsonField "${PACKAGE_JSON}" name)
PACKAGE_VERSION=$(getJsonField "${PACKAGE_JSON}" version)

# Execute the tests
echo -e "* Running the tests..."
npm run test || error 1 "running the tests"

# Generate built files in the `app` folder
echo -e "* Building ${C_YELLOW}${PACKAGE_NAME}-${PACKAGE_VERSION}${C_DEFAULT}..."
$TSC || error 2 "executing tsc"

# Copy package.json without the "security" private field
echo -e "* Copying ${C_YELLOW}package.json${C_DEFAULT} for publishing npm..."
cat "${PACKAGE_JSON}" | grep -v "private" > "${TARGET_DIR}/package.json" || error 3 "copying package.json"

# Copy other files to include in the npm
echo -e "* Copying ${C_YELLOW}README.md${C_DEFAULT} to be included within the npm..."
cp "${PROJECT_ROOT}/README.md" "${TARGET_DIR}/README.md" || error 4 "copying README.md"

# Ask to publish the npm
echo
read -p "Publish npm? [y/N] " -n1 ans
echo
if [[ $ans =~ [yY] ]]; then
  echo -e "* Publishing ${C_YELLOW}${PACKAGE_NAME}-${PACKAGE_VERSION}${C_DEFAULT}..."
  cd "${TARGET_DIR}"
  npm publish
fi

echo
cd "${PWD}"
