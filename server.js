const express = require("express");
const cors = require("cors");
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
  let found = false;
  database.users.some((user) => {
    if (req.body.email == user.email && req.body.password == user.password) {
      found = true;
      return res.json(user);
    }
  });
  if (!found) {
    res.status(404).json("Incorrect Username Password");
  }
});

app.post("/signup", (req, res) => {
  const { name, email, password } = req.body;
  // const id = database.users.at(-1).id + 1;
  // let newUser = {
  //   id: id,
  //   name: name,
  //   email: email,
  //   password: password,
  //   entries: 0,
  //   joined: new Date()
  // };
  // database.users.push(newUser);
  // let signedUpUser = JSON.parse(JSON.stringify(newUser));
  // delete signedUpUser.password;
  // res.json(signedUpUser);
  db
    .returning("*")
    .insert({
      name: name,
      email: email,
      joined: new Date
    })
    .into("users")
    .then(user => {
      res.json(user[0])
    })
    .catch((err) => {
      res.json("Something went wrong")
    });
});

app.get("/user/:id", (req, res) => {
  const { id } = req.params;
  let found = false;
  database.users.some((user) => {
    if (user.id === Number(id)) {
      found = true;
      return res.json(user);
    }
  });
  if (!found) {
    res.status(404).json("No such user found")
  }
});

app.put("/user/:id/entries", (req, res) => {
  const { id } = req.params;
  let found = false;
  database.users.some((user) => {
    if (user.id === Number(id)) {
      found = true;
      user.entries++;
      return res.json({ entries: user.entries });
    }
  });
  if (!found) {
    res.status(404).json("No such user found")
  }
});