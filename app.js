
require('dotenv').config()

const TwilioClient = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

var parsePhoneNumber = require('libphonenumber-js').parsePhoneNumber
var express = require('express');
const path = require('path');
const helpers = require('./helpers')

const {
    BlobServiceClient,
    StorageSharedKeyCredential,
    newPipeline
  } = require('@azure/storage-blob');


var router = express();
const withAuth = require('./middleware');
const MessagingResponse = require('twilio').twiml.MessagingResponse;
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
// add relevant request parsers
router.use(express.json());
router.use(express.urlencoded({ extended: true }));
router.use(express.text());
router.use(cookieParser());

const secret = process.env.JWT_SECRET


const containerName1 = 'thumbnails';
const multer = require('multer');
const inMemoryStorage = multer.memoryStorage();
const uploadStrategy = multer({ storage: inMemoryStorage }).array('images', 12);
const getStream = require('into-stream');
// const getStream = require('get-stream');
const containerName2 = 'images';
const ONE_MEGABYTE = 1024 * 1024;
const uploadOptions = { bufferSize: 4 * ONE_MEGABYTE, maxBuffers: 20 };

const sharedKeyCredential = new StorageSharedKeyCredential(
  process.env.AZURE_STORAGE_ACCOUNT_NAME,
  process.env.AZURE_STORAGE_ACCOUNT_ACCESS_KEY);
const pipeline = newPipeline(sharedKeyCredential);

const blobServiceClient = new BlobServiceClient(
  `https://${process.env.AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net`,
  pipeline
);

const getBlobName = originalName => {
  // Use a random number to generate a unique file name, 
  // removing "0." from the start of the string.
  const identifier = Math.random().toString().replace(/0\./, '');
//   return `${identifier}-${originalName}`;
  return `${identifier}`;
};


router.get('/version', async function (req, res) {
    res.send('This service is running correctly! Version 2 Updated 2022-03-07');
});

router.get('/scheduler', async function (req, res) {
    helpers.sendAllUnrespondedMessagesToAccountant()
    res.send('Scheduler Started Sucessfully!');
});

// Authentication Routes

router.post('/authenticate', function(req, res) {
    const { email, password } = req.body;
    let result = helpers.loginUser(email,password)
    if( result ){
        const payload = { email };
        const token = jwt.sign(payload, secret, {
        expiresIn: '1h'
        });
        res.cookie('token', token, { httpOnly: true })
        .sendStatus(200);
    }else{
        res.status(401)
            .json({
              error: 'Incorrect email or password'
          });
    }
})

router.get('/checkToken', withAuth, function(req, res) {
    res.sendStatus(200);
});

// Closed Routes

router.get('/charges', withAuth, async function (req, res) {
    let charges = await helpers.getAllCharges()
    res.send(JSON.stringify({ 
        data: charges,
        message: "Success"
    }));
});



// Open routes for twilio and form 

router.get('/charge/:id', async function (req, res) {
    let charge = await helpers.getCharge(req.params.id)
    res.send(JSON.stringify({ 
        status: charge ? true : false, 
        data: charge,
        message: "Success"
    }));
});

router.post('/charge', uploadStrategy, async function (req, res) {
    var attachedFiles = [];
    if( req.files ){
        for( var i = 0 ;  i < req.files.length ; i++ ){
            element = req.files[i];
            const blobName = getBlobName(element.originalname);
            const stream = getStream(element.buffer);
            const containerClient = blobServiceClient.getContainerClient(containerName2);;
            const blockBlobClient = containerClient.getBlockBlobClient(blobName);

            try {
                await blockBlobClient.uploadStream(stream,
                uploadOptions.bufferSize, uploadOptions.maxBuffers,
                { blobHTTPHeaders: { blobContentType: element.mimetype } });
                attachedFiles[i]= blobName; 
            } catch (err) {
                console.log("err", err);
            }
        }
    }
    await helpers.recordManagerResponse(req.body, attachedFiles)
    res.send(JSON.stringify({ 
        status: true, 
        data: [],
        message: "Success"
    }));
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

    processMessages(req);
    // return res.status(200).send('success');
    const twiml = new MessagingResponse();
    res.writeHead(200, {'Content-Type': 'text/xml'});
    res.end(twiml.toString());
    
});



async function processMessages(req){

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

}

// adding react routes
router.use('/static', express.static(path.join(__dirname, 'frontend/build//static')));
router.get('*', function(req, res) {
  res.sendFile('index.html', {root: path.join(__dirname, 'frontend/build')});
});

router.listen(process.env.PORT, function () {
    console.log(`Example app listening on port ${process.env.PORT}!`);
});