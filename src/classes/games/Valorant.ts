import Client from '@classes/Client';
import moment from 'moment';
import { Collection, CommandInteraction, GuildMember, Message, MessageEmbed, ModalSubmitInteraction } from 'discord.js';
import { RiotApiClient } from '@survfate/valorant.js';

import StingerJS, { Agent, Gamemode, IStatsInfo } from 'stinger.js';

import { ValorantLogin } from '@types';
import { IStorefrontParsed } from '@survfate/valorant.js/dist/models/IStorefrontParsed';

export default class Valorant {
    client: Client;

    accounts: Collection<string, RiotApiClient>;
    stats: any;

    constructor(client: Client) {
        this.client = client;

        this.accounts = new Collection();
    }

    async login(interaction: ModalSubmitInteraction, { username, password, region }: ValorantLogin) {
        const member = interaction.member as GuildMember;

        try {
            const account = await new RiotApiClient({
                username,
                password,
                region,
            }).login();

            this.accounts.set(member.id, account);

            interaction.reply({ content: `Logged in as ${username}`, ephemeral: true });

            setTimeout(() => {
                this.accounts.delete(member.id);
            }, parseInt(account.auth.accessToken.expires_in));
        } catch (err: any) {
            console.error(err);
            interaction.reply({ content: `${err.message}`, ephemeral: true });
        }
    }

    async getWallet(interaction: CommandInteraction) {
        const member = interaction.member as GuildMember;

        if (!this.accounts.has(member.id)) return interaction.reply({ content: 'You are not logged in', ephemeral: true });

        const account = this.accounts.get(member.id) as RiotApiClient;

        const wallet = await account.storeApi.getWallet(account.user.Subject);

        interaction.reply({ content: `***Valorant Points***: ${wallet[0].amount}\n***Radianite Points***: ${wallet[1].amount}`, ephemeral: true });
    }

    async getStats(interaction: CommandInteraction) {
        const { options } = interaction;

        const member = interaction.member as GuildMember;
        
        const tagline = options.getString('valorant_tagline');

        if(!tagline && !this.accounts.has(member.id)) return interaction.reply({ content: 'Either you are not logged in or you didn\'t provide a tagline', ephemeral: true });
    
        if (!interaction.deferred) await interaction.deferReply();
        
        let user: StingerJS;

        if (tagline) {
            if (!tagline.includes('#')) return interaction.reply({ content: 'Tagline must include #', ephemeral: true });
            const username = tagline.split('#');
            user = new StingerJS(username[0], username[1]);
        } else {
            const account = this.accounts.get(member.id) as RiotApiClient;
            user = new StingerJS(account.user.GameName as string, account.user.TagLine as string);
        }

        try {
            const userInfo = await user.info();
            const gamemodes = await user.gamemodes();

            const gameNames = (Object.keys(gamemodes) as Array<Gamemode>);

            const selectOptions = gameNames.map(name => {
                return { label: this.client.util.capFirstLetter(name), value: name as string };
            });

            const row = this.client.util.row().addComponents(this.client.util.dropdown().setCustomId('select_gamemode').addOptions(selectOptions));

            const message = await interaction.editReply({ components: [row] }) as Message;

            const selectCollector = message.createMessageComponentCollector({
                componentType: 'SELECT_MENU',
                filter: i =>
                    i.customId === 'select_gamemode' &&
                    i.user.id === member.id,
                time: 12000
            });

            selectCollector.on('collect', async i => {
                const value = i.values[0];

                const gamemode = gamemodes[value as Gamemode] as IStatsInfo;

                const embed = this.client.util.embed()
                    .setAuthor({ name: member.user.tag, iconURL: member.displayAvatarURL({ dynamic: true }) })
                    .setTitle(`${userInfo.tagline}'s (${this.client.util.capFirstLetter(value)}) Stats`);
                
                if (value === 'competitive') {
                    embed
                        .setDescription(`
                            ***__Current Rank__***: ${userInfo.rank.current.tierName}
                            ***__Peak Rank__***:  ${userInfo.rank.peak.tierName}

                            ***__Time Played__***: ${moment(gamemode.timePlayed).format('H')} Hours

                            ***__Matches__*** - *${gamemode.matchesPlayed}*
                            **Won**: ${gamemode.matchesWon}
                            **Lost**: ${gamemode.matchesLost}
                            **Win Percentage**: ${gamemode.matchesWinPct?.toFixed(2)}%

                            ***__Kills__*** - *${gamemode.kills}*
                            **K/D**: ${gamemode.kDRatio}
                            **First Bloods**: ${gamemode.firstBloods}
                            **Headshots**: ${gamemode.headshots}
                            **Headshot Percentage**: ${gamemode.headshotsPercentage?.toFixed(2)}%
                            **Aces**: ${gamemode.aces}

                            ***__Deaths__*** - *${gamemode.deaths}*
                            ***__Damage__***: ${gamemode.damage}
                        `)
                        .setThumbnail(userInfo.rank.current.iconUrl as string);
                } else {
                    embed
                        .setDescription(`
                            ***__Time Played__***: ${moment(gamemode.timePlayed).format('H')} Hours

                            ***__Matches__*** - *${gamemode.matchesPlayed}*
                            **Won**: ${gamemode.matchesWon}
                            **Lost**: ${gamemode.matchesLost}
                            **Win Percentage**: ${gamemode.matchesWinPct?.toFixed(2)}%

                            ***__Kills__*** - *${gamemode.kills}*
                            **K/D**: ${gamemode.kDRatio?.toFixed(2)}
                            **First Bloods**: ${gamemode.firstBloods}
                            **Headshots**: ${gamemode.headshots}
                            **Headshot Percentage**: ${gamemode.headshotsPercentage?.toFixed(2)}%
                            **Aces**: ${gamemode.aces}

                            ***__Deaths__*** - *${gamemode.deaths}*
                            ***__Damage__*** - *${gamemode.damage}*
                        `);
                }
            
                await i.update({ embeds: [embed] });

                selectCollector.resetTimer();
            })
                .on('end', (_, reason) => {
                    if (reason !== 'messageDelete') {
                        message.delete();
                    }
                });
        } catch (err) {
            console.error(err);
        }
    }

