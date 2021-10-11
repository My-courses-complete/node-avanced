"use strict";

const config = (setup, debug) => {
  return {
    db: {
      database: process.env.DB_NAME || "platziverse",
      username: process.env.DB_USER || "platzi",
      password: process.env.DB_PASS || "platzi",
      host: process.env.DB_HOST || "localhost",
      dialect: "postgres",
      logging: (s) => debug(s),
      setup,
    },
    auth: {
      secret: process.env.SECRET || 'platzi',
      algorithms: ['HS256']
    }
  }
}

module.exports = config;
