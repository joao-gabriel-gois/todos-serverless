import 'source-map-support/register';

import { APIGatewayProxyHandler } from 'aws-lambda';
import { document } from '../utils/dynamoDbClient';

interface ICreateTodo {
  id: string;
  title: string;
  done: boolean;
  deadline: string;
}

export const handle: APIGatewayProxyHandler = async (event) => { 
  const { user_id } = event.pathParameters;
  const { id, title, done, deadline} = JSON.parse(event.body) as ICreateTodo;

  const response = await document.query({
    TableName: 'todos',
    KeyConditionExpression: 'id = :id',
    ExpressionAttributeValues: {
      ":id": id,
    }
  }).promise();
  
  const hasTodo = response.Items[0];

  if (hasTodo) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "This todo already exists!",
      }),
    };
  }

  await document.put({
    TableName: 'todos',
    Item: {
      id,
      user_id,
      title,
      done,
      deadline: new Date(deadline).toISOString(),
    }
  }).promise();
  
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "Todo Created!",
      todo: {
        id,
        user_id,
        title,
        done,
        deadline: new Date(deadline),
      }
    })
  };
}

