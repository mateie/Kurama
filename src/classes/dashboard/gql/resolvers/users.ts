import Client from '@classes/Client';
import { UserInputError } from 'apollo-server';

import { Guild, GuildMember, User } from 'discord.js';

export default {
    Query: {
        getUser: async (_: any, { id }: { id: string }, { client }: { client: Client }) => {
            try {
                const user = client.users.cache.get(id) as User;
                if (user.bot) throw new UserInputError('User is a bot');
                const db = await client.database.users.get(user);

                return { ...user, ...db._doc };
            } catch (err) {
                console.error(err);
            }
        },
        getUsers: (_: any, __: any, { client }: { client: Client }) => client.users.cache.filter(user => !user.bot),

        getMember: async (
            _: any,
            { guildId, memberId }: { guildId: string, memberId: string },
            { client }: { client: Client }
        ) => {
            const guild = client.guilds.cache.get(guildId) as Guild;
            if (!guild) throw new UserInputError('Guild not found');
            const member = guild.members.cache.get(memberId) as GuildMember;
            if (!member) throw new UserInputError('Member not found');
            if (member.user.bot) throw new UserInputError('Member is a bot');
            const db = await client.database.users.get(member.user);

            return { ...member, ...db._doc };
        },
        getMembers: async (
            _: any,
            { guildId }: { guildId: string },
            { client }: { client: Client }
        ) => {
            const guild = client.guilds.cache.get(guildId) as Guild;
            if (!guild) throw new UserInputError('Guild not found');

            const members = (await guild.members.fetch()).filter(member => !member.user.bot);

            return members;
        }
    }
};