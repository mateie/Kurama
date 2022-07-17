import Client from "@classes/Client";
import { Collection, GuildMember, CommandInteraction } from "discord.js";

import StingerJS, { AccountResponse, Regions } from "stinger.js";
import { ValAPI } from "valorant-wrapper";

const { VALORANT_API } = process.env;

export default class Valorant {
    private readonly client: Client;

    private readonly api: StingerJS;
    private readonly assets: typeof ValAPI;
    private readonly accounts: Collection<string, AccountResponse>;

    constructor(client: Client) {
        this.client = client;

        this.api = new StingerJS(VALORANT_API);
        this.assets = ValAPI;
        this.accounts = new Collection();
    }

    check() {
        this.client.users.cache
            .filter((user) => !user.bot)
            .forEach(async (user) => {
                const db = await this.client.database.users.get(user);
                if (!db.valorant) return;
                if (!db.valorant.name || !db.valorant.tag) return;

                const account = await this.api.getAccount({
                    name: db.valorant.name,
                    tag: db.valorant.tag,
                });

                this.accounts.set(user.id, account);
            });
    }

    async mmr(interaction: CommandInteraction) {
        const member = interaction.member as GuildMember;

        const account = this.accounts.get(member.id);
        if (!account)
            return interaction.reply({
                content: "You do not have an account linked",
                ephemeral: true,
            });

        await interaction.deferReply();

        const mmr = await this.api.getMMRByPUUID({
            puuid: account.data.puuid,
            region: account.data.region as Regions,
        });

        const rank = (
            await this.assets.competitiveTiers.get({
                uuid: "03621f52-342b-cf4e-4f86-9350a49c6d04",
            })
        ).tiers.find(
            (tier) =>
                tier.tierName.toLowerCase() ===
                mmr.data.current_data.currenttierpatched.toLowerCase()
        );

        const embed = this.client.util
            .embed()
            .setTitle(`${mmr.data.name}#${mmr.data.tag} MMR`)
            .setDescription(
                `
                \`Current Rank\`: ${mmr.data.current_data.currenttierpatched}
                \`Current ELO\`: ${mmr.data.current_data.elo}
                \`Gain/Loss\`: ${mmr.data.current_data.mmr_change_to_last_game} (last game)
            `
            )
            .setThumbnail(rank?.largeIcon as string)
            .setColor(`#${rank?.color.replace("ff", "")}`)
            .setImage(account.data.card.wide);

        await interaction.editReply({ embeds: [embed] });
    }

    async link(interaction: CommandInteraction) {
        const { options } = interaction;

        const member = interaction.member as GuildMember;
        const db = await this.client.database.users.get(member.user);

        const name = options.getString("name", true);
        const tag = options.getString("tag", true);

        if (db.valorant.name || db.valorant.tag)
            return interaction.reply({
                content: `You are already linked **${db.valorant.name}#${db.valorant.tag}**, unlink first to link another account`,
                ephemeral: true,
            });

        const account = await this.api.getAccount({ name, tag });

        if (account.error)
            return interaction.reply({
                content: "Account not found",
                ephemeral: true,
            });

        db.valorant.name = name;
        db.valorant.tag = tag;
        db.valorant.puuid = account.data.puuid;

        await db.save();

        this.accounts.set(member.id, account);

        return interaction.reply({
            content: `Linked **${name}#${tag}** to you`,
            ephemeral: true,
        });
    }

    async unlink(interaction: CommandInteraction) {
        const member = interaction.member as GuildMember;
        const db = await this.client.database.users.get(member.user);

        if (!db.valorant || (!db.valorant.name && !db.valorant.tag))
            return interaction.reply({
                content: "You don't have anything linked to your account",
                ephemeral: true,
            });

        await interaction.reply({
            content: `**${db.valorant.name}#${db.valorant.tag}** was unlinked from your account`,
            ephemeral: true,
        });

        db.valorant.name = null;
        db.valorant.tag = null;
        db.valorant.puuid = null;

        this.accounts.delete(member.id);

        return await db.save();
    }

    async verify(interaction: CommandInteraction) {
        const member = interaction.member as GuildMember;
        const db = await this.client.database.users.get(member.user);

        if (!db.valorant)
            return interaction.reply({
                content: "You are not linked to any accounts",
                ephemeral: true,
            });
        if (!db.valorant.name || !db.valorant.tag)
            return interaction.reply({
                content: "You are not linked to any accounts",
                ephemeral: true,
            });

        if (!this.accounts.has(member.id))
            return interaction.reply({
                content: "You are not linked to any accounts",
                ephemeral: true,
            });

        return interaction.reply({
            content: `Currently linked to **${db.valorant.name}#${db.valorant.tag}**`,
            ephemeral: true,
        });
    }
}
