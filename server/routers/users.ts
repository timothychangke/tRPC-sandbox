import { t } from '../trpc'
import { z } from 'zod'
import { EventEmitter } from 'stream'

//it is cubersome to individually validate each input, so most of the time the third party library zod is used for validation
const userProcedure = t.procedure.input(v => {
    if (typeof v === 'string') return v
    throw new Error('Invalid input: Expected string')
})
//creating an event emitter
const eventEmitter = new EventEmitter()
//with zod
const userProcedureZod = t.procedure.input(z.object({userId: z.string()}))

export const userRouter = t.router({
    // this inherits the userProcedure procedure above
   getUser: userProcedure.query(() => {
    return {id: 1,  name: 'Kyle'}
   }),
   //with zod
   get: userProcedureZod.query(({input}) => {
   return {id: input.userId, name: "Kyle"}
      }),

   //zod merges the requirements of userId and name together
   //usually trpc and typescript is smart enough to infer the types of the output, however if you wanted to be explicit about it you could as well
   update: userProcedureZod.input(z.object({name: z.string()})).output(z.object({name: z.string(), id: z.string()}))
   .mutation(req => {
    //now I have autocomplete for my request object
    console.log(req.ctx.isAdmin)
    console.log(`Updating user ${req.input.userId} to have the name ${req.input.name}`)
    //call on the event emitter to pass it the user id
    eventEmitter.emit("update", req.input.userId)
    //because the output of the function has been explicitly declared, an undeclared attribute like password will not be returned as it doesn't match the output selector
    //if attributes were missing as well, an error will be returned
    return {id: req.input.userId, name: req.input.name, password: "test"}
   }),
   onUpdate: t.procedure.subscription(() => {
    return observable<string>(emit => {
       //call on the event emitter such that everytime the update event is called, emit.next() will be invoked
       eventEmitter.on("update", emit.next)

       //the return statement closes the connection
       return () => {
        eventEmitter.off("update", emit.next)
       }
    })
   })



})