import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";

const adapter = new JSONFile("servers.json");
const db = new Low(adapter);
{
    // Read data from JSON file
    await db.read();

    // If db.json doesn't exist, db.data will be null
    db.data ||= { };
}

import express from "express";
import { body, validationResult, matchedData } from "express-validator";

const router = express.Router();

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.post("/", 
    body("port").isNumeric(),
    body("name").isString(),
    body("players").isNumeric(),
    body("max_players").isNumeric(),
    body("game").isNumeric().isLength({ min: 0, max: 1 }),
    body("player_list").isArray().isLength({ min: 0, max: 256 }),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(200).send({ status: "error" }).end();

        const matched = matchedData(req, {
            includeOptionals: true,
        });

        matched["players"]     = parseInt(matched["players"]);
        matched["max_players"] = parseInt(matched["max_players"]);
        matched["game"]        = parseInt(matched["game"]);
        matched["player_list"] = matched["player_list"].filter(e => typeof e != "string");
        matched["timeout"]     = new Date().getTime() + 3000;

        const ip = req.ip, port = matched["port"];

        db.data[ip] ||= { };
        db.data[ip][port] = matched;

        await db.write();

        res.status(200).send({ status: "ok" }).end();
    }
);

setInterval(async () => {
    const time = new Date().getTime();
    const data = db.data;
    
    let update = false;
    Object.keys(data).forEach((ip) => {
        Object.keys(data[ip]).forEach((port) => {
            if (time > db.data[ip][port]["timeout"])
            {
                delete db.data[ip][port];

                if (Object.keys(db.data[ip]).length == 0)
                    delete db.data[ip];

                update = true;
            }
        });
    });

    if (update)
        await db.write(); 
}, 3000,);

export default { router };