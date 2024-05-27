const cdk = require('aws-cdk-lib');
const { Stack } = cdk;
const lambda = require('aws-cdk-lib/aws-lambda');
const apigateway = require('aws-cdk-lib/aws-apigateway');
const dynamodb = require('aws-cdk-lib/aws-dynamodb');

class CdkBookstoreApiStack extends Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    const table = new dynamodb.Table(this, 'BooksTable', {
      partitionKey: { name: 'BookID', type: dynamodb.AttributeType.STRING },
      tableName: 'BooksTable',
    });

    const lambdaFunction = new lambda.Function(this, 'BooksFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      code: lambda.Code.fromAsset('lambda'),
      handler: 'index.handler',
      environment: {
        TABLE_NAME: table.tableName,
        REGION: 'eu-west-1'
      }
    });

    table.grantReadWriteData(lambdaFunction);

    const api = new apigateway.RestApi(this, 'booksApi', {
      restApiName: 'Books Service'
    });

    const books = api.root.addResource('books');
    const singleBook = books.addResource('{id}');

    const getBooksIntegration = new apigateway.LambdaIntegration(lambdaFunction);
    books.addMethod('GET', getBooksIntegration);
    books.addMethod('POST', getBooksIntegration);

    const singleBookIntegration = new apigateway.LambdaIntegration(lambdaFunction);
    singleBook.addMethod('GET', singleBookIntegration);
    singleBook.addMethod('PUT', singleBookIntegration);
    singleBook.addMethod('DELETE', singleBookIntegration);
  }
}

module.exports = { CdkBookstoreApiStack };
