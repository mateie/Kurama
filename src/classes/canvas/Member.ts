import Client from "@classes/Client";
import { GuildMember, Guild, Presence } from "discord.js";
import { Canvas as CanvasM, loadImage } from "skia-canvas";
import Canvas from ".";

export default class MemberCanvas {
    readonly client: Client;
    readonly canvas: Canvas;

    constructor(client: Client, canvas: Canvas) {
        this.client = client;
        this.canvas = canvas;
    }

    async welcome(member: GuildMember) {
        await member.user.fetch();

        const canvas = new CanvasM(1024, 450);
        const ctx = canvas.getContext("2d");

        const guild = (await member.guild.fetch()) as Guild;

        const memberColor = member.user.hexAccentColor
            ? (member.user.hexAccentColor as string)
            : "#808080";
        const iconColors = await this.canvas.popularColor(
            guild.iconURL() as string
        );
        const iconColor =
            iconColors[Math.floor(Math.random() * iconColors.length)];

        // Background
        ctx.filter = "blur(6px)";
        const background = await loadImage(
            "https://png.pngtree.com/thumb_back/fh260/background/20200714/pngtree-modern-double-color-futuristic-neon-background-image_351866.jpg"
        );
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
        ctx.filter = "none";

        // Border Layer
        ctx.globalAlpha = 0.1;
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, 25, canvas.height);
        ctx.fillRect(canvas.width - 25, 0, 25, canvas.height);
        ctx.fillRect(25, 0, canvas.width - 50, 25);
        ctx.fillRect(25, canvas.height - 25, canvas.width - 50, 25);

        // Username
        ctx.globalAlpha = 1;
        ctx.fillStyle = "white";
        ctx.strokeStyle = memberColor;
        ctx.lineWidth = 5;
        ctx.textAlign = "center";
        ctx.font = this.canvas.applyText(
            canvas,
            member.user.tag,
            48,
            500,
            "Coffee"
        );
        ctx.strokeText(member.user.tag, canvas.width / 2, 255);
        ctx.fillText(member.user.tag, canvas.width / 2, 255);

        // Title
        ctx.font = "Coffee 60px";
        ctx.strokeText("Welcome to", canvas.width / 2, canvas.height - 125);
        ctx.fillText("Welcome to", canvas.width / 2, canvas.height - 125);

        // Guild Name
        ctx.strokeStyle = iconColor;
        ctx.font = this.canvas.applyText(
            canvas,
            member.user.discriminator,
            53,
            750,
            "Coffee"
        );
        ctx.strokeText(guild.name, canvas.width / 2, canvas.height - 60);
        ctx.fillText(guild.name, canvas.width / 2, canvas.height - 60);

        // Avatar
        ctx.beginPath();
        ctx.lineWidth = 10;
        ctx.strokeStyle = this.client.util.member.statusColor(
            member.presence as Presence
        );
        ctx.arc(canvas.width - 525, 135, 64, 0, Math.PI * 2, true);
        ctx.stroke();
        ctx.closePath();
        ctx.clip();
        const avatar = await loadImage(member.displayAvatarURL());
        ctx.drawImage(avatar, canvas.width - 590, 70, 128, 128);

