import { CommandInteraction, version } from "discord.js";
import os from "os";
import Client from "@classes/Client";
import Command from "@classes/base/Command";
import { ICommand } from "@types";
import { connection } from "mongoose";

export default class StatusCommand extends Command implements ICommand {
    constructor(client: Client) {
        super(client);

        this.name = "status";
        this.description = "Status for the bot";

        this.data.setName(this.name).setDescription(this.description);
    }

    async run(interaction: CommandInteraction) {
        await this.client.user?.fetch();
        await this.client.application?.fetch();

        const channelSize = (type: string[]) =>
            this.client.channels.cache.filter((channel) =>
                type.includes(channel.type)
            ).size;

        const mongoStatus = [
            "Disconnected",
            "Connected",
            "Connecting",
            "Disconnecting",
        ];

        const embed = this.util
            .embed()
            .setTitle(`${<string>this.client.user?.username} status`)
            .setDescription(<string>this.client.application?.description)
            .addFields([
                {
                    name: "Client",
                    value: this.client.user?.tag as string,
                    inline: true,
                },
                {
                    name: "Created",
                    value: `<t:${Math.floor(
                        (this.client.user?.createdTimestamp as number) / 1000
                    )}:R>`,
                    inline: true,
                },
                {
                    name: "Verified",
                    value: this.client.user?.flags?.has("VERIFIED_BOT")
                        ? "Yes"
                        : "No",
                    inline: true,
                },
                {
                    name: "Owners",
                    value: "Stealth",
                    inline: true,
                },
                {
                    name: "Database",
                    value: mongoStatus[connection.readyState],
                    inline: true,
                },
                {
                    name: "System",
                    value: os
                        .type()
                        .replace("Windows_NT", "Windows")
                        .replace("Darwin", "macOS"),
                    inline: true,
                },
                {
                    name: "CPU Model",
                    value: os.cpus()[0].model,
                    inline: true,
                },
                {
                    name: "CPU Usage",
                    value: `${(
                        process.memoryUsage().heapUsed /
                        1024 /
                        1024
                    ).toFixed(2)}%`,
                    inline: true,
                },
                {
                    name: "Up Since",
                    value: `<t:${Math.floor(
                        (this.client.readyTimestamp as number) / 1000
                    )}:R>`,
                    inline: true,
                },
                {
                    name: "Node.js",
                    value: process.version,
                    inline: true,
                },
                {
                    name: "Discord.js",
                    value: version,
                    inline: true,
                },
                {
                    name: "Ping",
                    value: `${this.client.ws.ping}ms`,
                    inline: true,
                },
                {
                    name: "Commands",
                    value: `${this.client.commandHandler.commands.size}`,
                    inline: true,
                },
                {
                    name: "Events",
                    value: `${this.client.eventHandler.events.size}`,
                    inline: true,
                },
                {
                    name: "Users",
                    value: `${this.client.users.cache.size}`,
                    inline: true,
                },
                {
                    name: "Text Channels",
                    value: `${channelSize(["GUILD_TEXT", "GUILD_NEWS"])}`,
                    inline: true,
                },
                {
                    name: "Voice Channels",
                    value: `${channelSize([
                        "GUILD_VOICE",
                        "GUILD_STAGE_VOICE",
                    ])}`,
                    inline: true,
                },
                {
                    name: "Threads",
                    value: `${channelSize([
                        "GUILD_THREAD",
                        "GUILD_NEWS_THREAD",
                        "GUILD_PUBLIC_THREAD",
                        "GUILD_PRIVATE_THREAD",
                    ])}`,
                    inline: true,
                },
            ]);

        return interaction.reply({ embeds: [embed] });
    }
}
