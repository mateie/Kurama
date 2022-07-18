import Client from "@classes/Client";
import {
    ButtonInteraction,
    ChatInputCommandInteraction,
    Guild,
    GuildMember,
    ModalSubmitInteraction,
    TextChannel,
    TextInputStyle
} from "discord.js";

export default class Warns {
    readonly client: Client;

    constructor(client: Client) {
        this.client = client;
    }

    async create(
        interaction:
            | ChatInputCommandInteraction
            | ButtonInteraction
            | ModalSubmitInteraction,
        member: GuildMember,
        reason: string
    ) {
        const guild = interaction.guild as Guild;
        const by = interaction.member as GuildMember;
        const dbUser = await this.client.database.users.get(member.user);
        const dbGuild = await this.client.database.guilds.get(guild);

        dbUser.warns.push({
            guildId: guild.id,
            by: by.id,
            reason
        });

        await dbUser.save();

        if (dbGuild.channels.reports) {
            const channel = guild.channels.cache.get(
                dbGuild.channels.reports
            ) as TextChannel;

            const embed = this.client.util
                .embed()
                .setAuthor({
                    name: by.user.tag,
                    iconURL: by.displayAvatarURL()
                })
                .setTitle(`${by.user.tag} warned ${member.user.tag}`)
                .addFields({ name: "Reason", value: reason });

            channel.send({ embeds: [embed] });
        }

        return interaction.reply({
            content: `${member} was warned by ${by} - ***Reason***: ${reason}`
        });
    }

    async get(member: GuildMember) {
        const db = await this.client.database.users.get(member.user);

        return db.warns.filter((warn) => warn.guildId === member.guild.id);
    }

    total = async (member: GuildMember) => (await this.get(member)).length;

    modal = (member: GuildMember) =>
        this.client.util
            .modal()
            .setCustomId(`warn_member_${member.id}`)
            .setTitle(`Warning ${member.user.tag}`)
            .setComponents(
                this.client.util
                    .modalRow()
                    .setComponents(
                        this.client.util
                            .input()
                            .setCustomId("warn_reason")
                            .setLabel("Warn Reason")
                            .setStyle(TextInputStyle.Short)
                            .setMinLength(4)
                            .setMaxLength(100)
                            .setPlaceholder("Type your reason here")
                            .setRequired(true)
                    )
            );
}
