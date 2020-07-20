const User = require("../models/user")
const Wishlist = require("../models/wishlist")
const jwt = require("jsonwebtoken")
const eJWT = require("express-jwt")
const nodemailer = require("nodemailer")

exports.signup = async (req, res) => {
  try {
    const { email } = req.body

    const tryFind = await User.findOne({ email })

    if (tryFind) throw new Error("Email already exists.")

    const newUser = await User.create(req.body)

    await newUser.save()

    const { _id, username } = await User.findOne({ email })

    const confirmLink = `https://test-mats-app.herokuapp.com/confirmation/${_id.toString()}&${newUser.token(
      _id
    )}`

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_EMAIL,
        pass: process.env.GMAIL_KEY,
      },
    })

    const mailOptions = {
      from: process.env.GMAIL_EMAIL,
      to: email,
      subject: "Online Library Accout Confirmation",
      text: `Hello, ${username}. If you want to confirm your account on Online Library, please click on the link below: \n ${confirmLink}`,
    }

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        throw new Error(
          "We had an error with the mail server. Please try again later"
        )
      }
    })

    return res.json({ message: "Confirm your account" })
  } catch ({ message }) {
    if (message.includes("username")) message = "Username already used"
    console.log(message)
    return res.json({ error: message })
  }
}

exports.confirmation = async (req, res) => {
  const { key } = req.params

  const [id, token] = key.split("&")

  try {
    const user = await User.findById(id)
    user.confirmed = user.token(id) === token

    await user.save()

    return res.json(user.confirmed ? "Email confirmed" : "Invalid link")
  } catch (err) {
    return res.json("Invalid link")
  }
}

exports.signin = async (req, res) => {
  try {
    const { username, password } = req.body

    const user = await User.findOne({ username })

    if (!user.authenticate(password) || !user)
      throw new Error("Username or password invalid.")
    else if (!user.confirmed)
      throw new Error(
        `The account is not confirmed. Check your inbox for email "${process.env.GMAIL_EMAIL}" with subject Online Library Accout Confirmation. `
      )

    const { _id, email } = user
    const token = jwt.sign({ _id }, process.env.JWT_KEY)

    let wishlists = await Wishlist.find({ username }).select("name")

    wishlists = wishlists.map((wishlist) => wishlist.name)

    console.log(wishlists)

    res.cookie("t", token)

    return res.json({ token, user: { _id, email, username, wishlists } })
  } catch (err) {
    return res.json({ error: err.message })
  }
}

exports.signout = async (req, res) => {
  res.clearCookie("t")
  return res.json({
    message: "Signed out successfully.",
  })
}

exports.requireSignin = eJWT({
  secret: process.env.JWT_KEY,
  algorithms: ["RS256"],
  userProperty: "auth",
})
