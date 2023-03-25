const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const knex = require("knex");

const db = knex({
  client: "pg",
  connection: {
    host: "127.0.0.1",
    port: "5432",
    user: "postgres",
    password: "Test@123",
    database: "face_recognizer"
  }
});

const database = {
  users: [
    {
      id: 1,
      name: "Test1",
      email: "test1@test.com",
      password: "test@123",
      entries: 0,
      joined: new Date()
    },
    {
      id: 2,
      name: "Test2",
      email: "test2@test.com",
      password: "test@123",
      entries: 0,
      joined: new Date()
    }
  ]
}

const app = express();

app.use(cors());
app.use(express.json());


app.listen(3001, () => {
  console.log("App is runnng.");
});

app.get("/", (req, res) => {
  res.json(database);
});

app.post("/signin", (req, res) => {
  // let found = false;
  // database.users.some((user) => {
  //   if (req.body.email == user.email && req.body.password == user.password) {
  //     found = true;
  //     return res.json(user);
  //   }
  // });
  // if (!found) {
  //   res.status(404).json("Incorrect Username Password");
  // }
  const { email, password } = req.body;
  db
    .select("*")
    .from("login")
    .where({ email: email })
    .then(async (user) => {
      const isValid = await bcrypt.compare(password, user[0].hash);
      if (isValid) {
        db
          .select("*")
          .from("users")
          .where({ email: email })
          .then((signedInUser) => {
            res.json(signedInUser[0]);
          })
          .catch((err) => {
            res.status(404).json("Something went wrong");
          });
      }
      else {
        res.status(401).json("Incorrect Username Password");
      }
    })
    .catch((err) => {
      res.status(404).json("Something went wrong");
    });
});

app.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;
  const hash = await bcrypt.hash("test@123", 13);
  console.log(hash);
  db.transaction((trx) => {
    trx
      .insert({
        email: email,
        hash: hash
      })
      .into("login")
      .then(() => {
        trx
          .insert({
            name: name,
            email: email,
            joined: new Date
          })
          .into("users")
          .returning("*")
          .then((user) => {
            res.json(user[0]);
          });
      })
      .then(trx.commit)
      .catch(trx.rollback);
  })
    .catch((err) => {
      res.status(400).json("Something went wrong");
    });
});

app.get("/user/:id", (req, res) => {
  const { id } = req.params;
  db
    .select("*")
    .from("users")
    .where({ id: id })
    .then((user) => {
      if (user.length) {
        res.json(user[0]);
      }
      else {
        res.status(404).json("User not found");
      }
    })
    .catch((err) => {
      res.status(400).json("Something went wrong");
    });
});

app.put("/user/:id/entries", (req, res) => {
  const { id } = req.params;
  db("users")
    .where({ id: id })
    .increment("entries")
    .returning("entries")
    .then(entries => {
      res.json(entries[0]);
    })
    .catch((err) => {
      res.status(400).json("Something went wrong");
    })
});