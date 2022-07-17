import { CommandInteraction, GuildMember, VoiceChannel } from "discord.js";
import Client from "@classes/Client";
import Command from "@classes/base/Command";
import { ICommand } from "@types";
import { ChannelType } from "discord-api-types/v10";

export default class VoiceCommand extends Command implements ICommand {
    constructor(client: Client) {
        super(client);

        this.name = "voice";
        this.description = "Voice commands";

        this.data
            .setName(this.name)
            .setDescription(this.description)
            .addSubcommand((subcommand) =>
                subcommand
                    .setName("moveall")
                    .setDescription("Move a person from one vc to another")
                    .addChannelOption((option) =>
                        option
                            .setName("channel")
                            .setDescription("Channel to move them into")
                            .addChannelTypes(ChannelType.GuildVoice)
                            .setRequired(true)
                    )
                    .addUserOption((option) =>
                        option
                            .setName("except")
                            .setDescription(
                                "Move everyone but except you and the member"
                            )
                            .setRequired(false)
                    )
            );
    }

    async run(interaction: CommandInteraction) {
        const { options } = interaction;

        const member = interaction.member as GuildMember;
        const currentVC = member.voice.channel;

        if (!currentVC)
            return interaction.reply({
                content: "You have to be in a voice channel",
                ephemeral: true,
            });

        switch (options.getSubcommand()) {
            case "moveall": {
                const channel = options.getChannel("channel") as VoiceChannel;

                if (channel.equals(currentVC))
                    return interaction.reply({
                        content: "You cannt move members to the same channel",
                        ephemeral: true,
                    });

                let members = currentVC.members;

                const except = options.getMember("except") as GuildMember;

                if (except) {
                    if (except.id === member.id)
                        return interaction.reply({
                            content: "Except cannot be you",
                            ephemeral: true,
                        });

                    members = members.filter(
                        (m) => m.id !== except.id && m.id !== member.id
                    );
                }

                members.forEach((m) =>
                    m.voice.setChannel(channel, `Moved by ${member}`)
                );

                if (except)
                    return interaction.reply({
                        content: `Moved everyone to ${channel} but you and ${except}`,
                        ephemeral: true,
                    });

                return interaction.reply({
                    content: `Moved everyone to ${channel}`,
                    ephemeral: true,
                });
            }
        }
    }
}
