require("dotenv").config();
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const app = express();
const { MongoClient, ObjectId } = require("mongodb");

// MIDLEWARE
app.use(cors());
app.use(express.json());

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

const verifyJTW = (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization) {
    return res.status(401).send({ message: "unAuthorized Access" });
  }
  const token = authorization.split(" ")[1];
  jwt.verify(token, process.env.SUCURE_ACCESS_TOKEN, (err, decoded) => {
    if (err) {
      return res.status(403).send({ message: "you're not authorized" });
    }
    req.decoded = decoded;
    next();
  });
};

const run = async () => {
  try {
    await client.connect();
    console.log("Database Connected");
  } catch (error) {
    console.log(eroor);
  }
};
run();

const carDoctor = client.db("carDoctorDb");
const services = carDoctor.collection("services");
const products = carDoctor.collection("products");
const orders = carDoctor.collection("orders");

app.get("/", async (req, res) => {
  try {
    res.send({
      success: true,
      data: "Server up and running",
    });
  } catch (error) {
    res.send({
      success: false,
      data: error.meassage,
    });
  }
});

app.post("/jwt", (req, res) => {
  const token = jwt.sign(req.body, process.env.SUCURE_ACCESS_TOKEN);
  console.log(token);
  res.send({ token });
});

app.post("/services", async (req, res) => {
  try {
    const result = await services.insertOne(req.body);
    if (result.insertedId)
      res.send({
        success: true,
        data: "Successfully added",
      });
  } catch (error) {
    res.send({
      success: false,
      data: error,
    });
  }
});

app.get("/services", async (req, res) => {
  try {
    const cursor = services.find({});
    const result = await cursor.toArray();

    res.send({
      success: true,
      data: result,
    });
  } catch (error) {
    res.send({
      success: false,
      data: error,
    });
  }
});

app.get("/checkout/:id", async (req, res) => {
  try {
    const result = await services.findOne({ _id: ObjectId(req.params.id) });

    res.send({
      success: true,
      data: result,
    });
  } catch (error) {
    console.log(error);
  }
});

app.post("/orderplace", async (req, res) => {
  try {
    const order = req.body;
    const result = await orders.insertOne(order);

    res.send(result);
  } catch (error) {
    console.log(error);
  }
});

app.get("/orders", verifyJTW, async (req, res) => {
  try {
    const cursor = orders.find({ email: req.query.email });
    const data = await cursor.toArray();
    // console.log(data);
    res.send(data);
  } catch (error) {
    console.log(error.meassage);
  }
});

app.post("/products", async (req, res) => {
  try {
    await products.insertOne(req.body);
  } catch (error) {}
});

app.get("/products", async (req, res) => {
  try {
    const cursor = products.find({});
    const result = await cursor.toArray();

    res.send({
      success: true,
      data: result,
    });
  } catch (error) {
    res.send({
      success: false,
      data: error,
    });
  }
});

app.listen(5000, () => console.log("server is running at 5000"));
