
var express = require('express');
var router = express.Router();


const {OAuth2Client} = require('google-auth-library');

async function getUserData(access_token) {

  const response = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${access_token}`);
  
  //console.log('response',response);
  const data = await response.json();
  console.log('data',data);
}



/* GET home page. */
router.get('/', async function(req, res, next) {

    const code = req.query.code;

    console.log(code);
    try {
        const redirectURL = "http://127.0.0.1:3050/oauth"
        const oAuth2Client = new OAuth2Client(
            process.env.CLIENT_ID,
            process.env.CLIENT_SECRET,
            redirectURL
          );
        const r =  await oAuth2Client.getToken(code);
        // Make sure to set the credentials on the OAuth2 client.
        await oAuth2Client.setCredentials(r.tokens);
        console.info('Tokens acquired.');
        const user = oAuth2Client.credentials;
        console.log('credentials',user);
        //await getUserData(oAuth2Client.credentials.access_token);
        //process to get payload so you can set user in nice object
        const ticket=await oAuth2Client.verifyIdToken({idToken: user.id_token , audience: process.env.CLIENT_ID});
        //console.log("ticket:",ticket);

        const payload=ticket.getPayload();
        console.log('payload',payload)
        getUserData(user.access_token)

        const name=payload['name'];
        const userid=payload['sub'];
        const picture=payload['picture'];

        const userProfile={
            name:name,
            userid:userid,
            picture:picture
        }

      } catch (err) {
        console.log('Error logging in with OAuth2 user', err);
    }


    res.redirect(303, 'http://localhost:3050/login');

    
  


});

module.exports = router;
