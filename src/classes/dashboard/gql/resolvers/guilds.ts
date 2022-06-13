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
