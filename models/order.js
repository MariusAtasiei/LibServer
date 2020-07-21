const mongo = require("mongoose")

const orderSchema = new mongo.Schema({
  orderedBy: String,
  cart: Object,
  price: Number,
  address: Object,
  status: { type: String, defaultValue: "Processing" },
})

module.exports = mongo.model("order", orderSchema)
