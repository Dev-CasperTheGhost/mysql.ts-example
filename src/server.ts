import "dotenv/config";
import express from "express";
import { Connection, ConnectionConfig, createConnection } from "@casper124578/mysql.ts";

const app = express();
app.use(express.json());

const config = {
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
};

let connection: Connection | null = null;
connect();

async function connect() {
  const conn = await createConnection(config as ConnectionConfig);

  connection = conn;
  return conn;
}

app.get("/books", async (_, res) => {
  const books = await connection?.query().select("*").from("books").exec();

  return res.json({
    books,
  });
});

app.get("/books/:id", async (req, res) => {
  const bookId = req.params.id;

  const [book] = (await connection?.query().select("*").from("books").where("id", bookId).exec()) ?? [];

  return res.json({
    book: book,
  });
});

app.post("/books", async (req, res) => {
  const { name, author } = req.body;

  if (!name || !author) {
    return res.status(400).json({
      error: "`name` and `author` are required!",
      status: "error",
    });
  }

  await connection
    ?.query()
    .insert("books", {
      name,
      author,
    })
    .exec();

  return res.json({
    status: "success",
  });
});

app.delete("/books/:id", async (req, res) => {
  const bookId = req.params.id;

  await connection?.query().delete("books").where("id", bookId).exec();

  return res.json({
    status: "success",
  });
});

app.put("/books/:id", async (req, res) => {
  const bookId = req.params.id;
  const { name, author } = req.body;

  if (!name || !author) {
    return res.status(400).json({
      error: "`name` and `author` are required!",
      status: "error",
    });
  }

  await connection
    ?.query()
    .update("books", {
      name,
      author,
    })
    .where("id", bookId)
    .exec();

  return res.json({
    status: "success",
  });
});

app.listen(3000, () => console.log(`App running at port 3000`));
