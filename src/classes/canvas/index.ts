import { Canvas as CanvasM, loadImage } from 'skia-canvas';

import Client from '../Client';

import { GuildMember } from 'discord.js';

export default class Canvas {
    client: Client;

    constructor(client: Client) {
        this.client = client;
    }

    async welcomeMember(member: GuildMember) {
        const guild = await member.guild.fetch();
        
        const width = 500;
        const height = width / 2;
        const canvas = new CanvasM(width, height);

        const ctx = canvas.getContext('2d');

        await member.user.fetch();

        const bgImage = member.user.bannerURL({ format: 'png' }) ? member.user.bannerURL({ format: 'png' }) : member.user.displayAvatarURL({ format: 'png' });

        const banner = await loadImage(bgImage as string);
        const avatar = await loadImage(member.user.displayAvatarURL({ format: 'png', size: 256 }) as string);

        ctx.filter = 'blur(6px)';
        ctx.drawImage(banner, 0, 0, canvas.width, canvas.height);

        ctx.filter = 'none';

        ctx.font = 'italic 25px Times, DejaVu Serif';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText('Welcome to', width / 2, 0);
        ctx.fillText(guild.name, width / 2, 50);

        
        ctx.drawImage(avatar, width / 2.5, height / 2.5);

        const attachment = this.client.util.attachment(await canvas.toBuffer('png'), 'welcome.png');
        return attachment;
    }
}