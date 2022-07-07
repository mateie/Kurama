import Client from "@classes/Client";
import { Collection, GuildMember, CommandInteraction } from "discord.js";

import StingerJS from "stinger.js";

export default class Valorant {
    private readonly client: Client;

    private readonly accounts: Collection<string, StingerJS>;

    constructor(client: Client) {
        this.client = client;

        this.accounts = new Collection();
    }

    check() {
        this.client.users.cache
            .filter((user) => !user.bot)
            .forEach(async (user) => {
                const db = await this.client.database.users.get(user);
                if (!db.valorant) return;
                if (!db.valorant.name || !db.valorant.tag) return;
                const account = new StingerJS(
                    db.valorant.name,
                    db.valorant.tag
                );

                this.accounts.set(user.id, account);
            });
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
                ephemeral: true
            });

        db.valorant.name = name;
        db.valorant.tag = tag;

        await db.save();

        const account = new StingerJS(name, tag);

        this.accounts.set(member.id, account);

        return interaction.reply({
            content: `Linked **${name}#${tag}** to you`,
            ephemeral: true
        });
    }

    async unlink(interaction: CommandInteraction) {
        const member = interaction.member as GuildMember;
        const db = await this.client.database.users.get(member.user);

        if (!db.valorant || (!db.valorant.name && !db.valorant.tag))
            return interaction.reply({
                content: "You don't have anything linked to your account",
                ephemeral: true
            });

        await interaction.reply({
            content: `**${db.valorant.name}#${db.valorant.tag}** was unlinked from your account`,
            ephemeral: true
        });

        db.valorant.name = null;
        db.valorant.tag = null;

        this.accounts.delete(member.id);

        return await db.save();
    }

    async verify(interaction: CommandInteraction) {
        const member = interaction.member as GuildMember;
        const db = await this.client.database.users.get(member.user);

        if (!db.valorant)
            return interaction.reply({
                content: "You are not linked to any accounts",
                ephemeral: true
            });
        if (!db.valorant.name || !db.valorant.tag)
            return interaction.reply({
                content: "You are not linked to any accounts",
                ephemeral: true
            });

        return interaction.reply({
            content: `Currently linked to **${db.valorant.name}#${db.valorant.tag}**`,
            ephemeral: true
        });
    }
}
