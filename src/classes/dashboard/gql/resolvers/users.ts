import Client from "@classes/Client";
import { UserInputError } from "apollo-server";

export default {
    Query: {
        user: async (
            _: any,
            { id }: { id: string },
            { client }: { client: Client }
        ) => {
            const user = client.users.cache.get(id);
            if (!user) throw new UserInputError("User not found");
            if (user.bot) throw new UserInputError("User is a bot");
            const db = await client.database.users.get(user);

            return { ...user, ...db._doc };
        },
        users: async (_: any, __: any, { client }: { client: Client }) => {
            const users = await Promise.all(
                client.users.cache
                    .filter((user) => !user.bot)
                    .toJSON()
                    .map(async (user) => {
                        const db = await client.database.users.get(user);
                        return { ...user, ...db._doc };
                    })
            );

            return users;
        },
    },
};
