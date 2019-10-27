var express = require('express');
var firebase = require('firebase');
var bodyParser = require('body-parser');
global.atob = require("atob");
var CryptoJS = require("crypto-js");

var app = express();
app.use(bodyParser.json());

app.listen(3000, () => {
    console.log("Server running on port 3000");
});

var config = {
    apiKey: "AIzaSyD5DqLGa-2rX2pMUfwoeX98agY40--AILI",
    authDomain: "trackbee-4758f.firebaseapp.com",
    databaseURL: "https://trackbee-4758f.firebaseio.com",
    projectId: "trackbee-4758f",
    storageBucket: "trackbee-4758f.appspot.com",
    messagingSenderId: "853866811590",
    appId: "1:853866811590:web:86990581757435a4cac7c7"
};
firebase.initializeApp(config);

const listOfAllowedSensorIDs = ['A4DD5', 'B667F', 'C7992', '6FF2D', '998FF'];
const registeredPassword = 'trackbeeAdmin';

function decryptMsg (data) {
    master_key = '1234567890123456';

    // Decode the base64 data so we can separate iv and crypt text.
    var rawData = atob(data);
    // Split by 16 because my IV size
    var iv = rawData.substring(0, 16);
    var crypttext = rawData.substring(16);

    //Parsers
    crypttext = CryptoJS.enc.Latin1.parse(crypttext);
    iv = CryptoJS.enc.Latin1.parse(iv); 
    key = CryptoJS.enc.Utf8.parse(master_key);

    // Decrypt
    var plaintextArray = CryptoJS.AES.decrypt(
      { ciphertext:  crypttext},
      key,
      {iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7}
    );

    // Can be Utf8 too
    output_plaintext = CryptoJS.enc.Latin1.stringify(plaintextArray);
    console.log("plain text : " + output_plaintext);
    return output_plaintext;
}

app.get('/', function (req, res) {
    console.log("HTTP Get Request");
    res.send("HTTP GET Request");
});

app.put('/', function (req, res) {
    console.log("HTTP Put Request");
    res.send("HTTP PUT Request");
});

app.post('/', function (req, res) {
    console.log("HTTP POST Request");

    var latitude = req.body.latitude;
    var longitude = req.body.longitude;
    var type = req.body.type;
    var sensorID = req.body.sensorID;
    var password = req.body.password;

    var passwordDecrypted = decryptMsg(password);
    if (listOfAllowedSensorIDs.includes(sensorID) && passwordDecrypted === registeredPassword) {
        var referencePath = 'animalsLive/';
        var userReference = firebase.database().ref(referencePath);
        userReference.push({
            latitude: latitude,
            longitude: longitude,
            type: type
        },
            function (error) {
                if (error) {
                    res.send("Data could not be saved." + error);
                }
                else {
                    res.send("Data saved successfully.");
                }
            });
    } else {
        res.send("Data could not be saved");
    }

});

app.delete('/', function (req, res) {
    console.log("HTTP DELETE Request");
    res.send("HTTP DELETE Request");
});