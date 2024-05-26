const { Stack, Duration } = require('aws-cdk-lib');
const lambda = require('aws-cdk-lib/aws-lambda');
const apigateway = require('aws-cdk-lib/aws-apigateway');
const dynamodb = require('aws-cdk-lib/aws-dynamodb');

class CdkBookstoreApiStack extends Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    // Define DynamoDB table
    const table = new dynamodb.Table(this, 'BooksTable', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });

    // Define Lambda function
    const getBooksLambda = new lambda.Function(this, 'GetBooksFunction', {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('lambda'),
      environment: {
        TABLE_NAME: table.tableName,
      },
    });

    // Grant the Lambda function read access to the DynamoDB table
    table.grantReadData(getBooksLambda);

    // Define API Gateway REST API resource backed by the Lambda function
    const api = new apigateway.RestApi(this, 'booksApi', {
      restApiName: 'Books Service',
      description: 'This service serves books.',
    });

    const books = api.root.addResource('books');
    const getBooksIntegration = new apigateway.LambdaIntegration(getBooksLambda);
    books.addMethod('GET', getBooksIntegration);
  }
}

module.exports = { CdkBookstoreApiStack };
