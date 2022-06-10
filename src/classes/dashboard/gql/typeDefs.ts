import { gql } from "apollo-server";

export default gql`
    scalar Client
    scalar Guild
    scalar User
    scalar Member

    type Query {
        client: Client
        clientUser: User

        guild(id: String!): Guild
        guilds: [Guild]

        user(id: String!): User
        users: [User]

        member(guildId: String!, memberId: String!): Member
        members(guildId: String!): [Member]
    }
`;
