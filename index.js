import * as fs from "fs";
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

app.use("/official", async (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");

    const officialList = JSON.parse(fs.readFileSync("official.json", { encoding: "utf-8" }));

    const obj = Object.fromEntries(Object.entries(announce.server_list).filter(([k, v]) => officialList.includes(k)));

    const list = [];
    Object.keys(obj).forEach(ip => {
        Object.keys(obj[ip]).forEach(port => {
            list.push({
                ip: ip,
                port: port,
                ...obj[ip][port]
            });
        });
    });

    res.status(200).send(list).end();
});

// Handle any other requests to the server, returning a custom 404 page
app.use(async (req, res) => {
    res.status(404).send("404 Not Found").end();
});

app.listen(port, "0.0.0.0", () => {
    console.log(`Server running on port ${port}`);
});