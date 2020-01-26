const fs = require('fs');
let config = require("./config.json");

module.exports = {

	log: function(text) {
		let date = new Date();
		let timeString = `[${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}] `;
		console.log(timeString+text);
	},

	devices: devices = new Map(),
	
	saveDevices: function() {
		let savedDevices = [];
		for(let [mac, device] of devices) {
			savedDevices.push({
				name: device.name,
				ip: device.ip,
				mac: device.mac,
				label: device.label,
				status: device.status,
				lastSeen: device.lastSeen,
			});
		}
		
		module.exports.log("Saving "+savedDevices.length+" devices.");
		
	  try {
		fs.writeFileSync('devices.json', JSON.stringify(savedDevices, null, 4), "utf8");
	  } catch (err) {
		module.exports.log(err);
	  }
	},

	loadDevices: function() {
		try {
			let savedDevices = JSON.parse(fs.readFileSync('devices.json', 'utf8'));
			let loadedDevices = module.exports.devices;
			
			savedDevices.forEach(device => {
				loadedDevices.set(
					device.mac,
						{
							name: device.name,
							ip: device.ip,
							mac: device.mac,
							label: device.label,
							status: device.status,
							lastSeen: device.lastSeen
						}
				);	
			});
			
			module.exports.log("Loaded "+loadedDevices.size+" devices.")
			
		} catch (err) {
			module.exports.log(err)
			return false
		}
	}
}