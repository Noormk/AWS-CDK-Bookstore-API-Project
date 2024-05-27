#!/usr/bin/env node

const cdk = require('aws-cdk-lib');
const { CdkBookstoreApiStack } = require('../lib/cdk-bookstore-api-stack');

const app = new cdk.App();
new CdkBookstoreApiStack(app, 'CdkBookstoreApiStack', {
  env: { 
    account: process.env.CDK_DEFAULT_ACCOUNT, 
    region: process.env.CDK_DEFAULT_REGION 
  }
});
