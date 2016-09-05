'use strict';

const PAGE_ACCESS_TOKEN = 'EAAEQ7IqZAuXoBAM5WZBRDZAfYKSFGWHViYM2edeFeZCvnPaG3VvfFZCTEFElXZAAB4vbEIE7WUWFTR233XrfZAtwMlS7XTYHVURUZAppD8bctvw0GnObez7g36ZAyx4CkNpDm0Qyx6b68LYJfZADgclkgWKZBHIIUJOZBGJ0ViUt4lB2cAZDZD'
const fetch = require('node-fetch');
const express = require('express');

fetch('http://api.themoviedb.org/3/movie/now_playing?api_key=ea063f4f9f9c96a700b99b9737a83c80')
  .then(function(response){
    return response.json().then(function(json){
      json.results.map(function(item) {
        console.log(item.original_title)
      });
    });
  });


let app = express();

app.get('/hello', function(req, res) {
  res.send('world')
})

app.get('/webhook', function(req, res) {
  if (req.query['hub.mode'] === 'subscribe' &&
      req.query['hub.verify_token'] === 'keep_this_secret') {
    console.log("Validating webhook");
    res.status(200).send(req.query['hub.challenge']);
  } else {
    console.error("Failed validation. Make sure the validation tokens match.");
    res.sendStatus(403);
  }
});

app.post('/webhook', function (req, res) {
  var data = req.body;

  if (data.object == 'page') {
    data.entry.forEach(function(pageEntry) {
      var pageID = pageEntry.id;
      var timeOfEvent = pageEntry.time;

      pageEntry.messaging.forEach(function(messagingEvent) {
        if (messagingEvent.optin) {
          receivedAuthentication(messagingEvent);
        } else if (messagingEvent.message) {
          receivedMessage(messagingEvent);
        } else if (messagingEvent.delivery) {
          receivedDeliveryConfirmation(messagingEvent);
        } else if (messagingEvent.postback) {
          receivedPostback(messagingEvent);
        } else {
          console.log("Webhook received unknown messagingEvent: ", messagingEvent);
        }
      });
    });

    res.sendStatus(200);
  }
});

function receivedMessage(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfMessage = event.timestamp;
  var message = event.message;

  console.log("Received message for user %d and page %d at %d with message:",
    senderID, recipientID, timeOfMessage);
  console.log(JSON.stringify(message));

  var messageId = message.mid;

  // You may get a text or attachment but not both
  var messageText = message.text;
  var messageAttachments = message.attachments;

  if (messageText) {

    // If we receive a text message, check to see if it matches any special
    // keywords and send back the corresponding example. Otherwise, just echo
    // the text we received.
    switch (messageText) {
      case 'image':
        sendImageMessage(senderID);
        break;

      case 'button':
        sendButtonMessage(senderID);
        break;

      case 'generic':
        sendGenericMessage(senderID);
        break;

      case 'receipt':
        sendReceiptMessage(senderID);
        break;

      default:
        sendTextMessage(senderID, messageText);
    }
  } else if (messageAttachments) {
    sendTextMessage(senderID, "Message with attachment received");
  }
}

function sendTextMessage(recipientId, messageText) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: messageText
    }
  };

  callSendAPI(messageData);
}

function callSendAPI(messageData) {
  request({
    uri: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token: PAGE_ACCESS_TOKEN },
    method: 'POST',
    json: messageData

  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var recipientId = body.recipient_id;
      var messageId = body.message_id;

      console.log("Successfully sent generic message with id %s to recipient %s",
        messageId, recipientId);
    } else {
      console.error("Unable to send message.");
      console.error(response);
      console.error(error);
    }
  });
}

app.listen(process.env.PORT || 8080);
