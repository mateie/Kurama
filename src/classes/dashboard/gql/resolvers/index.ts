import guilds from "./guilds";
import users from "./users";

export default {
  Query: {
    ...users.Query,
    ...guilds.Query,
  },
};
