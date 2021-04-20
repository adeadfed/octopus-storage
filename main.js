const express = require('express')
const app = express()

const port = 8080

app.get('/', (req, res) => {
    res.send('Hello!')
})


app.listen(port, () => {
    console.log(`Listening on port ${port}`)
})

/*
API ENDPOINTS:

api/
    files/
        upload/
        get/{file_id}
        share/
        list/
        
    users/
        profile/
        ${user_id}/
*/