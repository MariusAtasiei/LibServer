const mongo = require("mongoose")
const crypto = require("crypto")
const uuid = require("uuidv1")

const userSchema = new mongo.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    hashedPassword: { type: String, required: true },
    confirmed: { type: Boolean, default: false },
    salt: String,
    wishlist: Array,
    history: Array,
  },
  { timestamps: true }
)

userSchema.virtual("password").set(function (password) {
  this._password = password
  this.salt = uuid()
  this.hashedPassword = this.encryptPassword(password)
})

userSchema.methods = {
  authenticate: function (password) {
    return this.encryptPassword(password) === this.hashedPassword
  },
  encryptPassword: function (password) {
    if (!password) return ""

    try {
      return crypto.createHmac("sha1", this.salt).update(password).digest("hex")
    } catch (err) {
      return ""
    }
  },
  token: function (id) {
    const key = id.toString()

    try {
      return crypto.createHmac("sha1", this.salt).update(key).digest("hex")
    } catch (err) {
      return "Error"
    }
  },
}

module.exports = mongo.model("User", userSchema)
