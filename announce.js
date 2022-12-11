import express from "express";
import { body, validationResult, matchedData } from "express-validator";

const router = express.Router();

const server_list = { };

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.post("/", 
    body("port").isNumeric(),
    body("name").isString(),
    body("players").isNumeric(),
    body("max_players").isNumeric(),
    body("passworded").isBoolean(),
    body("gamemode").isString(),
    body("game").isNumeric().isLength({ min: 0, max: 1 }),
    body("version").isString().isLength({ min: 0, max: 128 }),
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
        matched["passworded"]  = matched["passworded"] == "true" ? true : false;
        matched["game"]        = parseInt(matched["game"]);
        matched["player_list"] = matched["player_list"].filter(e => typeof e == "string");
        matched["timeout"]     = new Date().getTime() + 3000;

        const ip = req.ip, port = matched["port"];

        server_list[ip] ||= { };
        server_list[ip][port] = matched;

        res.status(200).send({ status: "ok" }).end();
    }
);

setInterval(async () => {
    const time = new Date().getTime();    
    Object.keys(server_list).forEach((ip) => {
        Object.keys(server_list[ip]).forEach((port) => {
            if (time > server_list[ip][port]["timeout"])
            {
                delete server_list[ip][port];

                if (Object.keys(server_list[ip]).length == 0)
                    delete server_list[ip];
            }
        });
    });
}, 3000);

export default { router, server_list };