// Import the express and fetch libraries
const express = require('express');
const fetch = require("node-fetch");
const hbs = require("hbs");

// Create a new express application
const app = express();


app.set("view engine", "hbs");
app.set("views", `${process.cwd()}/views`);

// Send a JSON response to a default get request
app.get('/ping', async (req, res) => {
    const requestOptions = {
        'method': 'GET',
        'headers': {
            'x-api-key': '7vudmbql4ympd8mrzsajli9n',
        },
    };

    const response = await fetch(
        'https://api.etsy.com/v3/application/openapi-ping',
        requestOptions
    );

    if (response.ok) {
        const data = await response.json();
        res.send(data);
    } else {
        res.send("oops");
    }
});

// This renders our `index.hbs` file.
app.get('/', async (req, res) => {
    res.send("<h1>Server is running</h1>")

});

app.get('/getListing/:keyword', async (req, res) => {
    var Listing = require("./listing.js");

    var john = new Listing();
    
    let response = await john.getListing(req.params.keyword);
    res.end(JSON.stringify(response));
    // console.log(listing);
});

/**
These variables contain your API Key, the state sent
in the initial authorization request, and the client verifier compliment
to the code_challenge sent with the initial authorization request
*/
const clientID = '7vudmbql4ympd8mrzsajli9n';
const clientVerifier = 'k59fybFJkKeIfKVfhXZqLfPlye0Q-MpMMcT72NgaRBw';
const redirectUri = 'https://oauth.pstmn.io/v1/callback';

app.get("https://oauth.pstmn.io/v1/callback", async (req, res) => {
    // The req.query object has the query params that Etsy authentication sends
    // to this route. The authorization code is in the `code` param
    const authCode = req.query.code;
    const tokenUrl = 'https://api.etsy.com/v3/public/oauth/token';
    const requestOptions = {
        method: 'POST',
        body: JSON.stringify({
            grant_type: 'authorization_code',
            client_id: clientID,
            redirect_uri: redirectUri,
            code: authCode,
            code_verifier: clientVerifier,
        }),
        headers: {
            'Content-Type': 'application/json'
        }
    };

    // Extract the access token from the response access_token data field
    if (response.ok) {
        const tokenData = await response.json();
        console.log(tokenData.access_token);
        res.redirect(`/welcome?access_token=${tokenData.access_token}`);
    } else {
        res.send("oops");
    }
});

app.get("/welcome", async (req, res) => {
    // We passed the access token in via the querystring
    const {
        access_token
    } = req.query;

    // An Etsy access token includes your shop/user ID
    // as a token prefix, so we can extract that too
    const user_id = access_token.split('.')[0];

    const requestOptions = {
        headers: {
            'x-api-key': clientID,
            // Scoped endpoints require a bearer token
            Authorization: `Bearer ${access_token}`,
        }
    };

    const response = await fetch(
        `https://api.etsy.com/v3/application/users/${user_id}`,
        requestOptions
    );

    if (response.ok) {
        const userData = await response.json();
        // Load the template with the first name as a template variable.
        res.render("welcome", {
            first_name: userData.first_name
        });
    } else {
        res.send("oops");
    }
});

// Start the server on port 3003

app.listen(process.env.PORT || 3003, 
	() => console.log("Server is running...")
);
