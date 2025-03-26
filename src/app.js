// Create a new server
const express = require("express");
const bcrypt = require("bcrypt");
const { PrismaClient } = require("@prisma/client");

const app = express();
const prisma = new PrismaClient();

app.use(express.json());

app.post("/user", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  const hashedPassword = await bcrypt.hash(password, 10);
  console.log(hashedPassword);

  try {
    const existingUser = await prisma.user.findFirst({
      where: {
        username: username,
      },
    });

    if (existingUser) {
      return res.json({ message: "User already exist's" });
    }

    const newUser = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
      },
    });

    res.json({ newUser });
  } catch (error) {
    res.json({ message: "Internal server error" });
  }
});

app.post("/user/signin", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  try {
    const existingUser = await prisma.user.findFirst({
      where: {
        username,
      },
    });

    const hashed = await bcrypt.compare(password, existingUser.password);

    if (!hashed) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    res.status(200).json({ message: "You are now logged in" });
  } catch (error) {
    res.status(500).json({ message: "Internal server erro" });
  }
});

app.get("/user", async (req, res) => {
  const users = await prisma.user.findMany({});

  res.json({ users });
});

app.listen(3000, () => {
  console.log("App is listening to port 3000");
});
