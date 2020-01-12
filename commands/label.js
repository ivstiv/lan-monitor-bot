const Discord = require("discord.js");
const {devices} = require('./../Storage.js');

module.exports = {
	name: 'label',
	description: 'Adds and removes a label from a device.',
	execute(message, args) {
		if(args[0] === 'add') {

			if(args.length < 3) {
				message.channel.send("Insufficient arguments!");
				return;
			}

			if(devices.has(args[1])) {
				devices.get(args[1]).label = args.slice(2).join(" ");
				message.channel.send("Added a label to device with MAC: "+args[1]);
			}else{
				message.channel.send("Couldn't find a device with MAC: "+args[1]);
			}

		}else if(args[0] === 'remove') {

			if(args.length < 2) {
				message.channel.send("Insufficient arguments!");
				return;
			}

			if(devices.has(args[1])) {
				devices.get(args[1]).label = "Unlabeled";
				message.channel.send("Removed a label from device with MAC: "+args[1]);
			}else{
				message.channel.send("Couldn't find a device with MAC: "+args[1]);
			}
		}else{
			message.channel.send("Insufficient arguments!");
		}
	}
}