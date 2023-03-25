import "reflect-metadata"
import { ApolloServer } from "apollo-server-express"
import express from 'express'
import { buildSchema } from "type-graphql"
import cors from 'cors'
import dotenv from "dotenv"
import { ChatResolver } from "./resolvers/chat"
import http from 'http'

dotenv.config();

const main = async () => {
    const app = express();
    const httpServer = http.createServer(app)
    app.use(cors({origin:'*',credentials:true}))

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [ ChatResolver],
            validate:false
        }),

        subscriptions:{
            path: "/subscriptions",
            onConnect: () => {
                console.log("Clients connected for subscriptions")
            },
            onDisconnect: () => {
                console.log("Client disconnected from subscriptions")
            }
        }
    })

    await apolloServer.start();
    apolloServer.applyMiddleware({
        app,
        cors:false
    })
    apolloServer.installSubscriptionHandlers(httpServer)



    httpServer.listen(process.env.PORT,() => {
       console.log(
           `Server ready at http://localhost:${process.env.PORT}${apolloServer.graphqlPath}`
       )

       console.log(
           `Server ready at ws://localhost:${process.env.PORT}${apolloServer.subscriptionsPath}`
       )
    })
}

main().catch((err) => {
    console.log(err)
})
