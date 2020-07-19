const mongo = require("mongoose")

const wishlistSchema = new mongo.Schema({
  name: String,
  username: String,
  books: Array,
  numOfBooks: Number,
})

module.exports = mongo.model("Wishlist", wishlistSchema)
