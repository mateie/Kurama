import Client from '@classes/Client';
import Event from '@classes/base/Event';
import { IEvent } from '@types';
import { ButtonInteraction, Guild, GuildMember, Message, MessageButton, VoiceChannel } from 'discord.js';

export default class MusicButtonsEvent extends Event implements IEvent {

    constructor(client: Client) {
        super(client);

        this.name = 'interactionCreate';
        this.description = 'Handles Buttons for Music Embed';
    }

    async run(interaction: ButtonInteraction) {
        if (!interaction.isButton()) return;

        const { customId } = interaction;

        if (![
            'show_queue', 'show_track_progress', 'show_track_lyrics',
            'pause_track', 'resume_track',
            'skip_current_track', 'skip_to_track', 'cancel_track_select',
            'add_tracks'
        ].includes(customId)) return;

        const guild = interaction.guild as Guild;
        const member = interaction.member as GuildMember;
        const message = interaction.message as Message;
        const voiceChannel = member.voice.channel as VoiceChannel;
        
        const queue = this.client.music.getQueue(guild);
        if (!queue) return await interaction.reply({ content: 'Music is not playing', ephemeral: true });
        if (!voiceChannel) return interaction.reply({ content: 'You must be in a voice channel to be able to use the music buttons', ephemeral: true });
        if (queue.connection.channel.id !== voiceChannel.id) return interaction.reply({ content: `I'm already playing music in ${guild.me?.voice.channel}`, ephemeral: true });
    
        switch (customId) {
        case 'show_queue': {
            const mapped = queue.tracks.map((track, index) => {
                return `\`${index + 1}\`. ${track.author} - ${track.title} | ${track.duration}`;
            });

            const chunked = this.util.chunk(mapped, 10);

            if (chunked.length < 1) return await interaction.reply({ content: 'There are no upcoming tracks', ephemeral: true });

            this.util.pagination.default(interaction, chunked, 'Upcoming Tracks');
            break;
        }
        case 'show_track_progress': {
            const rows = message.components;
            const button = message.components[0].components[1] as MessageButton;
            const embed = message.embeds[0];
            const showButton = button.setDisabled(true);

            if (!embed.fields[2]) embed.addField('Track Progress', queue.createProgressBar());
            else embed.fields[2] = { name: 'Track Progress', value: queue.createProgressBar(), inline: false };

            message.edit({ embeds: [embed], components: rows });

            setTimeout(() => {
                showButton.setDisabled(false);
                message.edit({ components: rows });
            }, 3000);
            return interaction.deferUpdate();
        }
        case 'show_track_lyrics': {
            const rows = message.components;
            const button = message.components[0].components[2] as MessageButton;
            const showButton = button.setDisabled(true);

            const currentTrack = queue.nowPlaying();

            const title = currentTrack.title.split('(')[0];

            const search = await this.client.music.searchLyrics(title);

            if (!search) return interaction.reply({ content: 'Lyrics not found', ephemeral: true });

            const chunkedLyrics = this.util.chunk(search.lyrics, 1024);

            await this.util.pagination.default(interaction, chunkedLyrics, `${title} Lyrics`, false, 60000);

            message.edit({ components: rows });

            setTimeout(() => {
                showButton.setDisabled(true);
                message.edit({ components: rows });
            }, 3000);
            break;
        }
        case 'pause_track': {
            const currentTrack = queue.nowPlaying();
            const requestedBy = guild.members.cache.get(currentTrack.requestedBy.id) as GuildMember;
            if (currentTrack.requestedBy.id !== member.id) return interaction.reply({ content: `You didn't request this track, ask ${requestedBy} to pause the track, because they requested it`, ephemeral: true });
            queue.setPaused(true);
            const rows = message.components;
            const button = message.components[1].components[0] as MessageButton;
            const playButton = button
                .setCustomId('resume_track')
                .setLabel('Resume Track')
                .setStyle('SUCCESS');

            message.components[1].components[0] = playButton;

            message.edit({ components: rows });
            return interaction.reply({ content: 'Track has been paused', ephemeral: true });
        }
        case 'resume_track': {
            const currentTrack = queue.nowPlaying();
            const requestedBy = guild.members.cache.get(currentTrack.requestedBy.id) as GuildMember;
            if (currentTrack.requestedBy.id !== member.id) return interaction.reply({ content: `You didn't request this track, ask ${requestedBy} to resume the track, because they requested it`, ephemeral: true });
            queue.setPaused(false);
            const rows = message.components;
            const button = message.components[1].components[0] as MessageButton;
            const pauseButton = button
                .setCustomId('pause_track')
                .setLabel('Pause Track')
                .setStyle('DANGER');

            message.components[1].components[0] = pauseButton;

            message.edit({ components: rows });
            return interaction.reply({ content: 'Track has been resumed', ephemeral: true });
        }
        case 'skip_current_track': {
            const currentTrack = queue.nowPlaying();
            const requestedBy = guild.members.cache.get(currentTrack.requestedBy.id) as GuildMember;
            if (currentTrack.requestedBy.id !== member.id) return interaction.reply({ content: `You didn't request this track, ask ${requestedBy} to skip the track, because they requested it`, ephemeral: true });
            queue.skip();

            const embed = message.embeds[0].setDescription('**Skipped Track**');

            message.edit({ embeds: [embed], components: [] });
            setTimeout(() => {
                message.delete();
            }, 10000);
            return interaction.reply({ content: 'Track has been skipped', ephemeral: true });
        }
        case 'skip_to_track': {
            const rows = message.components;
            if (queue.tracks.length < 1) return interaction.reply({ content: 'There are no upcoming tracks', ephemeral: true });
            const tracks = queue.tracks;
            const mapped = tracks.filter((_, i) => i < 25).map(track => {
                return {
                    label: `${track.author} - ${track.title.includes('(') ? track.title.split(' (')[0] : track.title}`,
                    value: `${queue.getTrackPosition(track)}`,
                };
            });

            const button = message.components[1].components[2] as MessageButton;
            const cancelButton = button
                .setCustomId('cancel_track_select')
                .setLabel('Cancel Track Selection')
                .setStyle('SECONDARY');

            const dropdown = [this.util.dropdown()
                .setCustomId('select_track')
                .setPlaceholder('Select a track')
                .setMinValues(1)
                .setMaxValues(1)
                .setOptions(mapped)];

            message.components[1].components[2] = cancelButton;

            rows.push(
                this.util.row()
                    .addComponents(dropdown)
            );

            message.edit({ components: rows });
            return interaction.reply({ content: 'Select from above', ephemeral: true });
        }
        case 'cancel_track_select': {
            if (!message.components[3] || message.components[3].components[0].customId !== 'select_track') return interaction.reply({ content: 'There is no track selection', ephemeral: true });
            const rows = [message.components[0], message.components[1], message.components[2]];

            interaction.deferUpdate();
            const button = message.components[1].components[2] as MessageButton;
            const skipToTrackButton = button.setCustomId('skip_to_track').setStyle('DANGER').setLabel('Skip to Track');
            rows[1].components[2] = skipToTrackButton;
            return message.edit({ components: rows });
        }
        case 'add_tracks': {
            const modal = this.util.modal()
                .setCustomId('add_tracks_modal')
                .setTitle('Adding Track(s) to the queue')
                .addComponents(
                    this.util.modalRow()
                        .addComponents(
                            this.util.input()
                                .setCustomId('track_query')
                                .setLabel('Track/Playlist URL or a name')
                                .setStyle('SHORT')
                                .setMinLength(1)
                                .setMaxLength(100)
                                .setRequired(true)
                        )
                );

            interaction.showModal(modal);
            break;
        }
        }
    }
}
