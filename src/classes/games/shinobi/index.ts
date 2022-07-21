import Client from "@classes/Client";
import { CommandInteraction, GuildMember, Message } from "discord.js";
import { Naruto } from "anime-info";
import ms from 'ms';

import Shinobi from "@schemas/Shinobi";

import ShinobiClans from "./clans/index";
import ShinobiVillages from "./villages";

import { ShinobiClan, ShinobiVillage } from "@types";
import moment from "moment";

export default class ShinobiGame {
    private readonly client: Client;

    private readonly api: Naruto;
    readonly clans: ShinobiClans;
    readonly villages: ShinobiVillages;

    constructor(client: Client) {
        this.client = client;

        this.api = new Naruto();
        this.clans = new ShinobiClans(this);
        this.villages = new ShinobiVillages(this);
    }

    async start(interaction: CommandInteraction) {
        const member = interaction.member as GuildMember;

        const shinobi = await Shinobi.findOne({ memberId: member.id });

        if (shinobi)
            return interaction.reply({
                content: "Your already are a shinobi",
                ephemeral: true
            });

        const embed = this.client.util
            .embed()
            .setTitle("Rules of Shinobi Adventure")
            .setDescription(
                "**DO NOT create multiple accounts to start multiple adventures** *we ask this because we want to make the game fair for all players* (more rules coming soon)"
            );

        const row = this.client.util
            .row()
            .setComponents([
                this.client.util
                    .button()
                    .setCustomId("accept_game_rules")
                    .setLabel("Accept")
                    .setStyle("SUCCESS"),
                this.client.util
                    .button()
                    .setCustomId("decline_game_rules")
                    .setLabel("Decline")
                    .setStyle("DANGER")
            ]);

        const message = (await interaction.reply({
            embeds: [embed],
            components: [row],
            ephemeral: true,
            fetchReply: true
        })) as Message;

        const collector = message.createMessageComponentCollector({
            filter: (i) =>
                (i.customId === "accept_game_rules" ||
                    i.customId === "decline_game_rules") &&
                i.user.id == member.id,
            time: 5000
        });

        collector.on("collect", async (i) => {
            switch (i.customId) {
                case "accept_game_rules": {
                    const clan = this.clans.random() as ShinobiClan;
                    const village = this.villages.random() as ShinobiVillage;

                    await Shinobi.create({
                        memberId: member.id,
                        clan: clan.id,
                        village: village.id,
                        stats: clan.stats
                    });

                    i.deferUpdate();

                    await interaction.editReply({
                        content: `You became a genin. You were born in **${clan.name}** - **${village.name.en}**`,
                        embeds: [],
                        components: []
                    });

                    break;
                }
                case "decline_game_rules": {
                    i.deferUpdate();

                    await interaction.editReply({
                        content:
                            "You declined the rules, you did not become a shinobi",
                        embeds: [],
                        components: []
                    });
                    break;
                }
            }
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
                content: "You/They are not a shinobi",
                ephemeral: true
            });

        const clan = this.clans.get(shinobi.clan) as ShinobiClan;
        const village = this.villages.get(shinobi.village) as ShinobiVillage;

        const embed = this.client.util
            .embed()
            .setTitle(`${member.user.username}'s Shinobi Info`)
            .setDescription(
                `
                \`Born in\` ${village.name.en} (${village.name.jp})
                \`Clan\` ${clan.name}

                \`Rank\`: ${this.client.util.capFirstLetter(shinobi.rank)}
                \`Ryo\`: ${shinobi.ryo}

                **Stats**
                \`Level\`: ${shinobi.level}

                \`Ninjutsu\`: ${shinobi.stats.ninjutsu}
                \`Genjutsu\`: ${shinobi.stats.genjutsu}
                \`Taijutsu\`: ${shinobi.stats.taijutsu}
                \`Kenjutsu\`: ${shinobi.stats.kenjutsu}
            `
            )
            .setThumbnail(clan.icon);

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

    async daily(interaction: CommandInteraction) {
        const member = interaction.member as GuildMember;

        const shinobi = await Shinobi.findOne({ memberId: member.id });

        if(!shinobi) return interaction.reply({ content: 'You are not a shinobi', ephemeral: true });

        if(Date.now() < shinobi.cooldowns.daily) return interaction.reply({ content: `You can claim your daily reward in **${moment(shinobi.cooldowns.daily).fromNow()}**`, ephemeral: true});

        const ryo = Math.floor(Math.random() * 100);

        shinobi.ryo += ryo;
        shinobi.cooldowns.daily = Date.now() + ms('1d');

        await shinobi.save();

        return interaction.reply({ content: `You received **${ryo} Ryo** from your daily`, ephemeral: true });

    }
}
