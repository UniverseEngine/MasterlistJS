import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";

const adapter = new JSONFile("servers.json");
const db = new Low(adapter);

import express from "express";

const router = express.Router();

router.use("/", async (req, res) => {
    // Read data from JSON file
    await db.read();

    // If db.json doesn't exist, db.data will be null
    db.data ||= { };

    res.status(200).send(db.data).end();
});

export default { router };