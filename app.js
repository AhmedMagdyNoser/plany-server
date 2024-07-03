const express = require("express");
const corsHandler = require("./middlewares/corsHandler");
const cookiesParser = require("./middlewares/cookiesParser");

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

// ------------------------ Server ------------------------

app.listen(process.env.PORT, () => console.log(`Server is running on port ${process.env.PORT}`));
