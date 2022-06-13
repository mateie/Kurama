import Client from "@classes/Client";
import { ClientApplication, User } from "discord.js";

export default {
    Query: {
        client: async (_: any, __: any, { client }: { client: Client }) =>
            client,
        clientUser: async (_: any, __: any, { client }: { client: Client }) => {
            const user = (await client.user?.fetch()) as User;
            const application =
                (await client.application?.fetch()) as ClientApplication;

            return {
                ...user,
                description: application.description,
                avatarURL: user.displayAvatarURL(),
                guilds: client.guilds.cache.size,
                users: client.users.cache.size,
            };
        },
    },
};
