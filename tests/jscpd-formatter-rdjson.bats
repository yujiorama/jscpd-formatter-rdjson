#!/usr/bin/env bats

export BATS_TMPDIR
BATS_TMPDIR="${BATS_TEST_DIRNAME}/tmp"

setup() {
  export BATS_TEST_TMPDIR
  BATS_TEST_TMPDIR="$(mktemp -d -p "${BATS_TMPDIR}")"
}

teardown() {
  rm -rf "${BATS_TEST_TMPDIR}"
}

main() {
  node "${BATS_TEST_DIRNAME}/../src/jscpd-formatter-rdjson/index.js" "$@"
}

@test "require gron" {
  run gron --version
  [[ "${status}" -eq 0 ]]
}

@test "require jscpd" {
  run jscpd --version
  [[ "${status}" -eq 0 ]]
}

@test "duplication of javascript" {
  jscpd --format javascript \
    --reporters json \
    --min-tokens 10 \
    --min-lines 5 \
    --output "${BATS_TEST_TMPDIR}" \
    "${BATS_TEST_DIRNAME}/../testdata/javascript/input"

  subject="${BATS_TEST_TMPDIR}/jscpd-report.json"
  expected="${BATS_TEST_DIRNAME}/../testdata/javascript/duplication.json"
  run main "${subject}"
  echo "${output}"
  [[ "${status}" -eq 0 ]]

  diff -u <(echo "${output}" | gron -m) <(gron -m "${expected}")
}

@test "duplication of perl" {
  jscpd --format perl \
    --reporters json \
    --min-tokens 10 \
    --min-lines 5 \
    --output "${BATS_TEST_TMPDIR}" \
    "${BATS_TEST_DIRNAME}/../testdata/perl/input"

  subject="${BATS_TEST_TMPDIR}/jscpd-report.json"
  expected="${BATS_TEST_DIRNAME}/../testdata/perl/duplication.json"
  run main "${subject}"
  echo "${output}"
  [[ "${status}" -eq 0 ]]

  diff -u <(echo "${output}" | gron -m) <(gron -m "${expected}")
}

@test "duplication of go" {
  jscpd --format go \
    --reporters json \
    --min-tokens 10 \
    --min-lines 5 \
    --output "${BATS_TEST_TMPDIR}" \
    "${BATS_TEST_DIRNAME}/../testdata/go/input"

  subject="${BATS_TEST_TMPDIR}/jscpd-report.json"
  expected="${BATS_TEST_DIRNAME}/../testdata/go/duplication.json"
  run main "${subject}"
  echo "${output}"
  [[ "${status}" -eq 0 ]]

  diff -u <(echo "${output}" | gron -m) <(gron -m "${expected}")
}
