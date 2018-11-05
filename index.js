const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const helmet = require('helmet')
const jwt = require('jsonwebtoken')
const blockstack = require('blockstack')
const db = require('./db')

const JWT_SECRET = process.env.JWT_SECRET || 'secret'

const app = express()
app.use(helmet())
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.disable('x-powered-by')

const port = process.env.PORT || 5555
app.listen(port, function() {
  console.log("Listening on port " + port + "!")
})

app.get('/auth', async (req,res,next) => {
  console.log("/auth")

  if(!req.query.authResponse){
    return res.status(401).json('Unauthorized')
  }

  const nameLookupURL = `https://core.blockstack.org/v1/names`
  let verified
  try{
    verified = await blockstack.verifyAuthResponse(
      req.query.authResponse,
      nameLookupURL
    )
  } catch(e) {
    return res.status(401).json('Unauthorized')
  }
  if(verified){
    const decoded = jwt.decode(req.query.authResponse)

    let JWTToken
    const r = db.getUser(decoded.username)
    if(!r.rowCount){
      // if no user, no need to create a record, just return example org
      JWTToken = jwt.sign({
        username: decoded.username,
        org_id: 1,
        role:'demo'
      }, JWT_SECRET, {expiresIn: '72h'})
    } else {
      // if user, return org id
      const user = r.rows[0]
      JWTToken = jwt.sign({
        username: decoded.username,
        org_id: user.org_id,
        role:user.role
      }, JWT_SECRET, {expiresIn: '72h'})
    }

    return res.status(200).json({
      message: 'Welcome to H2H',
      token: JWTToken,
      username: decoded.username.split('.')[0]
    })

  } else {
    return res.status(401).json('Unauthorized')
  }

})





