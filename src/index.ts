import { MikroORM } from "@mikro-orm/core";
import mikroConfig from "./mikro-orm.config";
import express from "express";
import { ApolloServer } from "apollo-server-express";
//to host GraphQL API queries
import { buildSchema } from "type-graphql";
//to be able to build schema in GraphQL usinf TS
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import "reflect-metadata";
import { UserResolver } from "./resolvers/user";
import Redis from "ioredis";
import session from "express-session";
import connectRedis from "connect-redis";
import { COOKIE_NAME, __prod__ } from "./constants";
import { MyContext } from "./types";
import cors from "cors";
// import { sendEmail } from "./utils/sendEmail";
import { User } from "./entities/User";

const RedisStore = connectRedis(session);
const redis = new Redis();

const main = async () => {
  //sendEmail("bob@bob.com", "hello there!");
  const orm = await MikroORM.init(mikroConfig);
  //mikroConfig is an object with details of DB, entities, login details, path to migrations storage folder path
  //orm.em.nativeDelete(User, {});
  await orm.getMigrator().up();
  const app = express();
  //implementing the CORS middleware to allow connections from the client app
  app.use(
    cors({
      origin: "http://localhost:3000",
      credentials: true,
    })
  );

  //to store sessions created when user logs in into redis store
  app.use(
    session({
      name: COOKIE_NAME,
      store: new RedisStore({
        client: redis,
        disableTouch: true,
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, //10years
        httpOnly: true,
        secure: __prod__,
        sameSite: "lax", //protect agaisnt csrf
      },
      //saveUninitialized: false,
      secret: "sfhsyjagfsd",
      saveUninitialized: false,
      resave: false,
    })
  );

  //way to build a production-ready, self-documenting GraphQL API that can use data from any source
  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false,
    }),
    context: ({ req, res }): MyContext => ({ em: orm.em, req, res, redis }),
  });

  apolloServer.applyMiddleware({ app, cors: false });

  app.listen(4000);
};

main().catch((err) => {
  console.error(err);
});
