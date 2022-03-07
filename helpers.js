const Pool = require('pg').Pool
const TwilioClient = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
var cron = require('node-cron');
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: 5432,
  ssl: true
})

// const scheduleTask = () => {
//   var task = cron.schedule('0 0 * * *', () => {
//     sendAllUnrespondedMessagesToAccountant();
//   }, {
//     scheduled: true,
//     timezone: "EST"
//   });
//   task.start();
// }

const sendAllUnrespondedMessagesToAccountant = async () => {
  try {
    const {
      rows
    } = await pool.query(`SELECT * FROM charges WHERE created_at <= (CURRENT_DATE - INTERVAL '1 days') and status = 0 and sent = 0`)
    if (rows.length) {
      rows.forEach(function (item, index) {
        sendToNoResponse(item.id);
      })
    }
  } catch (e) {
    return false
  }
}

const getAllManagers = async () => {
  const {
    rows
  } = await pool.query("SELECT * FROM managers");
  return rows
}

const getManagerFromPhone = async (phone) => {
  try {
    const {
      rows
    } = await pool.query(`SELECT * FROM managers WHERE phone='${phone}' LIMIT 1`);
    if (rows.length) {
      return rows
    }
    return false
  } catch (e) {
    return false
  }
}

const getManagerFromLast4 = async (last4) => {
  try {
    const {
      rows
    } = await pool.query(`SELECT * FROM managers WHERE last4='${last4}' LIMIT 1`);
    if (rows.length) {
      return rows
    }
    return false
  } catch (e) {
    return false
  }
}

const recordManagerResponse = async (data) => {
  try {
    let status = 0;
    if ( data.status == 2 ) {
      status = 2;
    } else if ( data.status == 1 ) {
      status = 1;
    }
    let query = `update charges set status=${status}, comment='${data.comment.replace(/'/g, "''")}' where id = ${data.id}`;
    await pool.query(query)
    if( status == 1){
      sendToAccoutant(data.id);
    }
    return true
  } catch (e) {
    return false
  }
}

const getCharge = async (id) => {
  try {
    const {
      rows
    } = await pool.query(`SELECT * FROM charges WHERE id='${id}' LIMIT 1`);
    if (rows.length) {
      return rows
    } else {
      return false
    }
  } catch (e) {
    return false
  }
}

const sendMessage = (to, body) => {
  TwilioClient.messages
    .create({
      body: body,
      from: process.env.TWILIO_DEFAULT_PHONE,
      to: to
    })
    .then(message => console.log(message.sid));
}

const sendToManager = async (manager, message) => {
  sendMessage(manager[0].phone, message)
}

const sendToTechnicalStaff = async (message) => {
  var technicalNumbers = process.env.TECHNICAL_DEPT_PHONE.split(',');
  technicalNumbers.forEach(function (item, index) {
    sendMessage(item, message)
  })
}

const sendToThirdParty = async (message) => {
  if (process.env.TWILIO_THIRD_PARTY_PHONE) {
    sendMessage(process.env.TWILIO_THIRD_PARTY_PHONE, message)
  }

}

const sendToAccoutant = async (chargeId) => {
  let charge = await getCharge(chargeId);
  var manager = await getManagerFromLast4(charge[0].last4);
  var accountantNumbers = process.env.ACCOUNTS_DEPT_PHONE.split(',');
  if (manager.length) {
    accountantNumbers.forEach(function (item, index) {
      let messageBody = `${manager[0].name} ( ${manager[0].phone} ) does not recognize this charge,\n Bank's Message: ${charge[0].message}`;
      if( charge[0].comment ){
        messageBody += `, \n Managers's Comment: ${charge[0].comment}`
      }  
      sendMessage(item, messageBody);
    })
  }
}

const sendToNoResponse = async (chargeId) => {
  try {
    let charge = await getCharge(chargeId);
    var manager = await getManagerFromLast4(charge[0].last4);
    var noResponseNumber = process.env.NOT_RESPONSE.split(',');
    if (manager.length) {
      var updateCharge = ` update charges set sent = 1 where id = ${chargeId}`;      
      noResponseNumber.forEach(function (item, index) {
        sendMessage(item, `${manager[0].name} ( ${manager[0].phone} ) did not respond to this charge, Bank's Message: ${charge[0].message}`);
      })
      const rows = await pool.query(updateCharge);
      console.log("Rows update: " + rows.length);
    }
  } catch (e) {
    console.log("sendToNoResponse ", e);
    return false
  }
}

const processBankMessage = async (message) => {
  try {
    var last4Regexp = /(\(\d{4}\))/;
    var matchLast4 = last4Regexp.exec(message);
    const timestamp = new Date(Date.now()).toISOString();
    if (matchLast4) {
      matchLast4 = matchLast4[0].substring(1, matchLast4[0].length - 1);
      var targetedManager = await getManagerFromLast4(matchLast4)
      var insertCharge = ` insert into charges (last4, message, created_at) values ('${matchLast4}', '${message.replace(/'/g, "''")}', '${timestamp}') RETURNING id;`;
      const {
        rows
      } = await pool.query(insertCharge)
      let chargeID = rows[0].id
      var messageToSend = `Bank's Message: ${message}. `;
      if (targetedManager) {
        messageToSend += `\nPlease follow the link to report this charge ${process.env.SITE_URL}/verify/${chargeID}`
        sendToManager(targetedManager, messageToSend)
      } else {
        messageToSend += `\n manager with these last 4 card number does not exist in the database`
        sendToTechnicalStaff(messageToSend)
        var insertMessage = ` insert into odd_message(last4,message,created_at) values ('${matchLast4}', '${message.replace("'", "″")}','${timestamp}');`;
        await pool.query(insertMessage)
        // targeted manager with last 4 does not exsits
      }
    } else {
      sendToThirdParty(message)
      var insertMessageNoMatch = ` insert into odd_message(message,created_at) values ('${message.replace("'", "″")}','${timestamp}');`;
      await pool.query(insertMessageNoMatch)
      // this is not a message with the charges
    }

  } catch (e) {
    console.log("processBankMessage ", e);
    return false
  }
}

const processManagerMessage = async (message) => {
  try {
    var yesRegex = /C([0-9]*\d)Y/i;
    var noRegex = /C([0-9]*\d)N/i;
    var yesResult = yesRegex.exec(message);
    var noResult = noRegex.exec(message);
    if (yesResult || noResult) {
      let chargeID = false;
      let status = 0;
      if (yesResult) {
        chargeID = yesResult[0].substring(1, yesResult[0].length - 1);
        status = 2;
      } else if (noResult) {
        chargeID = noResult[0].substring(1, noResult[0].length - 1);
        status = 1;
        sendToAccoutant(chargeID);
      }
      let query = `update charges set status=${status} where id = ${chargeID}`;
      pool.query(query)
    } else {
      sendToThirdParty(message)
      // Manager sent an unknown message
    }
  } catch (e) {
    console.log("processManagerMessage ", e);
    return false
  }
}

const processUnknownMessage = async (message) => {
  try {
    // Message Not from Manager or Bank
  } catch (e) {
    return false
  }
}

module.exports = {
  getAllManagers,
  getManagerFromPhone,
  processBankMessage,
  processManagerMessage,
  processUnknownMessage,
  getManagerFromLast4,
  sendAllUnrespondedMessagesToAccountant,
  getCharge,
  recordManagerResponse
}