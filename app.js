const express = require("express");
const corsHandler = require("./middlewares/corsHandler");

const app = express();

// ------------------------ Configurations ------------------------

require("./config/loadEnv")();
require("./config/database")();

// ------------------------ Middlewares ------------------------

app.use(corsHandler());

// ------------------------ Server ------------------------

app.listen(process.env.PORT, () => console.log(`Server is running on port ${process.env.PORT}`));
