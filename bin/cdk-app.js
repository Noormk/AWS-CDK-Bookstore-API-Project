#!/usr/bin/env node

const cdk = require('aws-cdk-lib');
const { CdkAppStack } = require('../lib/cdk-app-stack');

const app = new cdk.App();
new CdkAppStack(app, 'CdkAppStack', {
  
});
