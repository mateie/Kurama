import Client from '../Client';
import { BufferResolvable, ButtonInteraction, CommandInteraction, ContextMenuInteraction, GuildMember, Interaction, Message, MessageActionRow, MessageAttachment, MessageButton, MessageEmbed, MessageSelectMenu, Presence } from 'discord.js';
import { Modal, TextInputComponent, showModal as modalShow, ModalSubmitInteraction } from '@mateie/discord-modals';
import { Stream } from 'stream';
import { channelMention, roleMention } from '@discordjs/builders';

export default class Util {
    readonly client: Client;

    constructor(client: Client) {
        this.client = client;
    }

    row = () => new MessageActionRow();
    button = () => new MessageButton();
    dropdown = () => new MessageSelectMenu();
    modal = () => new Modal();
    input = () => new TextInputComponent();
    mentionRole = (roleId: string) => roleMention(roleId);
    mentionChannel = (channelId: string) => channelMention(channelId);
    durationMs = (dur: string) => dur.split(':').map(Number).reduce((acc, curr) => curr + acc * 60) * 1000;
    embed = () => new MessageEmbed().setColor('PURPLE').setTimestamp(new Date()).setFooter({ text: 'Owned by Stealth and Bunzi' });
    convertToPercentage = (num: number) => Math.floor(num * 100);
    attachment = (file: BufferResolvable | Stream, name?: string) => new MessageAttachment(file, name);
    embedURL = (title: string, url: string, display?: string) => `[${title}](${url.replace(/\)/g, '%29')}${display ? ` "${display}"` : ''})`;
    capFirstLetter = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);
    showModal = (
        modal: Modal,
        options: {
            client: Client,
            interaction: Interaction
        }
    ) => modalShow(modal, options);

    statusColor(presence: Presence) {
        if (!presence) return '#808080';
        switch (presence.status) {
        case 'online': {
            return '#00FF00';
        }
        case 'dnd': {
            return '#FF0000';
        }
        case 'idle': {
            return '#FFFF00';
        }
        case 'offline':
        case 'invisible': {
            return '#808080';
        }
        }
    }

    async memberInfo(
        interaction: CommandInteraction | ButtonInteraction | ContextMenuInteraction | ModalSubmitInteraction,
        member: GuildMember
    ) {
        const avatar = member.user.displayAvatarURL({ dynamic: true });
        const activities: string[] = [];
        const status = {
            emoji: ':white_circle:',
            text: 'Offline'
        };

        if (member.presence) {
            member.presence.activities.forEach(act => {
                const type = `***${act.type.charAt(0).toUpperCase() + act.type.split('_').join(' ').slice(1).toLowerCase()}***:`;

                activities.push(`
                    ${type} ${act.state ? this.list(act.state.split('; ')) : ''} ${act.type === 'PLAYING' ? act.name : ''} ${act.type === 'LISTENING' ? '-' : ''} ${act.details ? act.details : ''}
                `);
            });

            status.emoji = this.statusEmoji(member.presence.status);
            status.text = member.presence.status !== 'dnd' ? `${member.presence.status.charAt(0).toUpperCase()}${member.presence.status.slice(1)}` : 'Do Not Disturb';
        }

        const roles = member.roles.cache.filter(role => role.name !== '@everyone');
        const mappedRoles = roles.map(role => this.mentionRole(role.id)).join(', ');

        const embed = this.embed()
            .setAuthor({ name: member.user.tag, iconURL: avatar, url: avatar })
            .setColor(member.displayHexColor)
            .setURL(avatar)
            .setThumbnail(avatar)
            .setDescription(`**Status**: ${status.emoji} ${status.text} ${activities.length > 0 ? `\n**Activities**: ${activities.join('')}` : ''}`)
            .addFields([
                { name: 'Joined Server', value: `<t:${Math.floor(<number>member.joinedTimestamp / 1000)}:R>`, inline: true },
                { name: 'Joined Discord', value: `<t:${Math.floor(<number>member.user.createdTimestamp / 1000)}:R>`, inline: true },
                { name: `Roles(${roles.size})`, value: mappedRoles }
            ])
            .setFooter({ text: `ID: ${member.id}`});

        const rows = await this.memberActionRow(<GuildMember>interaction.member);
        return interaction.reply({ embeds: [embed], components: rows });
    }

    statusEmoji(type: string): string {
        switch (type) {
        case 'dnd':
            return ':red_circle:';
        case 'idle':
            return ':yellow_circle:';
        case 'online':
            return ':green_circle:';
        default:
            return ':white_circle:';
        }
    }

    chunk(arr: any, size: number) {
        const temp = [];
        for (let i = 0; i < arr.length; i += size) {
            temp.push(arr.slice(i, i + size));
        }

        return temp;
    }

    list(arr: string[], conj = 'and') {
        const len = arr.length;
        if (len == 0) return '';
        if (len == 1) return arr[0];
        return `${arr.slice(0, -1).join(', ')}${len > 1 ? `${len > 2 ? ',' : ''} ${conj} ` : ''}${arr.slice(-1)}`;
    }

    capEachFirstLetter(str: string) {
        const temp: string[] = [];
        str.split(' ').forEach(str => {
            temp.push(this.capFirstLetter(str));
        });

        return temp.join(' ');
    }

    async memberActionRow(executer: GuildMember) {
        const blocked = false;
        const muted = false;

        const topRow = this.row()
            .addComponents(
                this.button()
                    .setCustomId('show_rank')
                    .setLabel('Show Rank')
                    .setStyle('SECONDARY'),
                this.button()
                    .setCustomId('report_member')
                    .setLabel('Report Member')
                    .setStyle('DANGER')
            );

        const midRow = this.row()
            .addComponents(
                this.button()
                    .setCustomId('show_warns')
                    .setLabel('Show Warns')
                    .setStyle('PRIMARY'),
                this.button()
                    .setCustomId('show_blocks')
                    .setLabel('Show Blocks')
                    .setStyle('PRIMARY'),
                this.button()
                    .setCustomId('show_mutes')
                    .setLabel('Show Mutes')
                    .setStyle('PRIMARY'),
            );

        const bottomRow = this.row()
            .addComponents(
                this.button()
                    .setCustomId('warn_member')
                    .setLabel('Warn Member')
                    .setStyle('DANGER'),
                this.button()
                    .setCustomId(blocked ? 'unblock_member' : 'block_member')
                    .setLabel(blocked ? 'Unblock Member' : 'Block Member')
                    .setStyle(blocked ? 'SUCCESS' : 'DANGER'),
                this.button()
                    .setCustomId(muted ? 'unmute_member' : 'mute_member')
                    .setLabel(muted ? 'Unmute Member' : 'Mute Member')
                    .setStyle(muted ? 'SUCCESS' : 'DANGER'),
            );

        return executer.permissions.has('VIEW_AUDIT_LOG') ? [topRow, midRow, bottomRow] : [topRow];
    }

    async pagination(interaction: ButtonInteraction | CommandInteraction, contents: string[] | string[][], title?: string, ephemeral = false, timeout = 12000) {
        let page = 0;

        const buttons = [
            this.button()
                .setCustomId('previous_page')
                .setLabel('⬅️')
                .setStyle('SECONDARY'),
            this.button()
                .setCustomId('next_page')
                .setLabel('➡️')
                .setStyle('SECONDARY')
        ];

        const row = this.row().addComponents(buttons);

        const embeds = contents.map((content, index) => {
            const embed = this.embed();
            if (typeof content == 'object') {
                embed
                    .setDescription(content.join('\n'));
            } else {
                embed
                    .setDescription(content);
            }

            embed.setFooter({ text: `Page ${index + 1} of ${contents.length}` });
            if (title) embed.setTitle(title);

            return embed;
        });

        if (interaction.deferred === false) {
            await interaction.deferReply({ ephemeral });
        }

        const currPage = await interaction.editReply({
            embeds: [embeds[page]],
            components: [row],
        }) as Message;

        const filter = (i: { customId: string | null; }) =>
            i.customId === buttons[0].customId ||
            i.customId === buttons[1].customId;

        const collector = currPage.createMessageComponentCollector({
            filter,
            time: timeout
        });

        collector.on('collect', async i => {
            switch (i.customId) {
            case buttons[0].customId:
                page = page > 0 ? --page : embeds.length - 1;
                break;
            case buttons[1].customId:
                page = page + 1 < embeds.length ? ++page : 0;
                break;
            default:
                break;
            }

            await i.deferUpdate();
            await i.editReply({
                embeds: [embeds[page]],
                components: [row],
            });
            collector.resetTimer();
        })
            .on('end', (_, reason) => {
                if (reason !== 'messageDelete' && !ephemeral) {
                    const disabledRow = this.row().addComponents(
                        buttons[0].setDisabled(true),
                        buttons[1].setDisabled(true)
                    );

                    currPage.edit({
                        embeds: [embeds[page]],
                        components: [disabledRow],
                    });
                }
            });

        return currPage;
    }
}