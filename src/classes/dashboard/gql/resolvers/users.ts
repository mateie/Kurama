import Client from "@classes/Client";
import { UserInputError } from "apollo-server";

export default {
    Query: {
        user: async (
            _: any,
            { userId, database }: { userId: string; database: boolean },
            { client }: { client: Client }
        ) => {
            const user = client.users.cache.get(userId);
            if (!user) throw new UserInputError("User not found");
            if (user.bot) throw new UserInputError("User is a bot");
            const avatarURL = user.avatar
                ? client.util.cdn.avatar(user.id, user.avatar)
                : client.util.cdn.defaultAvatar(0);

            if (database) {
                const db = await client.database.users.get(user);
                return { ...user, ...db._doc, avatarURL };
            }
            return { ...user, avatarURL };
        },
        users: async (
            _: any,
            { database }: { database: boolean },
            { client }: { client: Client }
        ) => {
            const users = await Promise.all(
                client.users.cache
                    .filter((user) => !user.bot)
                    .toJSON()
                    .map(async (user) => {
                        const avatarURL = user.avatar
                            ? client.util.cdn.avatar(user.id, user.avatar)
                            : client.util.cdn.defaultAvatar(0);
                        if (database) {
                            const db = await client.database.users.get(user);
                            return { ...user, ...db._doc, avatarURL };
                        }

                        return { ...user, avatarURL };
                    })
            );

            return users;
        },
    },
    Mutation: {
        login: async (
            _: any,
            { code }: { code: any },
            { client }: { client: Client }
        ) => {
            return client.dashboard.auth.generateToken(code);
        },
        authUser: async (
            _: any,
            { auth }: { auth: any },
            { client }: { client: Client }
        ) => {
            return client.dashboard.auth.authUser(auth);
        },
    },
};