        return this.client.util.attachment(
            await canvas.toBuffer("png"),
            `welcome-${member.user.username}.png`
        );
    }

    async goodbye(member: GuildMember) {
        await member.user.fetch();

        const canvas = new CanvasM(1024, 450);
        const ctx = canvas.getContext("2d");

        const guild = (await member.guild.fetch()) as Guild;

        const memberColor = member.user.hexAccentColor
            ? (member.user.hexAccentColor as string)
            : "#808080";
        const iconColors = await this.canvas.popularColor(
            guild.iconURL() as string
        );
        const iconColor =
            iconColors[Math.floor(Math.random() * iconColors.length)];

        // Background
        ctx.filter = "blur(6px)";
        const background = await loadImage(
            "https://png.pngtree.com/thumb_back/fh260/background/20200714/pngtree-modern-double-color-futuristic-neon-background-image_351866.jpg"
        );
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
        ctx.filter = "none";

        // Border Layer
        ctx.globalAlpha = 0.1;
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, 25, canvas.height);
        ctx.fillRect(canvas.width - 25, 0, 25, canvas.height);
        ctx.fillRect(25, 0, canvas.width - 50, 25);
        ctx.fillRect(25, canvas.height - 25, canvas.width - 50, 25);

        // Username
        ctx.globalAlpha = 1;
        ctx.fillStyle = "white";
        ctx.strokeStyle = memberColor;
        ctx.lineWidth = 5;
        ctx.textAlign = "center";
        ctx.font = this.canvas.applyText(
            canvas,
            member.user.tag,
            48,
            500,
            "Coffee"
        );
        ctx.strokeText(member.user.tag, canvas.width / 2, 255);
        ctx.fillText(member.user.tag, canvas.width / 2, 255);

        // Title
        ctx.font = "Coffee 60px";
        ctx.strokeText("Left", canvas.width / 2, canvas.height - 125);
        ctx.fillText("Left", canvas.width / 2, canvas.height - 125);

        // Guild Name
        ctx.strokeStyle = iconColor;
        ctx.font = this.canvas.applyText(
            canvas,
            member.user.discriminator,
            53,
            750,
            "Coffee"
        );
        ctx.strokeText(guild.name, canvas.width / 2, canvas.height - 60);
        ctx.fillText(guild.name, canvas.width / 2, canvas.height - 60);

        // Avatar
        ctx.beginPath();
        ctx.lineWidth = 10;
        ctx.strokeStyle = this.client.util.member.statusColor(
            member.presence as Presence
        );
        ctx.arc(canvas.width - 525, 135, 64, 0, Math.PI * 2, true);
        ctx.stroke();
        ctx.closePath();
        ctx.clip();
        const avatar = await loadImage(member.displayAvatarURL());
        ctx.drawImage(avatar, canvas.width - 590, 70, 128, 128);

        return this.client.util.attachment(
            await canvas.toBuffer("png"),
            `farewell-${member.user.username}.png`
        );
    }

    async rank(member: GuildMember) {
        await member.user.fetch();

        const canvas = new CanvasM(1024, 450);
        const ctx = canvas.getContext("2d");

        const db = await this.client.database.users.get(member.user);
        const data = await this.client.util.member.getCardData(db);

        ctx.filter = "blur(6px)";
        switch (data.card.background.type) {
            case "banner": {
                const background = await loadImage(
                    member.user.bannerURL() as string
                );
                ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
                break;
            }
            case "color": {
                ctx.fillStyle = data.card.background.color;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                break;
            }
            case "image": {
                const background = await loadImage(data.card.background.image);
                ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
                break;
            }
        }
        ctx.filter = "none";

        // Border Layer
        ctx.globalAlpha = 0.1;
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, 25, canvas.height);
        ctx.fillRect(canvas.width - 25, 0, 25, canvas.height);
        ctx.fillRect(25, 0, canvas.width - 50, 25);
        ctx.fillRect(25, canvas.height - 25, canvas.width - 50, 25);

        let strokeStyle = "";
        let fillStyle = "";

        switch (data.card.outlines.type) {
            case "banner": {
                const colors = await this.canvas.popularColor(
                    member.user.bannerURL() as string
                );
                strokeStyle = colors[Math.floor(Math.random() * colors.length)];
                break;
            }
            case "avatar": {
                strokeStyle = member.user.hexAccentColor
                    ? (member.user.hexAccentColor as string)
                    : "#808080";
                break;
            }
            case "color": {
                strokeStyle = data.card.outlines.color;
            }
        }

        switch (data.card.text.type) {
            case "banner": {
                const colors = await this.canvas.popularColor(
                    member.user.bannerURL() as string
                );
                fillStyle = colors[Math.floor(Math.random() * colors.length)];
                break;
            }
            case "avatar": {
                fillStyle = member.user.hexAccentColor
                    ? (member.user.hexAccentColor as string)
                    : "#808080";
                break;
            }
            case "color": {
                fillStyle = data.card.text.color;
            }
        }

        // Username
        ctx.globalAlpha = 1;
        ctx.fillStyle = fillStyle;
        ctx.strokeStyle = strokeStyle;
        ctx.lineWidth = 5;
        ctx.textAlign = "center";
        ctx.font = this.canvas.applyText(
            canvas,
            member.user.tag,
            48,
            500,
            "Coffee"
        );
        ctx.strokeText(member.user.tag, canvas.width / 2, 255);
        ctx.fillText(member.user.tag, canvas.width / 2, 255);

        // Progress
        ctx.font = "bold";
        ctx.textAlign = "start";
        ctx.fillText(
            "/ " + this.canvas.abbrev(data.neededXP),
            420 +
                ctx.measureText(this.canvas.abbrev(data.currentXP)).width +
                15,
            310
        );
        ctx.fillText(this.canvas.abbrev(data.currentXP), 420, 310);

        // Avatar
        ctx.beginPath();
        ctx.lineWidth = 10;
        ctx.strokeStyle = strokeStyle;
        ctx.arc(canvas.width - 525, 135, 64, 0, Math.PI * 2, true);
        ctx.stroke();
        ctx.closePath();
        ctx.clip();
        const avatar = await loadImage(member.displayAvatarURL());
        ctx.drawImage(avatar, canvas.width - 590, 70, 128, 128);

        return this.client.util.attachment(
            await canvas.toBuffer("png"),
            `rank-${member.user.username}.png`
        );
    }

    calculateProgress(data: any) {
        const cx = data.currentXP;
        const rx = data.neededXP;

        if (rx <= 0) return 1;
        if (cx > rx) return 596.5;

        const width = (cx * 615) / rx;
        if (width > 596.5) return 596.6;
        return width as number;
    }
}
