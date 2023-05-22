let User = require("../models/Setter.js")
let { jwtsecret } = require("../configs/jwt.js")
let jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const generateRandomString = require("../utils/generateRandomString.js")

module.exports.login = async (req, res) => {
  let user = await User.findOne({login: req.body.login}).exec()
  if (!user) return res.status(404).send({ token: "" })
  else {
    const match = await bcrypt.compare(req.body.password, user.password);
    if (!match) return res.status(400).send({ token: "" })
    else {
      let token = jwt.sign({
        sub: user.authID,
        phone: user.phone,
        login: user.login,
        id: user._id,
        type: "setter",
      }, jwtsecret)
      res.send({token: "Bearer " + token, user: { login: user.login, phone: user.phone, id: user._id }})
    }
  }
}

module.exports.signup = async (req, res, next) => {
  const salt = await bcrypt.genSalt(10)
  const password = await bcrypt.hash(req.body.password, salt);
  let isUserLogin = await User.findOne({ login: req.body.login }).exec()
  let isUserPhone = await User.findOne({ login: req.body.phone }).exec()
  if (!isUserPhone && !isUserLogin) {
    let user = await User.create({ password, login: req.body.login, phone: req.body.phone, fcmToken: req.body.tokenFCM, authID: generateRandomString(10) })
    let token = jwt.sign({
      sub: user.authID,
      phone: user.phone,
      login: user.login,
      id: user._id,
      type: "setter"
    }, jwtsecret)
    res.send({token: "Bearer " + token, user: { login: user.login, phone: user.phone, id: user._id }})
  }
  else res.status(400).send({token: ""})
}

module.exports.test = async (req, res) => {
  res.status(200).send({isAuth: true})
}
