import express from "express";
const app = express();

const port = process.env.PORT || 8000;

import announce from "./announce.js";

app.use("/announce", announce.router);

app.use("/servers", async (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");

    const list = [];
    Object.keys(announce.server_list).forEach(ip => {
        Object.keys(announce.server_list[ip]).forEach(port => {
            list.push({
                ip: ip,
                port: port,
                ...announce.server_list[ip][port]
            });
        });
    });

    res.status(200).send(list).end();
});

app.listen(port, "0.0.0.0", () => {
    console.log(`Server running on port ${port}`);
});