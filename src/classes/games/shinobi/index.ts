import Client from "@classes/Client";
import { CommandInteraction, GuildMember } from "discord.js";
import { Naruto } from "anime-info";

import Shinobi from "@schemas/Shinobi";
import ShinobiClans from "./clans/index";
import { ShinobiClan } from "../../../@types/index";

export default class ShinobiGame {
    private readonly client: Client;

    readonly api: Naruto;
    readonly clans: ShinobiClans;

    constructor(client: Client) {
        this.client = client;

        this.api = new Naruto();
        this.clans = new ShinobiClans(this);
    }

    async start(interaction: CommandInteraction) {
        const member = interaction.member as GuildMember;

        const shinobi = await Shinobi.findOne({ memberId: member.id });

        if (shinobi)
            return interaction.reply({
                content: "Your already are a shinobi",
                ephemeral: true
            });

        const clan = this.clans.random() as ShinobiClan;

        await Shinobi.create({
            memberId: member.id,
            clan: clan.id,
            stats: clan.stats
        });

        return interaction.reply({
            content: `You became a genin. You were born in **${clan.name}**`,
            ephemeral: true
        });
    }

    async info(interaction: CommandInteraction) {
        const { options } = interaction;

        const member = options.getMember("shinobi")
            ? (options.getMember("shinobi") as GuildMember)
            : (interaction.member as GuildMember);

        const shinobi = await Shinobi.findOne({ memberId: member.id });
        if (!shinobi)
            return interaction.reply({
                content:
                    "You are not a shinobi yet, use **/sh start** to become one",
                ephemeral: true
            });

        const clan = this.clans.get(shinobi.clan) as ShinobiClan;

        const embed = this.client.util
            .embed()
            .setTitle(`${member.user.username}'s Shinobi`)
            .setDescription(
                `
                \`Clan\`: ${clan.name}
            `
            )
            .addFields([
                {
                    name: "Ninjutsu",
                    value: `${shinobi.stats.ninjutsu}`,
                    inline: true
                },
                {
                    name: "Genjutsu",
                    value: `${shinobi.stats.genjutsu}`,
                    inline: true
                },
                {
                    name: "Taijutsu",
                    value: `${shinobi.stats.taijutsu}`,
                    inline: true
                },
                {
                    name: "Kenjutsu",
                    value: `${shinobi.stats.kenjutsu}`,
                    inline: true
                }
            ])
            .setThumbnail(clan.icon as string);

        return interaction.reply({ embeds: [embed] });
    }

    async delete(interaction: CommandInteraction) {
        const { options } = interaction;

        const member = interaction.member as GuildMember;

        if (!this.client.owners.includes(member.id))
            return interaction.reply({
                content: "You cannot use this command",
                ephemeral: true
            });

        const sh = options.getMember("shinobi") as GuildMember;

        const shinobi = await Shinobi.findOne({ memberId: sh.id });

        if (!shinobi)
            return interaction.reply({
                content: `${member} are not a shinobi`,
                ephemeral: true
            });

        await Shinobi.deleteOne({ memberId: member.id });

        return interaction.reply({
            content: `Resigned ${member} from being a shinobi`,
            ephemeral: true
        });
    }
}
