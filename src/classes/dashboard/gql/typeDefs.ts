import { gql } from "apollo-server";

export default gql`
    scalar Client

    scalar Guild
    scalar Role
    scalar Emoji

    scalar Channel
    scalar Message

    scalar User
    scalar Member

    type Query {
        client: Client!
        clientUser: User!

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
`;
