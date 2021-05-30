const graphql = require(`graphql`);
const pool = require('../db');
const fetch = require("node-fetch")
var generator = require('generate-serial-number');
const {GraphQLObjectType,
       GraphQLString, 
       GraphQLSchema,
       GraphQLInt, 
       GraphQLList,
       GraphQLBoolean} = graphql;



//GraphQL Object type for Account
const UserAccountType = new GraphQLObjectType({
    name : 'UserAccount',
    fields: () => ({
        user_id: {type: GraphQLInt},
        username: {type: GraphQLString},
        password: {type: GraphQLString},
        bookmark_questions : {
            type: new GraphQLList(QuestionsType),
            // Getting all the bookmarks for the particular user_id
            async resolve (parent, args) {
                const bookmarks = await pool.query(`SELECT * 
                                                    FROM questions as q
                                                    INNER JOIN
                                                    bookmarks as b
                                                    ON b.question_id = q.question_id
                                                    INNER JOIN 
                                                    user_accnt as ua
                                                    ON ua.user_id = b.user_id
                                                    WHERE ua.username = $1`, [parent.username]);
                                        
                return bookmarks.rows;
            }
        }
    })
}) 


//GraphQL Object type for UserBookMark
const UserBookmarkType = new GraphQLObjectType({
    name : 'UserBookmark',
    fields: () => ({
        bookmark_id: {type: GraphQLInt},
        user_id: {type: GraphQLInt},
        question_id: {type: GraphQLInt},
    })
})

//GraphQL Object for Stacoverflow Questions in Data
const QuestionsType = new GraphQLObjectType({
    name : 'Questions',
    fields  :()=> ({
        question_id : {type: GraphQLInt},
        question_header : {type : GraphQLString},
        question_link : {type: GraphQLString},
        votes_count : {type: GraphQLInt},
        answers_count: {type: GraphQLInt},
        views_count : {type: GraphQLInt},
        answers_count: {type: GraphQLInt},
        displayname: {type: GraphQLString},
        user_info_link: {type: GraphQLString},
        dp_link :  {type: GraphQLString},
        creation_date : {type: GraphQLInt},
    })
})


// Query
const RootQuery = new GraphQLObjectType({
    name : 'RootQueryType',
    fields : {
        // Query to get a particular user account based on user_id
        user_account : {
            type: UserAccountType,
            args : {username: {type: GraphQLString}},
            async resolve(parent,args) {
                const accnt = await pool.query('SELECT * FROM user_accnt where username = $1', [args.username]);
                return accnt.rows[0]
            }
        },
         // Query to get all user bookmarks
         all_user_accounts : {
            type: new GraphQLList(UserAccountType),
            async resolve(parent,args) {
                const accnt = await pool.query('SELECT * FROM user_accnt');
                return accnt.rows
            }
        }, 
        // Query to get all user bookmarks
        all_user_bookmarks : {
            type: new GraphQLList(UserBookmarkType),
            async resolve(parent,args) {
                const accnt = await pool.query('SELECT * FROM bookmarks');
                return accnt.rows
            }
        }
    }
})


// Query to add to the database
const Mutation = new GraphQLObjectType({
    name : "Mutation",
    fields : {
            // Query to add account to the database
            addUser: {
                type: UserAccountType,
                args: {
                    username: {type: GraphQLString},
                    password : {type: GraphQLString}
                },
                async resolve(parent, args) {
                    const add_accnts = await pool.query('INSERT INTO user_accnt VALUES ($1, $2, $3)', [generator.generate(5), args.username, args.password]);   
                }   
            },
            // Query to add User's Bookmarks to the Database
            addUserBookmarks : {
                type : UserBookmarkType,
                args: {
                    username: {type: GraphQLString},
                    question_id: {type: GraphQLInt},
                },
                async resolve(parent, args) {
                    // checking if user exist user_accnt table in db
                    const user_accnt = await pool.query('SELECT * FROM user_accnt WHERE username = $1', [args.username]);
                    if (user_accnt.rows.length > 0) {
                        const bookmarks = await pool.query('INSERT INTO bookmarks VALUES ($1, $2, $3)', [generator.generate(5), user_accnt.rows[0].user_id, args.question_id]);
                        const response = await fetch(`https://api.stackexchange.com/2.2/questions/${args.question_id}?order=desc&sort=activity&site=stackoverflow`);
                        const json = await response.json();
                        const items = await json.items[0];
                        const adding_question = await pool.query('INSERT INTO questions VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
                            [items.question_id,
                            items.title,
                            items.link,
                            items.view_count,
                            items.view_count,
                            items.view_count,
                            items.owner.display_name,
                            items.owner.link,
                            items.owner.profile_image,
                            324938498
                        ]
                        );
                    }
                    return "Success"
                }
            }   
        }
    })

module.exports = new GraphQLSchema( {
    query : RootQuery,
    mutation: Mutation
})



//---------------------------------------Not in use--------------------------------//

 /* // Query to get all the bookmark_id for a particular user_id
 user_bookmark : {
    type: UserBookmarkType,
    args : {user_id: {type: GraphQLInt}},
    async resolve(parent,args) {
        const user_bookmark = await pool.query('SELECT * FROM user_bookmarks where user_id = $1', [args.user_id]);
        return user_bookmark.rows[0];
    }
}, */