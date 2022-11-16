import express from "express";
const app = express();

const port = process.env.PORT || 8000;

import announce from "./announce.js";

app.use("/announce", announce.router);

app.use("/servers", async (req, res) => {
    res.status(200).send(announce.server_list).end();
});

app.listen(port, "0.0.0.0", () => {
    console.log(`Server running on port ${port}`);
});