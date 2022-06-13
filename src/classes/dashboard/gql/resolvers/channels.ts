import Client from "@classes/Client";
import { UserInputError } from "apollo-server";
import { TextChannel, VoiceChannel } from "discord.js";

export default {
    Query: {
        channel: (
            _: any,
            { guildId, channelId }: { guildId: string; channelId: string },
            { client }: { client: Client }
        ) => {
            const guild = client.guilds.cache.get(guildId);
            if (!guild) throw new UserInputError("Guild not found");
            const channel = guild.channels.cache.get(channelId);
            if (!channel) throw new UserInputError("Channel not found");
            return channel.toJSON();
        },
        channels: (
            _: any,
            { guildId }: { guildId: string },
            { client }: { client: Client }
        ) => {
            const guild = client.guilds.cache.get(guildId);
            if (!guild) throw new UserInputError("Guild not found");
            return guild.channels.cache.toJSON();
        },

        message: async (
            _: any,
            {
                guildId,
                channelId,
                messageId,
            }: { guildId: string; channelId: string; messageId: string },
            { client }: { client: Client }
        ) => {
            const guild = client.guilds.cache.get(guildId);
            if (!guild) throw new UserInputError("Guild not found");
            const channel = guild.channels.cache.get(channelId) as
                | TextChannel
                | VoiceChannel;
            if (!channel) throw new UserInputError("Channel not found");
            const messages = await channel.messages.fetch();
            const message = messages.get(messageId);
            if (!message) throw new UserInputError("Message not found");
            return message.toJSON();
        },
        messages: async (
            _: any,
            { guildId, channelId }: { guildId: string; channelId: string },
            { client }: { client: Client }
        ) => {
            const guild = client.guilds.cache.get(guildId);
            if (!guild) throw new UserInputError("Guild not found");
            const channel = guild.channels.cache.get(channelId) as
                | TextChannel
                | VoiceChannel;
            if (!channel) throw new UserInputError("Channel not found");
            const messages = await channel.messages.fetch();
            return messages.toJSON();
        },
    },
};
