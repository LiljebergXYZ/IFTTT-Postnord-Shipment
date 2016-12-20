const fs = require('fs');
const got = require('got');

var args = process.argv.slice(2);
var ifttt_api = '';

if (args.length == 0) {
	try {
                // Does the file exists?
                fs.statSync(__dirname+'/config.json');
		var config = fs.readFileSync(__dirname+'/config.json', 'utf8');
                config = JSON.parse(config);
		if (typeof config.ifttt !== 'undefined') {
			ifttt_api = config.ifttt;
		}
		if (typeof config.shipments !== 'undefined') {
			for (var i = 0; i < config.shipments.length; i++) {
				CheckShipment(config.shipments[i]);
			}
		} else {
			console.error('Missing argument');
		}
        } catch (e) {
		// Nope throw error
		console.error('Missing argument');
	}
	return;
} else {
	ifttt_api = args[0];
	CheckShipment(args[1]);
}

function CheckShipment(id) {
	var endpoint = 'https://api1.postnord.com/rest/shipment/web/v1/trackandtrace/findByIdentifier.json?consumerId=5cad0846657e4825b50e16d1e1991713&id={0}&locale=en';
	endpoint = endpoint.replace('{0}', id);
	
	try {
        	// Does the file exists?
		fs.statSync(__dirname+'/log.txt');
	} catch (e) {
	        // It probably doesn't, let's create it
		fs.writeSync(__dirname+'/log.txt', '');
	}
	fs.appendFileSync(__dirname+'/log.txt', 'Running at ' + (new Date().toLocaleString()) + '. Looking up ' + id + '\n');

	got(endpoint, {json: true}).then(res => {
		var events = res.body.TrackingInformationResponse.shipments[0].items[0].events;
		latestEvent = events[events.length-1];
		try {
			// Does the file exists?
			fs.statSync(__dirname + '/shipmentdata.json');
		} catch (e) {
			// It probably doesn't, let's create it
			fs.writeFileSync(__dirname + '/shipmentdata.json', '{}');
		}
		var data = fs.readFileSync(__dirname + '/shipmentdata.json', 'utf8');
		data = JSON.parse(data);
		if (typeof data[id] !== 'undefined') {
			if (data[id].eventCode != latestEvent.eventCode) {
				data[id] = latestEvent;
				sendNotification(id, latestEvent.eventDescription);
			} else {
				fs.appendFileSync(__dirname + '/log.txt', '=>No new event found' + '\n');
			}
		} else {
			data[id] = latestEvent;
			sendNotification(id, latestEvent.eventDescription);
		}
		writeJson(data);
	})
	.catch (error => {
		console.error(error);
	});
}

function writeJson (data) {
	data = JSON.stringify(data);
	fs.writeFileSync(__dirname + '/shipmentdata.json', data);
}

function sendNotification (id, event) {
	var url = 'https://maker.ifttt.com/trigger/shipment_change/with/key/' + ifttt_api;

	got.post(url, { headers: { 'Content-type': 'application/json' }, body: JSON.stringify({ value1: id, value2: event }) }).then(res => { console.log(res.body); });
	fs.appendFileSync(__dirname + '/log.txt', '=>New event and notification sent' + '\n');
}
