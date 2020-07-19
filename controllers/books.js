const Book = require("../models/books")

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
    console.log(newBook)
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
    const book = await Book.findOne({ id }).select(
      "-createdAt -updatedAt -__v -searchKeys"
    )
    return res.json(book)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}

exports.editBook = async (req, res) => {
  const { _id } = req.body

  const updateBook = new Book(req.body)

  if (req.files) {
    const { image } = req.files

    const { mimetype } = image

    updateBook.image = { content: image, mimetype }
  }

  try {
    await Book.findByIdAndUpdate(_id, updateBook)
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
