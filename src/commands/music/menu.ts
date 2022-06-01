import { ContextMenuInteraction, Guild, GuildMember, TextChannel, VoiceChannel } from 'discord.js';
import Client from '@classes/Client';
import Menu from '@classes/base/Menu';
import { IMenu } from '@types';

export default class MusicMenu extends Menu implements IMenu {
    constructor(client: Client) {
        super(client);

        this.name = 'Queue Track';

        this.data
            .setName(this.name)
            .setType(3);
    }

    async run(interaction: ContextMenuInteraction) {
        const { targetId } = interaction;

        const guild = interaction.guild as Guild;
        const member = interaction.member as GuildMember;
        const channel = interaction.channel as TextChannel;
        const message = await channel.messages.fetch(targetId);

        const voiceChannel = member.voice.channel as VoiceChannel;

        if (message.content.length < 1) return interaction.reply({ content: 'Track not provided', ephemeral: true });

        if (!voiceChannel) return interaction.reply({ content: 'You must be in a voice channel to queue a track', ephemeral: true });

        if (guild?.me?.voice.channelId && voiceChannel.id !== guild?.me.voice.channelId)
            return interaction.reply({ content: `You have to be in ${guild?.me.voice.channel} to queue a track`, ephemeral: true });

        if (member.voice.deaf) return interaction.reply({ content: 'You cannot queue a track when deafened', ephemeral: true });

        let queue = this.client.music.getQueue(guild);

        if (!queue) {
            queue = this.client.music.createQueue(guild, {
                metadata: channel,
            });

            try {
                if (!queue.connection) await queue.connect(voiceChannel);
            } catch {
                queue.destroy();
                return await interaction.reply({ content: 'Could not join your voice channel', ephemeral: true });
            }
        }

        try {
            await interaction.deferReply({ ephemeral: true });

            const result = await this.client.music.search(message.content, {
                requestedBy: interaction.user
            });

            if (result.tracks.length < 1 || !result.tracks[0]) {
                await interaction.followUp({ content: `Track **${message.content} was not found` });
                return;
            }

            if (result.playlist) queue.addTracks(result.playlist.tracks);
            else queue.addTrack(result.tracks[0]);

            if (!queue.playing) queue.play();

            await interaction.followUp({ content: 'Track/Playlist Recieved', ephemeral: true });
        } catch (err) {
            console.error(err);
        }
    }
}