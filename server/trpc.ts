//import trpc
import { inferAsyncReturnType, initTRPC, TRPCError } from '@trpc/server';
import { createContext } from './context';

//create a brand new instance of trpc
//the generic type infers the return type of the context
export const t = initTRPC
  .context<inferAsyncReturnType<typeof createContext>>()
  .create();

//trpc also allows for middleware declaration, which facilitates the use of authentication and authorisation so there is no need to redeclare the function every single time
//the middleware function takes in a function as params with the arguments of context and next
const isAdminMiddleware = t.middleware(({ ctx, next }) => {
  //check if the context isAdmin property is true or false
  if (!ctx.isAdmin) {
    //return a trpc error. the code in this case is analogous to HTTP codes
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  //the next function takes in a context value to update the context. for example, we are now putting the userId into the context
  //leaving it as blank would leave the context unchanged as per before
  return next({ ctx: { user: { id: 1 } } });
});

export const adminProcedure = t.procedure.use(isAdminMiddleware);
