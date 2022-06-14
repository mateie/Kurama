import Client from "@classes/Client";
import {
    ButtonInteraction,
    CommandInteraction,
    Guild,
    GuildMember,
    ModalSubmitInteraction,
    TextChannel,
} from "discord.js";

export default class Warns {
    readonly client: Client;

    constructor(client: Client) {
        this.client = client;
    }

    async create(
        interaction:
            | CommandInteraction
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
            reason,
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
                    iconURL: by.displayAvatarURL({
                        dynamic: true,
                    }),
                })
                .setTitle(`${by.user.tag} warned ${member.user.tag}`)
                .addField("Reason", reason);

            channel.send({ embeds: [embed] });
        }

        return interaction.reply({
            content: `${member} was warned by ${by} - ***Reason***: ${reason}`,
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
                            .setStyle("SHORT")
                            .setMinLength(4)
                            .setMaxLength(100)
                            .setPlaceholder("Type your reason here")
                            .setRequired(true)
                    )
            );
}
