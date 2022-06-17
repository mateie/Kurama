import { gql } from "apollo-server";

export default gql`
    scalar Client
    scalar Command

    scalar Guild
    scalar Role
    scalar Emoji

    scalar Channel
    scalar Message

    scalar User
    scalar Member

    scalar Object

    type Query {
        client: Client!
        clientUser: User!

        command(commandName: String!): Command!
        commands: [Command]!

        guild(guildId: String!): Guild!
        guilds: [Guild]!

        role(guildId: String!, roleId: String!): Role!
        roles(guildId: String!): [Role]!

        channel(guildId: String!, channelId: String!): Channel!
        channels(guildId: String!): [Channel]!

        message(
            guildId: String!
            channelId: String!
            messageId: String!
        ): Message!
        messages(guildId: String!, channelId: String!): [Message]!

        emoji(guildId: String!, emojiId: String!): Emoji!
        emojis(guildId: String!): [Emoji]!

        user(userId: String!): User!
        users: [User]!

        member(guildId: String!, memberId: String!): Member!
        members(guildId: String!): [Member]!
    }

    type Mutation {
        login(code: String!): String!
        authUser(auth: Object): User!
    }
`;
