const Discord = require("discord.js");
const {devices} = require('./../Storage.js');

module.exports = {
	name: 'device',
	description: 'Removes a device.',
	execute(message, args) {

		if(args.length < 2) {
			message.channel.send("Insufficient arguments!");
			return;
		}

		if(args[0] === 'remove') {
			if(devices.has(args[1])) {
				devices.delete(args[1]);
				message.channel.send("Removed a device with MAC: "+args[1]);
			}else{
				message.channel.send("Couldn't find a device with MAC: "+args[1]);
			}
		}else{
			message.channel.send("Insufficient arguments!");
		}
	}
}