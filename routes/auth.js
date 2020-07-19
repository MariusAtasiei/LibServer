const router = require("express").Router()
const userController = require("../controllers/auth")

router.route("/signup").post(userController.signup)

router.route("/signin").post(userController.signin)

router.route("/signout").get(userController.signout)

router.route("/confirmation/:key").get(userController.confirmation)

module.exports = router
