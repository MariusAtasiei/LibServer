const router = require("express").Router()

const {
  getWishlist,
  updateWishlist,
  deleteWishlist,
  deleteFromWishlist,
  addToWishlist,
  getWishlistsByUsername,
} = require("../controllers/wishlist")

router
  .route("/one/:id")
  .get(getWishlist)
  .put(updateWishlist)
  .delete(deleteWishlist)

router.route("/book").post(addToWishlist).delete(deleteFromWishlist)

router.get("/username/:username", getWishlistsByUsername)

module.exports = router
