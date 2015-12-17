/**
 * Database for storing user and message
 */

module.exports = {
    default: "inmemory", //inmemory: use default user-service and message-service
    connections: {
        inmemory: {
        },
        mysql: {
            host: "localhost",
            port: 3306,
            database: "cloudchat",
            username: "root",
            password: "root",
            connectTimeout: 10000,
            acquireTimeout: 10000,
            //pool configuration:
            queueLimit: 10,
            connectionLimit: 10,
            tables: {
                user: {
                    tableName: "cc_user",
                    columns: {
                        id: "id",
                        username: "username",
                        fullName: "full_name",
                        onlineStatus: "online_status",
                        avatarPath: "avatar_path"
                    }
                },
                chat: {
                    tableName: "cc_chat",
                    columns: {
                        id: "id",
                        hash: "hash",
                        createTime: "create_time"
                    }
                },
                message: {
                    tableName: "cc_message",
                    columns: {
                        id: "id",
                        senderId: "sender_id",
                        chatId: "chat_id",
                        content: "content",
                        timestamp: "timestamp"
                    }
                },
                chatNUser: {
                    tableName: "cc_chat_n_user",
                    columns: {
                        id: "id",
                        chatId: "chat_id",
                        userId: "user_id"
                    }
                }
            }

        }
    }
};