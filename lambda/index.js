const AWS = require("aws-sdk");
AWS.config.update({
  region: "eu-west-1"
});
const dynamodb = new AWS.DynamoDB.DocumentClient();
const dynamodbTableName = "BooksTable";
const healthPath = "/health";
const booksPath = "/books";
const bookPath = "/books/{id}";

exports.handler = async function(event) {
  console.log("Request event: ", event);
  let response;
  switch (true) {
    case event.httpMethod === "GET" && event.path === healthPath:
      response = buildResponse(200, { message: "Health check OK" });
      break;
    case event.httpMethod === "GET" && event.path === booksPath:
      response = await getBooks();
      break;
    case event.httpMethod === "GET" && event.pathParameters && event.pathParameters.id:
      response = await getBook(event.pathParameters.id);
      break;
    case event.httpMethod === "POST" && event.path === booksPath:
      response = await createBook(JSON.parse(event.body));
      break;
    case event.httpMethod === "PUT" && event.pathParameters && event.pathParameters.id:
      response = await updateBook(event.pathParameters.id, JSON.parse(event.body));
      break;
    case event.httpMethod === "DELETE" && event.pathParameters && event.pathParameters.id:
      response = await deleteBook(event.pathParameters.id);
      break;
    default:
      response = buildResponse(404, { message: "Not Found" });
  }
  return response;
};

async function getBook(bookId) {
  const params = {
    TableName: dynamodbTableName,
    Key: {
      "BookID": bookId
    }
  };
  try {
    const data = await dynamodb.get(params).promise();
    return buildResponse(200, data.Item);
  } catch (error) {
    console.error("Error getting book: ", error);
    return buildResponse(500, { message: "Error getting book" });
  }
}

async function getBooks() {
  const params = {
    TableName: dynamodbTableName
  };
  try {
    const data = await dynamodb.scan(params).promise();
    return buildResponse(200, data.Items);
  } catch (error) {
    console.error("Error getting books: ", error);
    return buildResponse(500, { message: "Error getting books" });
  }
}

async function createBook(book) {
  const params = {
    TableName: dynamodbTableName,
    Item: book
  };
  try {
    await dynamodb.put(params).promise();
    return buildResponse(201, { message: "Book created successfully" });
  } catch (error) {
    console.error("Error creating book: ", error);
    return buildResponse(500, { message: "Error creating book" });
  }
}

async function updateBook(bookId, book) {
  const params = {
    TableName: dynamodbTableName,
    Key: {
      "BookID": bookId
    },
    UpdateExpression: "set Title = :title, Author = :author",
    ExpressionAttributeValues: {
      ":title": book.title,
      ":author": book.author
    },
    ReturnValues: "UPDATED_NEW"
  };
  try {
    const data = await dynamodb.update(params).promise();
    return buildResponse(200, { message: "Book updated successfully", data: data.Attributes });
  } catch (error) {
    console.error("Error updating book: ", error);
    return buildResponse(500, { message: "Error updating book" });
  }
}

async function deleteBook(bookId) {
  const params = {
    TableName: dynamodbTableName,
    Key: {
      "BookID": bookId
    }
  };
  try {
    await dynamodb.delete(params).promise();
    return buildResponse(200, { message: "Book deleted successfully" });
  } catch (error) {
    console.error("Error deleting book: ", error);
    return buildResponse(500, { message: "Error deleting book" });
  }
}

function buildResponse(statusCode, body) {
  return {
    statusCode: statusCode,
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  };
}