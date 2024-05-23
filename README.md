# `hello.nrfcloud.com` asset_tracker_v2 ingest

[![GitHub Actions](https://github.com/hello-nrfcloud/asset_tracker_v2-to-lwm2m/workflows/Test%20and%20Release/badge.svg)](https://github.com/hello-nrfcloud/asset_tracker_v2-to-lwm2m/actions/workflows/test-and-release.yaml)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![Renovate](https://img.shields.io/badge/renovate-enabled-brightgreen.svg)](https://renovatebot.com)
[![@commitlint/config-conventional](https://img.shields.io/badge/%40commitlint-config--conventional-brightgreen)](https://github.com/conventional-changelog/commitlint/tree/master/@commitlint/config-conventional)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier/)
[![ESLint: TypeScript](https://img.shields.io/badge/ESLint-TypeScript-blue.svg)](https://github.com/typescript-eslint/typescript-eslint)

Converts `asset_tracker_v2` messages to LwM2M objects which is the format
expected by `hello.nrfcloud.com`.

## Installation in your AWS account

### Setup

[Provide your AWS credentials](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-authentication.html).

### Install the dependencies

```bash
npm ci
```

### Deploy

```bash
npx cdk bootstrap # if this is the first time you use CDK in this account
npx cdk deploy --all
```
