import Client from '../Client';
import { BufferResolvable, Interaction, MessageActionRow, MessageAttachment, MessageButton, MessageEmbed, MessageSelectMenu } from 'discord.js';
import { Modal, TextInputComponent, showModal as modalShow } from '@mateie/discord-modals';
import { Stream } from 'stream';
import { channelMention, roleMention } from '@discordjs/builders';

import UtilPagination from './Pagination';
import UtilMember from './Member';

export default class Util {
    readonly client: Client;
    readonly member: UtilMember;
    readonly pagination: UtilPagination;

    constructor(client: Client) {
        this.client = client;

        this.member = new UtilMember(this.client, this);
        this.pagination = new UtilPagination(this.client, this);
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

    optionType(number: number) {
        switch (number) {
        case 1: return 'Sub Command';
        case 2: return 'Sub Command Group';
        case 3: return 'String';
        case 4: return 'Integer';
        case 5: return 'Boolean';
        case 6: return 'User';
        case 7: return 'Channel';
        case 8: return 'Role';
        case 9: return 'Mentionable';
        case 10: return 'Number';
        case 11: return 'Attachment';
        default: return 'Unknown';
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
}