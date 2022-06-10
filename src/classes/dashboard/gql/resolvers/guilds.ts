import Client from "@classes/Client";
import { UserInputError } from "apollo-server";

export default {
    Query: {
        guild: (
            _: any,
            { id }: { id: string },
            { client }: { client: Client }
        ) => {
            const guild = client.guilds.cache.get(id);
            if (!guild) throw new UserInputError("Guild not found");
            return guild;
        },
        guilds: (_: any, __: any, { client }: { client: Client }) =>
            client.guilds.cache,
    },
};
