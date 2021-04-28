const axios = require('axios')
const prompt = require('prompt');
const cheerio = require('cheerio');

const accountSid = 'xxx'; 
const authToken = 'xxx'; 
const client = require('twilio')(accountSid, authToken); 
 

let asin, desired_price;
let url = 'http://www.amazon.com/dp/';
let span_id = '#price_inside_buybox';
let check_interval = 20000;

let prompts = {
	properties: {
		asin: {
			description: 'Enter the product ASIN',
			type: 'string',
			required: true
		},
		price: {
			description: 'Enter the desired price (USD)',
			type: 'number',
			required: true
		}
	}
};

prompt.start();

prompt.get(prompts, function (error, result) {
	if (!error) {
		asin = result.asin;
		desired_price = result.price;

		url += asin;

		checkPrice();
	}
});

function checkPrice() {
	axios.get(url).then((response) => {
		let $ = cheerio.load(response.data);

		let price_text = $(span_id).text();
		console.log("current_price:"+price_text)
		let price= price_text.replace('$', '').replace(',', '');

		if (price <= desired_price) {
			sendSMS();
		}

	}).catch((error) =>console.log(error))

	setTimeout(checkPrice, check_interval);
}

function sendSMS() {
	client.messages 
      .create({ 
         body: 'Your watched amazon item has dropped to your desired price', 
         from: '+12512570732',    
         to: '+16144956669' 
       }) 
      .then(message => console.log(message.sid)) 
      .done();
}


// https://www.twilio.com/console/api-explorer/sms/messages/create