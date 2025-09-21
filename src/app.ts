import express from "express";

const app = express();

app.use(express.json());

const claims = [];

app.get("/claims", (req, res) => {
  return res.json(claims);
});

export default app;
