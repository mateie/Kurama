import * as dotenv from "dotenv";
dotenv.config();

import Client from "@classes/Client";

const client = new Client();
client.init();
