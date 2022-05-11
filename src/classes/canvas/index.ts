import { Guild, GuildMember, Presence } from 'discord.js';
import { Canvas as CanvasM, loadImage } from 'skia-canvas';
import getColors from 'get-image-colors';

import fetch from 'node-fetch';

import Client from '../Client';

export default class Canvas {
    client: Client;

    constructor(client: Client) {
        this.client = client;
    }

    async welcomeMember(member: GuildMember) {
        await member.user.fetch();

        const canvas = new CanvasM(1024, 450);
        const ctx = canvas.getContext('2d');

        const guild = await member.guild.fetch() as Guild;

        const memberColor = member.user.hexAccentColor ? member.user.hexAccentColor as string : '#808080';
        const iconColors = await this.popularColor(guild.iconURL({ format: 'png' }) as string);
        const iconColor = iconColors[Math.floor(Math.random() * iconColors.length)];

        // Background
        ctx.filter = 'blur(6px)';
        const background = await loadImage('https://png.pngtree.com/thumb_back/fh260/background/20200714/pngtree-modern-double-color-futuristic-neon-background-image_351866.jpg');
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
        ctx.filter = 'none';

        // Border Layer
        ctx.globalAlpha = 0.1;
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, 25, canvas.height);
        ctx.fillRect(canvas.width - 25, 0, 25, canvas.height);
        ctx.fillRect(25, 0, canvas.width - 50, 25);
        ctx.fillRect(25, canvas.height - 25, canvas.width - 50, 25);

        // Username Layer (Might come back to this)
        /*ctx.globalAlpha = 0.5;
        ctx.fillStyle = memberColor;
        ctx.fillRect((canvas.width / 2) - 300, 210, 625, 60);*/

        // Username
        ctx.globalAlpha = 1;
        ctx.fillStyle = 'white';
        ctx.strokeStyle = memberColor;
        ctx.lineWidth = 5;
        ctx.textAlign = 'center';
        ctx.font = this.applyText(canvas, member.user.tag, 48, 500, 'Bold');
        ctx.strokeText(member.user.tag, canvas.width / 2, 255);
        ctx.fillText(member.user.tag, canvas.width / 2, 255);

        
        // Title
        ctx.font = '60px Bold';
        ctx.strokeText('Welcome to', canvas.width / 2, canvas.height - 125);
        ctx.fillText('Welcome to', canvas.width / 2, canvas.height - 125);

        // Guild Name
        ctx.strokeStyle = iconColor;
        ctx.font = this.applyText(canvas, member.user.discriminator, 53, 750, 'Bold');
        ctx.strokeText(guild.name, canvas.width  / 2, canvas.height - 60);
        ctx.fillText(guild.name, canvas.width / 2, canvas.height - 60);

        // Avatar
        ctx.beginPath();
        ctx.lineWidth = 10;
        ctx.strokeStyle = this.client.util.statusColor(member.presence as Presence);
        ctx.arc(canvas.width - 525, 135, 64, 0, Math.PI * 2, true);
        ctx.stroke();
        ctx.closePath();
        ctx.clip();
        const avatar = await loadImage(member.displayAvatarURL({ format: 'png' }));
        ctx.drawImage(avatar, canvas.width - 590, 70, 128, 128);
        
        return this.client.util.attachment(await canvas.toBuffer('png'), `welcome-${member.user.username}.png`);
    }

    applyText(canvas: CanvasM, text: string, defaultFontSize: number, width: number, font: string){
        const ctx = canvas.getContext('2d');
        do {
            ctx.font = `${(defaultFontSize -= 1)}px ${font}`;
        } while (ctx.measureText(text).width > width);
        return ctx.font;
    }

    async goodbyeMember(member: GuildMember) {
        await member.user.fetch();

        const canvas = new CanvasM(1024, 450);
        const ctx = canvas.getContext('2d');

        const guild = await member.guild.fetch() as Guild;

        const memberColor = member.user.hexAccentColor ? member.user.hexAccentColor as string : '#808080';
        const iconColors = await this.popularColor(guild.iconURL({ format: 'png' }) as string);
        const iconColor = iconColors[Math.floor(Math.random() * iconColors.length)];

        // Background
        ctx.filter = 'blur(6px)';
        const background = await loadImage('https://png.pngtree.com/thumb_back/fh260/background/20200714/pngtree-modern-double-color-futuristic-neon-background-image_351866.jpg');
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
        ctx.filter = 'none';

        // Border Layer
        ctx.globalAlpha = 0.1;
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, 25, canvas.height);
        ctx.fillRect(canvas.width - 25, 0, 25, canvas.height);
        ctx.fillRect(25, 0, canvas.width - 50, 25);
        ctx.fillRect(25, canvas.height - 25, canvas.width - 50, 25);

        // Username Layer (Might come back to this)
        /*ctx.globalAlpha = 0.5;
        ctx.fillStyle = memberColor;
        ctx.fillRect((canvas.width / 2) - 300, 210, 625, 60);*/

        // Username
        ctx.globalAlpha = 1;
        ctx.fillStyle = 'white';
        ctx.strokeStyle = memberColor;
        ctx.lineWidth = 5;
        ctx.textAlign = 'center';
        ctx.font = this.applyText(canvas, member.user.tag, 48, 500, 'Bold');
        ctx.strokeText(member.user.tag, canvas.width / 2, 255);
        ctx.fillText(member.user.tag, canvas.width / 2, 255);

        
        // Title
        ctx.font = '60px Bold';
        ctx.strokeText('Left', canvas.width / 2, canvas.height - 125);
        ctx.fillText('Left', canvas.width / 2, canvas.height - 125);

        // Guild Name
        ctx.strokeStyle = iconColor;
        ctx.font = this.applyText(canvas, member.user.discriminator, 53, 750, 'Bold');
        ctx.strokeText(guild.name, canvas.width  / 2, canvas.height - 60);
        ctx.fillText(guild.name, canvas.width / 2, canvas.height - 60);

        // Avatar
        ctx.beginPath();
        ctx.lineWidth = 10;
        ctx.strokeStyle = this.client.util.statusColor(member.presence as Presence);
        ctx.arc(canvas.width - 525, 135, 64, 0, Math.PI * 2, true);
        ctx.stroke();
        ctx.closePath();
        ctx.clip();
        const avatar = await loadImage(member.displayAvatarURL({ format: 'png' }));
        ctx.drawImage(avatar, canvas.width - 590, 70, 128, 128);
        
        return this.client.util.attachment(await canvas.toBuffer('png'), `farewell-${member.user.username}.png`);
    }

    async popularColor(url: string) {
        const buffer = await fetch(url).then(res => res.buffer());

        const colors = (await getColors(buffer, 'image/png')).map((color: any) => color.hex());
        return colors;
    }
}