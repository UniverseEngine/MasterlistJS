import express from "express";
const app = express();

const port = process.env.PORT || 8000;

import announce from "./announce.js";
import masterlist from "./masterlist.js";

app.use("/announce", announce.router);
app.use("/", masterlist.router);

app.listen(port, "0.0.0.0", () => {
    console.log(`Server running on port ${port}`);
});