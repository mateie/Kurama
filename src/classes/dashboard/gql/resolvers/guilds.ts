import Client from "@classes/Client";
import { UserInputError } from "apollo-server";

export default {
    Query: {
        guild: async (
            _: any,
            { guildId }: { guildId: string },
            { client }: { client: Client }
        ) => {
            const guild = client.guilds.cache.get(guildId);
            if (!guild) throw new UserInputError("Guild not found");
            return guild.toJSON();
        },
        guilds: async (_: any, __: any, { client }: { client: Client }) =>
            client.guilds.cache.toJSON(),

        member: async (
            _: any,
            { guildId, memberId }: { guildId: string; memberId: string },
            { client }: { client: Client }
        ) => {
            const guild = client.guilds.cache.get(guildId);
            if (!guild) throw new UserInputError("Guild not found");
            const member = guild.members.cache.get(memberId);
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
            const guild = client.guilds.cache.get(guildId);
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

        role: (
            _: any,
            { guildId, roleId }: { guildId: string; roleId: string },
            { client }: { client: Client }
        ) => {
            const guild = client.guilds.cache.get(guildId);
            if (!guild) throw new UserInputError("Guild not found");
            const role =
                guild.roles.cache.get(roleId) ||
                guild.roles.cache.find((role) => role.name === roleId);
            if (!role) throw new UserInputError("Role not found");
            return role.toJSON();
        },
        roles: (
            _: any,
            { guildId }: { guildId: string },
            { client }: { client: Client }
        ) => {
            const guild = client.guilds.cache.get(guildId);
            if (!guild) throw new UserInputError("Guild not found");
            return guild.roles.cache.toJSON();
        },

        emoji: (
            _: any,
            { guildId, emojiId }: { guildId: string; emojiId: string },
            { client }: { client: Client }
        ) => {
            const guild = client.guilds.cache.get(guildId);
            if (!guild) throw new UserInputError("Guild not found");
            const emoji =
                guild.emojis.cache.get(emojiId) ||
                guild.emojis.cache.find((emoji) => emoji.name === emojiId);
            if (!emoji) throw new UserInputError("Emoji not found");
            return emoji.toJSON();
        },
        emojis: (
            _: any,
            { guildId }: { guildId: string },
            { client }: { client: Client }
        ) => {
            const guild = client.guilds.cache.get(guildId);
            if (!guild) throw new UserInputError("Guild not found");
            return guild.emojis.cache.toJSON();
        },
    },
};
