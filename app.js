
require('dotenv').config()
const TwilioClient = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

var parsePhoneNumber = require('libphonenumber-js').parsePhoneNumber
var express = require('express');
const path = require('path');
const helpers = require('./helpers')
var router = express();
helpers.scheduleTask();

router.get('/', async function (req, res) {
    // result = await helpers.getAllManagers();
    // var bankNumbers = process.env.BANK_NUMBERS.split(',');
    

    // result = await helpers.getManagerFromPhone( "+15408274139" )
    // messageBody = "Capital One: A charge or hold for $76.20 on January 13, 2022 was placed on your Spark Cash credit card (9877) at Home Depot. Std carrier chrges apply";
    // helpers.processBankMessage(messageBody);
    // messageBody = "C8N"
    // helpers.processManagerMessage(messageBody)
    // helpers.sendAllUnrespondedMessagesToAccountant()
    // console.log(result, bankNumbers);
    res.send('This service is running correctly! Version 1.01b');
});

router.get('/scheduler', async function (req, res) {
    helpers.sendAllUnrespondedMessagesToAccountant()
});

router.get('/recieve-msg', function (req, res) {
    // const twilioSignature = req.headers['x-twilio-signature'];
    // const params = req.body;
    // const url = 'https://your-webhook-endpoint.io';

    // const requestIsValid = twilio.validateRequest(
    //     process.env.TWILIO_AUTH_TOKEN,
    //     twilioSignature,
    //     url,
    //     params
    // );

    // if (!requestIsValid) {
    //     return res.status(401).send('Unauthorized');
    // }
    // console.log("req",req);

    var messageFrom = req.query.From;
    var messageBody = req.query.Body;

    var bankNumbers = process.env.BANK_NUMBERS.split(',')
    const fromNumber = parsePhoneNumber(messageFrom, 'US').number
    
    if( bankNumbers.includes( fromNumber ) ){
        // if the message is from bansks number
        helpers.processBankMessage(messageBody);
    }else if( helpers.getManagerFromPhone( fromNumber ) ){
        // if a message comes from a manager
        helpers.processManagerMessage(messageBody);
    }else{
        // if a message does 
        helpers.processUnknownMessage(messageBody);
    }
    return res.status(200).send('success');



    
});


router.listen(process.env.PORT, function () {
    console.log(`Example app listening on port ${process.env.PORT}!`);
});