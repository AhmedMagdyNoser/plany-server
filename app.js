const express = require("express");
const corsHandler = require("./middlewares/corsHandler");
const cookiesParser = require("./middlewares/cookiesParser");
const verifyAccessToken = require("./middlewares/verifyAccessToken");

const app = express();

// ------------------------ Configurations ------------------------

require("./config/loadEnv")();
require("./config/database")();

// ------------------------ Middlewares ------------------------

app.use(corsHandler(JSON.parse(process.env.WHITE_LIST)));

app.use(cookiesParser);

app.use(express.json());

app.use(express.urlencoded({ extended: false }));

// ------------------------ Routes ------------------------

app.get("/", (req, res) => res.send("Welcome to Plany App!"));

app.use("/auth", require("./routes/auth"));

app.use("/profile", verifyAccessToken, require("./routes/profile"));
app.use("/tasks", verifyAccessToken, require("./routes/tasks"));
app.use("/notes", verifyAccessToken, require("./routes/notes"));

// ------------------------ Server ------------------------

app.listen(process.env.PORT, () => console.log(`Server is running on port ${process.env.PORT}`));
