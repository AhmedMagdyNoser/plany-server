const express = require("express");
const corsHandler = require("./middlewares/corsHandler");
const cookiesParser = require("./middlewares/cookiesParser");
const verifyAccessToken = require("./middlewares/verifyAccessToken");

const app = express();

// ------------------------ Configurations ------------------------

require("./config/loadEnv")();
require("./config/database")();

// ------------------------ Middlewares ------------------------

app.use(corsHandler());

app.use(cookiesParser);

app.use(express.json());

app.use(express.urlencoded({ extended: false }));

// ------------------------ Routes ------------------------

app.use("/auth", require("./routes/auth"));

app.use(verifyAccessToken); // Protect the routes after this middleware
app.use("/tasks", require("./routes/tasks"));
app.use("/notes", require("./routes/notes"));

// ------------------------ Server ------------------------

app.listen(process.env.PORT, () => console.log(`Server is running on port ${process.env.PORT}`));
