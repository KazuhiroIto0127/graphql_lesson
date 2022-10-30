const { ApolloServer, gql } = require('apollo-server');
const { RESTDataSource } = require('apollo-datasource-rest');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class jsonPlaceApi extends RESTDataSource {
    constructor() {
        super();
        this.baseURL = 'https://jsonplaceholder.typicode.com/'
    }

    async getUsers() {
        const data = await this.get('/users');
        return data;
    }

    async getUser(id) {
        const data = await this.get(`/users/${id}`);
        return data;
    }

    async getPosts() {
        const data = await this.get('/posts');
        return data;
    }
}

const typeDefs = gql`
    type User{
        id: ID!
        name: String!
        email: String!
        myPosts: [Post]
    }

    type Post {
        id: ID!
        title: String!
        body: String!
        userId: ID!
    }

    type Query{
        hello(name: String!): String
        users: [User]
        posts: [Post]
        user(id: ID!): User
    }

    type Mutation {
        createUser(name: String!, email: String!): User
        updateUser(id: Int!, name: String!): User
        deleteUser(id: Int!): User
    }
`
const resolvers = {
    Query: {
        hello: (_, args) => `hello ${args.name}`,
        users: async (_, __, { dataSources }) => {
            return dataSources.jsonPlaceApi.getUsers();
            // return prisma.user.findMany();
        },
        posts: async (_, __, { dataSources }) => {
            return dataSources.jsonPlaceApi.getPosts();
        },
        user: async (_, args, { dataSources }) => {
            return dataSources.jsonPlaceApi.getUser(args.id);
        }
    },
    User: {
        myPosts: async (parent, __, { dataSources }) => {
            const posts = await dataSources.jsonPlaceApi.getPosts();
            return posts.filter((post) => post.userId == parent.id)
        }
    },
    Mutation: {
        createUser: (_, args) => {
            return prisma.user.create({
                data: {
                    name: args.name,
                    email: args.email
                }
            })
        },
        updateUser: (_, args) => {
            return prisma.user.update({
                where: {
                    id: args.id
                },
                data : {
                    name: args.name,
                }
            })
        },
        deleteUser: (_, args) => {
            return prisma.user.delete({
                where: { id: args.id }
            })
        }
    }
}

const server = new ApolloServer({
    typeDefs,
    resolvers,
    dataSources: () => {
        return {
            jsonPlaceApi: new jsonPlaceApi(),
        };
    },
});

server.listen().then(({url}) => {
    console.log(`🐥 server ready at ${url}`);
})
