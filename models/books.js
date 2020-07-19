const mongo = require("mongoose")

const bookSchema = new mongo.Schema(
  {
    title: { type: String, required: true, trim: true, unique: true },
    id: { type: String, required: true, trim: true },
    author: { type: String, required: true },
    price: { type: Number, required: true },
    fullPrice: { type: Number },
    category: { type: String, required: true },
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    publisher: { type: String, required: true },
    year: { type: Number, required: true },
    pages: { type: Number, required: true },
    disponibility: { type: String },
    sale: { type: Number },
    image: { path: String, mimetype: String },
    searchKeys: { type: String },
  },
  { timestamps: true }
)

const Book = mongo.model("Book", bookSchema)

module.exports = Book
