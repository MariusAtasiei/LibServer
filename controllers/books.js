const Book = require("../models/books")
const Order = require("../models/order")
const _ = require("lodash")

exports.createBook = async (req, res) => {
  const { title } = req.body
  const id = title.toLowerCase().split(" ").join("-")
  const { price } = req.body
  const { image } = req.files

  const { mimetype, data } = image

  const { author, publisher, category, year } = req.body
  const searchKeys = `${title.toLowerCase()} ${author.toLowerCase()} ${publisher.toLowerCase()} ${category.toLowerCase()} ${year.toLowerCase()}`

  const newBook = new Book({
    ...req.body,
    image: { data, mimetype },
    disponibility: "new",
    fullPrice: price,
    id,
    searchKeys,
  })

  try {
    await newBook.save()

    return res.json(newBook)
  } catch (err) {
    res.status(400).json({ error: "Book already exists" })
  }
}

exports.getBooks = async (req, res) => {
  const { query } = req

  const fields = query.fields ? req.query.fields.split(",").join(" ") : "-__v"

  const { page, limit } = req.query
  const skip = (page - 1) * limit
  try {
    const { search } = query

    delete query.limit
    delete query.page
    delete query.fields
    delete query.search

    let { price } = query
    delete query.price

    Object.keys(query).forEach((key) => {
      query[key] = query[key].split(",")
    })

    if (price) {
      const [gt, lte] = price.split("-")
      price = { $gt: gt * 1, $lte: lte * 1 }
    } else price = { $gt: 0, $lte: 99999 }

    if (search) query.searchKeys = { $regex: search.toLowerCase() }

    const books = await Book.find({ ...query, price })
      .select(fields)
      .skip(skip)
      .limit(limit * 1)

    res.json(books)
  } catch (err) {
    return res.status(400).json({ error: err.message })
  }
}

exports.deleteBooks = async (req, res) => {
  const books = await Book.find()
  books.forEach(async (book) => {
    await Book.findByIdAndDelete(book._id)
  })

  return res.json("DONE")
}

exports.deleteBook = async (req, res) => {
  const { id } = req.params

  try {
    await Book.findByIdAndDelete(id)

    return res.json("DONE")
  } catch (err) {
    return res.status(400).json(err.message)
  }
}

exports.getBook = async (req, res) => {
  const { id } = req.params
  try {
    const book = await Book.findById(id).select(
      "-createdAt -updatedAt -__v -searchKeys"
    )
    return res.json(book)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}

exports.editBook = async (req, res) => {
  const { body } = req
  const { _id } = body

  let updateBook = await Book.findById(_id)

  if (req.files) {
    const { image } = req.files

    const { mimetype } = image

    body.image = { content: image, mimetype }
  } else {
    body.image = updateBook.image
  }

  updateBook = _.extend(updateBook, body)

  try {
    await updateBook.save()

    return res.json({ message: "Book updated successfully" })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}

exports.bookPhoto = async (req, res) => {
  const { id } = req.params
  const { image } = await Book.findById(id).select("image")

  res.set("Content-type", image.mimetype)
  return res.send(image.data)
}

exports.getFilters = async (req, res) => {
  try {
    let object = {
      author: await Book.distinct("author", (err, values) => values),
      category: await Book.distinct("category", (err, values) => values),
      publisher: await Book.distinct("publisher", (err, values) => values),
      year: await Book.distinct("year", (err, values) => values),
    }

    return res.json(object)
  } catch (err) {
    return res.status(400).json(err.message)
  }
}

exports.checkout = async (req, res, next) => {
  const { body } = req
  const _id = Object.keys(body)

  const cart = await Book.find({ _id }).select("amount")

  const check = cart.every(({ amount, _id }) => amount >= body[_id])

  return res.json(check)
}

exports.order = async (req, res) => {
  const { body } = req
  const { cart } = body

  const ids = Object.keys(cart)

  try {
    const books = await Book.find({ _id: ids })

    books.forEach(async (book) => {
      try {
        book.amount -= cart[book._id]
        if (book.amount < 0) throw new Error("Out of stock.")
        await book.save()
      } catch ({ message }) {
        return res.json({ error: message })
      }
    })

    const newOrder = new Order(body)

    const { _id } = await newOrder.save()

    return res.json({
      message: `Ordered succefully. The id of the order is ${_id}`,
    })
  } catch ({ message }) {
    return res.json({ error: message })
  }
}
