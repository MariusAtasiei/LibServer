const express = require("express")
const path = require("path")
const cookieParser = require("cookie-parser")
const logger = require("morgan")
const cors = require("cors")
const dotenv = require("dotenv")
const mongo = require("mongoose")
const fileUpload = require("express-fileupload")
dotenv.config()

const booksRouter = require("./routes/books")
const authRouter = require("./routes/auth")
const wishlistRouter = require("./routes/wishlist")

const app = express()

app.set("views", path.join(__dirname, "views"))
app.set("view engine", "jade")

app.use(cors())
app.use(fileUpload())
app.use(logger("dev"))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, "public")))

mongo.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
})

mongo.connection.once("open", () => console.log("MongoDB connected "))

app.get("/", (req, res) => res.json("Hello World"))
app.get("/email", (req, res) => res.json(process.env.GMAIL_EMAIL))
app.use("/book", booksRouter)
app.use("/auth", authRouter)
app.use("/wishlist", wishlistRouter)

const port = process.env.PORT || 5000
app.listen(port, () => console.log(`Server connected on port ${port}`))

module.exports = app
