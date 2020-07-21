const router = require("express").Router()
const {
  createBook,
  getBooks,
  deleteBooks,
  bookPhoto,
  getBook,
  editBook,
  deleteBook,
  getFilters,
  order,
  checkout,
} = require("../controllers/books")

router
  .route("/")
  .get(getBooks)
  .post(createBook)
  .delete(deleteBooks)
  .put(editBook)

router.route("/id=:id").get(getBook).delete(deleteBook)

router.route("/filters").get(getFilters)

router.route("/image/:id").get(bookPhoto)

router.post("/checkout", checkout)
router.post("/order", order)

module.exports = router
