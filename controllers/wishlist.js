const Wishlist = require("../models/wishlist")

exports.getWishlistsByUsername = async (req, res) => {
  try {
    const { username } = req.params
    let wishlists = await Wishlist.find({ username }).select(
      "-__v -username -books"
    )

    return res.json({ wishlists })
  } catch (err) {
    return res.json({ error: "We couldn't find the wishlists" })
  }
}

exports.getWishlist = async (req, res) => {
  try {
    const { id } = req.params

    const wishlist = await Wishlist.findById(id)

    return res.json({ wishlist })
  } catch ({ message }) {
    return res.json({ error: message })
  }
}

exports.updateWishlist = async (req, res) => {
  try {
    const {
      body,
      params: { id },
    } = req

    await Wishlist.findByIdAndUpdate(id, body)

    return res.json({ message: "Wishlist successfully updated" })
  } catch (err) {
    return res.json({ error: "Wishlist couldn't be updated" })
  }
}

exports.deleteWishlist = async (req, res) => {
  try {
    await Wishlist.findByIdAndDelete(req.params.id)
    return res.json({ message: "Wishlist successfully deleted" })
  } catch (err) {
    return res.json({ error: "Wishlist couldn't be deleted" })
  }
}

exports.addToWishlist = async (req, res) => {
  try {
    const { name, username, book } = req.body
    let wishlist = await Wishlist.findOne({ name, username })

    if (wishlist) {
      if (wishlist.books.includes(book))
        throw new Error("Book already in wishlist")
      wishlist.books.push(book)
      wishlist.numOfBooks += 1
    } else {
      wishlist = await Wishlist.create({ name, username })
      wishlist.books = [book]
      wishlist.numOfBooks = 1
    }

    wishlist.save()

    return res.json({ message: "Book successfully added" })
  } catch ({ message }) {
    const error = message.includes("already")
      ? message
      : "Book could not be saved"

    return res.json({ error })
  }
}

exports.deleteFromWishlist = async (req, res) => {
  try {
    const { id, bookId } = req.query

    const wishlist = await wishlist.findById(id)

    wishlist.books.pop(bookId)
    wishlist.numOfBooks -= 1

    return res.json({ message: "Book successfully deleted" })
  } catch (err) {
    console.log(err)
    return res.json({ error: "Book couldn't be deleted" })
  }
}
