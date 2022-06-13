import Client from "@classes/Client";
import { UserInputError } from "apollo-server";

import { Guild, GuildMember, User } from "discord.js";

export default {
    Query: {
        user: async (
            _: any,
            { id }: { id: string },
            { client }: { client: Client }
        ) => {
            const user = client.users.cache.get(id) as User;
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

        member: async (
            _: any,
            { guildId, memberId }: { guildId: string; memberId: string },
            { client }: { client: Client }
        ) => {
            const guild = client.guilds.cache.get(guildId) as Guild;
            if (!guild) throw new UserInputError("Guild not found");
            const member = guild.members.cache.get(memberId) as GuildMember;
            if (!member) throw new UserInputError("Member not found");
            if (member.user.bot) throw new UserInputError("Member is a bot");
            const db = await client.database.users.get(member.user);

            return { ...member, ...db._doc };
        },
        members: async (
            _: any,
            { guildId }: { guildId: string },
            { client }: { client: Client }
        ) => {
            const guild = client.guilds.cache.get(guildId) as Guild;
            if (!guild) throw new UserInputError("Guild not found");

            const members = await Promise.all(
                (
                    await guild.members.fetch()
                )
                    .filter((member) => !member.user.bot)
                    .toJSON()
                    .map(async (member) => {
                        const db = await client.database.users.get(member.user);
                        return { ...member, ...db._doc };
                    })
            );

            return members;
        },
    },
};
