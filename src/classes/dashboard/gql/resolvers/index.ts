import client from "./client";
import guilds from "./guilds";
import channels from "./channels";
import users from "./users";

export default {
    Query: {
        ...client.Query,
        ...guilds.Query,
        ...channels.Query,
        ...users.Query,
    },
};
