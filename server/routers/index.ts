import { adminProcedure, t } from '../trpc';
import { userRouter } from './users';

//the router takes in an object, where the keys to the objects are the actions you can perform
//the value to these keys are called procedures. The two procedures we care about are queries and mutations
//queries are for getting data and mutations are for modifying data
//routes are the different endpoints while the procedures are the code executed at those endpoints
export const appRouter = t.router({
  sayHi: t.procedure.query(() => {
    return 'Hi';
  }),
  //pass in a callback to validate the type of the input
  logToServer: t.procedure
    .input((v) => {
      if (typeof v === 'string') return v;
      //throw error if input is not a string
      throw new Error('Invalid input, string expected');
      //mutation takes in the req object and allows mutation on it
    })
    .mutation((req) => {
      console.log(`Client says: ${req.input}`);
      return true;
    }),
  users: userRouter,
  //this route requires authentication which is implemented via the isAdmin middleware
  secretData: adminProcedure.query(({ ctx }) => {
    console.log(ctx.user);
    return 'Secret Data';
  }),
});

// instead of having a router hierarchy, you could have the routers be at the same level with merge routers
// export const = t.mergeRouters(appRouter, userRouter)
