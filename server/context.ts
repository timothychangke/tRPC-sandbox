import { CreateExpressContextOptions } from '@trpc/server/adapters/express';

//this isnt sufficient for type safety as it is merely redeclared on another file. To implement type safety, you'll have to add a generic to initTRPC()
export function createContext({ req, res }: CreateExpressContextOptions) {
  return {
    req,
    res,
    isAdmin: true,
  };
}