    async getAgents(interaction: CommandInteraction) {
        const { options } = interaction;
        
        const member = interaction.member as GuildMember;
        
        const tagline = options.getString('valorant_tagline');
        
        if(!tagline && !this.accounts.has(member.id)) return interaction.reply({ content: 'Either you are not logged in or you didn\'t provide a tagline', ephemeral: true });
    
        if (!interaction.deferred) await interaction.deferReply();
        
        let user: StingerJS;

        if (tagline) {
            if (!tagline.includes('#')) return interaction.reply({ content: 'Tagline must include #', ephemeral: true });
            const username = tagline.split('#');
            user = new StingerJS(username[0], username[1]);
        } else {
            const account = this.accounts.get(member.id) as RiotApiClient;
            user = new StingerJS(account.user.GameName as string, account.user.TagLine as string);
        }

        try {
            const userInfo = await user.info();
            const agents = await user.agents();

            const agentName = (Object.keys(agents) as Array<Agent>);

            const selectOptions = agentName.map(name => {
                return { label: name, value: name };
            });

            const row = this.client.util.row().addComponents(this.client.util.dropdown().setCustomId('select_agent').addOptions(selectOptions));

            const message = await interaction.editReply({ components: [row] }) as Message;

            const selectCollector = message.createMessageComponentCollector({
                componentType: 'SELECT_MENU',
                filter: i =>
                    i.customId === 'select_agent' &&
                    i.user.id === member.id,
                time: 12000
            });

            selectCollector.on('collect', async i => {
                const value = i.values[0];

                const agent = agents[value as Agent] as IStatsInfo;

                const embed = this.client.util.embed()
                    .setAuthor({ name: member.user.tag, iconURL: member.displayAvatarURL({ dynamic: true }) })
                    .setTitle(`${userInfo.tagline}'s (${value}) Stats`)
                    .setDescription(`
                        ***__Time Played__***: ${moment(agent.timePlayed).format('H')} Hours

                        ***__Matches__*** - *${agent.matchesPlayed}*
                        **Won**: ${agent.matchesWon}
                        **Lost**: ${agent.matchesLost}
                        **Win Percentage**: ${agent.matchesWinPct?.toFixed(2)}%

                        ***__Kills__*** - *${agent.kills}*
                        **K/D**: ${agent.kDRatio?.toFixed(2)}
                        **First Bloods**: ${agent.firstBloods}
                        **Headshots**: ${agent.headshots}
                        **Headshot Percentage**: ${agent.headshotsPercentage?.toFixed(2)}%
                        **Aces**: ${agent.aces}

                        ***__Deaths__*** - *${agent.deaths}*
                        ***__Damage__*** - *${agent.damage}*
                    `);
                
                await i.update({ embeds: [embed] });
                
                selectCollector.resetTimer();
            })
                .on('end', (_, reason) => {
                    if (reason !== 'messageDelete') {
                        message.delete();
                    }
                });
        } catch (err) {
            console.error(err);
        }
    }

