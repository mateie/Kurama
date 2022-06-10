import client from "./client";
import guilds from "./guilds";
import users from "./users";

export default {
    Query: {
        ...client.Query,
        ...users.Query,
        ...guilds.Query,
    },
};
