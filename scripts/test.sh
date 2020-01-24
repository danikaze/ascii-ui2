#!/usr/bin/env bash

PWD=`pwd`
PROJECT_ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"/..
VR_TEST_FILES="test/index.ts"
UNIT_TEST_FILES="src/**/__test/**/*.spec.ts"
NODE_PARAMS=""
TEST_FILES=""
TYPE=""

while test $# -gt 0
do
  case "$1" in
    --vr) TYPE="${TYPE}VR"
       ;;
    --ut) TYPE="${TYPE}UT"
      ;;
    --all) TYPE="VRUT"
       ;;
    --debug) NODE_PARAMS="${NODE_PARAMS} --inspect-brk"
       ;;
    --*) echo "Unknown param $1" && exit 1
      ;;
    *) TEST_FILES="${TEST_FILES} ${PWD}/$1"
      ;;
  esac
  shift
done

if [[ ${TYPE} == "" ]]; then
  echo "* Error: One of the following options is required: --vr | --ut | --all"
  exit 1
fi

NYC="node_modules/nyc/bin/nyc.js node_modules/mocha/bin/mocha -r node_modules/ts-node/register${NODE_PARAMS} -r tsconfig-paths/register --timeout 5000"

if [[ ${TYPE} =~ "UT" ]]; then
  if [[ ${TEST_FILES} == "" ]]; then
    TEST_FILES="${UNIT_TEST_FILES}"
  fi
fi

if [[ ${TYPE} =~ "VR" ]]; then
  TEST_FILES="${VR_TEST_FILES} ${TEST_FILES}"
fi

cd "${PROJECT_ROOT}"

$NYC ${TEST_FILES}
EXIT_CODE=$?

cd "${PWD}"

exit ${EXIT_CODE}