import { ApolloServer } from "apollo-server-express";
import connectRedis from "connect-redis";
import cors from "cors";
import express from "express";
import session from "express-session";
import Redis from "ioredis";
import path from "path";
import "reflect-metadata";
import { buildSchema } from "type-graphql";
import { createConnection } from "typeorm";
import { COOKIE_NAME, __prod__ } from "./constants";
import { Post } from "./entities/Post";
import { Updoot } from "./entities/Updoot";
// import { sendEmail } from "./utils/sendEmail";
import { User } from "./entities/User";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import { MyContext } from "./types";
import { createUpdootLoader } from "./utils/createUpdootLoader";
import { createUserLoader } from "./utils/createUserLoader";

const RedisStore = connectRedis(session);
const redis = new Redis();

const main = async () => {
  const conn = await createConnection({
    type: "postgres",
    database: "scenius2",
    username: "postgres",
    password: "postgres",
    logging: true,
    synchronize: true,
    migrations: [path.join(__dirname, "./migrations/*")],
    entities: [User, Post, Updoot],
  });
  //npx typeorm migration:create -n FakePosts
  await conn.runMigrations();

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
    context: ({ req, res }): MyContext => ({
      req,
      res,
      redis,
      userLoader: createUserLoader(),
      updootLoader: createUpdootLoader(),
    }),
  });

  apolloServer.applyMiddleware({ app, cors: false });

  app.listen(4000);
};

main().catch((err) => {
  console.error(err);
});
