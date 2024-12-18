import express from 'express';
import cors from 'cors';
import { appRouter } from './routers/index';
import { createContext } from './context';
import { applyWSSHander } from '@trpc/server/adapters/ws';
import ws from 'ws';
//if my router was a merged router, the merged router type must be imported

import { createExpressMiddleware } from '@trpc/server/adapters/express';

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());

//express specific code for trpc where createExpressMiddleware imported from the express specific route takes in a appRouter as a object
//for merged routers, change the type to merged routers
app.use(
  '/trpc',
  createExpressMiddleware({
    router: appRouter,
    //create context allows faciliates the passing around of information, especially authentication and authorisation
    createContext: ({ req, res }) => {
      return {
        //now if context was logged, the request object will always be logged out
        //however, this is an issue of trpc not knowing the type of the context. to overcome this, you'll have to create a context file and declare the create context function as well as its type
        req,
      };
    },
  })
);

app.use(express.json());

// API route
app.get('/api', (req, res) => {
  res.json({ message: 'Hello from the Express backend!' });
});

// Start the server
const server = app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
//create the websocket
applyWSSHander({
  wss: new ws.Server({ server }),
  router: appRouter,
  createContext,
});

//youll have to have to change this to merged router type for merged routers
export type AppRouter = typeof appRouter;
