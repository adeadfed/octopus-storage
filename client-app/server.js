const express = require('express')
const app = express()

const port = 8000

// serve files from ./frontend
app.use('/', express.static('frontend'));


app.listen(port, () => {
    console.log(`Listening on port ${port}`)
})

