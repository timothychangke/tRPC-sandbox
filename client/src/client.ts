import {
  createTRPCProxyClient,
  httpBatchLink,
  loggerLink,
  createWSClient,
  wsLink,
  splitLink,
} from '@trpc/client';
import { AppRouter } from '../../server/index';

const client = createTRPCProxyClient<AppRouter>({
  //since a http request to the server is needed. This is the default batch link
  //the concept of links is similar to that of middleware. An array of links can be passed in the request and response will be passed down iteratively. The reponse of the first link will be passed into the second link as  a request, etc etc
  //a http link is something called a ending link so there can't be links after it. There are other in build links that are not ending, so that they can be chained before a ending link
  links: [
    //the logger link logs detailed information about inbound and outbound queries
    loggerLink(),
    //a splitLink is a link that allows a user to access either of two links based on a condition
    splitLink({
      condition: (op) => {
        //what this splitLink is specifying is that if the request made is a subscription, use the websocket link else use the http batch link
        op.type === 'subscription';
      },
      true:
        //the http batch link batches multiple requests at the same time. There is also a httpLink() which is the same as httpBatchLink() but without the batching. However, batching is usually always used
        wsLink({
          client: createWSClient({
            url: 'ws://localhost:3000/trpc',
          }),
        }),
      false: httpBatchLink({
        url: 'http://localhost:5000/trpc',
        //you can pass in custom headers as well
        headers: { Authorization: 'TOKEN' },
      }),
    }),
  ],
});

async function main() {
  //in order to get autocomplete, you'll have to export the types from the server
  const queryResult = await client.sayHi.query();
  console.log(queryResult);
  //trpc validates the type of inputs as well as then autocompletion of the names of functions
  const mutateResult = await client.logToServer.mutate('Hi from client');
  console.log(mutateResult);
  //trpc user route. userProcedure validates for string input
  const userResult = await client.users.getUser.query('test');
  console.log(userResult);
  const userMutationResult = await client.users.update.mutate({
    userId: '2345',
    name: 'Kyle',
  });
  console.log(userMutationResult);

  //websockets
  client.users.onUpdate.subscribe(undefined, {
    onData: (id) => {
      console.log('Updated', id);
    },
  });
}

main();
