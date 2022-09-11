// Import the express and fetch libraries
const express = require('express');
const fetch = require("node-fetch");

const cors = require("cors");
// Create a new express application
const app = express();


const corsOptions ={
    origin:'*', 
    credentials:true,            //access-control-allow-credentials:true
    optionSuccessStatus:200,
 }
app.use(cors(corsOptions));

app.set("view engine", "hbs");
app.set("views", `${process.cwd()}/views`);
// This renders our `index.hbs` file.
app.get('/', async (req, res) => {
    res.send("<h1>Server is running</h1>")

});

app.get('/getListing/:keyword', async (req, res) => {
    var Listing = require("./listing.js");
    var john = new Listing();
    let response = await john.getListing(req.params.keyword);
    res.end(JSON.stringify(response));
});

// Start the server on port 3003
app.listen(process.env.PORT || 3003, 
	() => console.log("Server is running...")
    );
