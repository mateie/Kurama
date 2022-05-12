import Client from '@classes/Client';
import { ModalSubmitInteraction } from '@mateie/discord-modals';
import { Presence, CommandInteraction, ButtonInteraction, ContextMenuInteraction, GuildMember } from 'discord.js';
import Util from '.';

export default class UtilMember {
    client: Client;
    util: Util;

    constructor(client: Client, util: Util) {
        this.client = client;
        this.util = util;
    }

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

    async info(
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
                    ${type} ${act.state ? this.util.list(act.state.split('; ')) : ''} ${act.type === 'PLAYING' ? act.name : ''} ${act.type === 'LISTENING' ? '-' : ''} ${act.details ? act.details : ''}
                `);
            });

            status.emoji = this.statusEmoji(member.presence.status);
            status.text = member.presence.status !== 'dnd' ? `${member.presence.status.charAt(0).toUpperCase()}${member.presence.status.slice(1)}` : 'Do Not Disturb';
        }

        const roles = member.roles.cache.filter(role => role.name !== '@everyone');
        const mappedRoles = roles.map(role => this.util.mentionRole(role.id)).join(', ');

        const embed = this.util.embed()
            .setAuthor({ name: member.user.tag, iconURL: avatar, url: avatar })
            .setColor(member.displayHexColor)
            .setURL(avatar)
            .setThumbnail(avatar)
            .setDescription(`**Status**: ${status.emoji} ${status.text} ${activities.length > 0 ? `\n**Activities**: ${activities.join('')}` : ''}`)
            .addFields([
                { name: 'Joined Server', value: `<t:${Math.floor(member.joinedTimestamp as number / 1000)}:R>`, inline: true },
                { name: 'Joined Discord', value: `<t:${Math.floor(member.user.createdTimestamp as number / 1000)}:R>`, inline: true },
                { name: `Roles(${roles.size})`, value: mappedRoles }
            ])
            .setFooter({ text: `ID: ${member.id}`});

        const rows = await this.actionRow(interaction.member as GuildMember);
        return interaction.reply({ embeds: [embed], components: rows });
    }

    async actionRow(executer: GuildMember) {
        const blocked = false;
        const muted = false;

        const topRow = this.util.row()
            .addComponents(
                this.util.button()
                    .setCustomId('show_rank')
                    .setLabel('Show Rank')
                    .setStyle('SECONDARY'),
                this.util.button()
                    .setCustomId('report_member')
                    .setLabel('Report Member')
                    .setStyle('DANGER')
            );

        const midRow = this.util.row()
            .addComponents(
                this.util.button()
                    .setCustomId('show_warns')
                    .setLabel('Show Warns')
                    .setStyle('PRIMARY'),
                this.util.button()
                    .setCustomId('show_blocks')
                    .setLabel('Show Blocks')
                    .setStyle('PRIMARY'),
                this.util.button()
                    .setCustomId('show_mutes')
                    .setLabel('Show Mutes')
                    .setStyle('PRIMARY'),
            );

        const bottomRow = this.util.row()
            .addComponents(
                this.util.button()
                    .setCustomId('warn_member')
                    .setLabel('Warn Member')
                    .setStyle('DANGER'),
                this.util.button()
                    .setCustomId(blocked ? 'unblock_member' : 'block_member')
                    .setLabel(blocked ? 'Unblock Member' : 'Block Member')
                    .setStyle(blocked ? 'SUCCESS' : 'DANGER'),
                this.util.button()
                    .setCustomId(muted ? 'unmute_member' : 'mute_member')
                    .setLabel(muted ? 'Unmute Member' : 'Mute Member')
                    .setStyle(muted ? 'SUCCESS' : 'DANGER'),
            );

        return executer.permissions.has('VIEW_AUDIT_LOG') ? [topRow, midRow, bottomRow] : [topRow];
    }
}