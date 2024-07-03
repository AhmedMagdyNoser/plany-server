const express = require("express");
const app = express();

require("./config/loadEnv")();
require("./config/database")();

app.listen(process.env.PORT, () => console.log(`Server is running on port ${process.env.PORT}`));