    async getStore(interaction: CommandInteraction) {
        let page = 0;
        const member = interaction.member as GuildMember;

        if (!this.accounts.has(member.id)) return interaction.reply({ content: 'You are not logged in', ephemeral: true });

        await interaction.deferReply();

        const account = this.accounts.get(member.id) as RiotApiClient;
        
        try {
            if (!interaction.deferred) interaction.deferReply();

            const { skins, featured, bonus } = await account.storeApi.getStorefront(account.user.Subject, true) as IStorefrontParsed;
            
            // Bottom Buttons
            const buttons = [
                this.client.util.button()
                    .setCustomId('weekly_store')
                    .setLabel('Weekly')
                    .setStyle('SECONDARY'),
                this.client.util.button()
                    .setCustomId('daily_store')
                    .setLabel('Daily')
                    .setStyle('SUCCESS'),
            ];

            if(bonus.length > 0) buttons.push(this.client.util.button()
                .setCustomId('night_market')
                .setLabel('Night Market')
                .setStyle('PRIMARY'));

            // Navigation Button
            const navigation = [
                this.client.util.button()
                    .setCustomId('previous_page')
                    .setLabel('Previous')
                    .setStyle('DANGER'),
                this.client.util.button()
                    .setCustomId('next_page')
                    .setLabel('Next')
                    .setStyle('SUCCESS')
            ];


            const row = this.client.util.row().addComponents(buttons);
            const navRow = this.client.util.row().addComponents(navigation);
        
            let currentEmbeds: MessageEmbed[];

            const dailyEmbeds: MessageEmbed[] = [];
            const weeklyEmbeds: MessageEmbed[] = [];
            const nightEmbeds: MessageEmbed[] = [];

            for (let i = 0; i < skins.length; i++) {
                const skin = skins[i];
                const image = (await account.contentApi.getWeaponSkinlevels('en-US')).find((level: any) => level.uuid === skin.id).displayIcon;
                dailyEmbeds.push(
                    this.client.util.embed()
                        .setAuthor({ name: `${member.user.tag} Valorant Store`, iconURL: member.displayAvatarURL()})
                        .setTitle(`${skin.name}`)
                        .setDescription(`***Price***: *${skin.cost.amount}* VP`)
                        .setImage(image)
                );
            }

            for (let j = 0; j < featured.length; j++) {
                const skin = featured[j];
                const image = (await account.contentApi.getWeaponSkinlevels('en-US')).find((level: any) => level.uuid === skin.id).displayIcon;
                weeklyEmbeds.push(
                    this.client.util.embed()
                        .setAuthor({ name: `${member.user.tag} Valorant Store`, iconURL: member.displayAvatarURL()})
                        .setTitle(`${skin.name}`)
                        .setDescription(`***Price***: *${skin.cost.amount}* VP`)
                        .setImage(image)
                );
            }

            for (let k = 0; k < bonus.length; k++) {
                const skin = bonus[k];
                const image = (await account.contentApi.getWeaponSkinlevels('en-US')).find((level: any) => level.uuid === skin.offer.rewards[0].id).displayIcon;
                const ogPrice = Math.ceil((skin.discountCost.amount * 100) / (100 - skin.discountPercent));
                nightEmbeds.push(
                    this.client.util.embed()
                        .setAuthor({ name: `${member.user.tag} Valorant Store`, iconURL: member.displayAvatarURL() })
                        .setTitle(`${skin.offer.rewards[0].name}`)
                        .setDescription(`
                        ***Price***: **${skin.discountCost.amount}** VP (~~**${ogPrice}**~~)
                        ***Discount***: **${skin.discountPercent}%**
                        `)
                        .setImage(image)
                );
            }

            const message = await interaction.editReply({ components: [row] }) as Message;

            const collector = message.createMessageComponentCollector({
                filter: i =>
                    (i.customId === 'weekly_store' ||
                    i.customId === 'daily_store' ||
                    i.customId === 'night_market' ||
                    i.customId === 'previous_page' ||
                    i.customId === 'next_page') && i.user.id === member.id,
                time: 12000
            });

            collector.on('collect', async i => {
                switch (i.customId) {
                case 'weekly_store': {
                    page = 0;
                    currentEmbeds = weeklyEmbeds;
                    break;
                }
                case 'daily_store': {
                    page = 0;
                    currentEmbeds = dailyEmbeds;
                    break;
                }
                case 'night_market': {
                    page = 0;
                    currentEmbeds = nightEmbeds;
                    break;
                }
                case 'previous_page': {
                    page = page > 0 ? --page : currentEmbeds.length - 1;
                    break;
                }
                case 'next_page': {
                    page = page + 1 < currentEmbeds.length ? ++page : 0;
                    break;
                }
                }

                await i.update({ embeds: [currentEmbeds[page]], components: [navRow, row]});
                collector.resetTimer();
            })
                .on('end', (_, reason) => {
                    if (reason !== 'messageDelete') {
                        message.delete();
                    }
                });

        } catch (err) {
            console.error(err);
            interaction.reply({ content: 'Failed to fetch the store, please try again', ephemeral: true });
        }
        
    }
}