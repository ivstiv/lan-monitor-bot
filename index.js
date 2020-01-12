const config = require('./config.json');
const {devices} = require('./Storage.js');
const Discord = require("discord.js");
const fs = require('fs');
const find = require('local-devices');
const AsciiTable = require('ascii-table');
const moment = require('moment');
const client = new Discord.Client();

let lastMessageID = null;

client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

// adding commands from files
for (const file of commandFiles)  {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}

client.on("ready", () => {
	console.log('Bot is running. . .');

	let channel = client.channels.get(config.channelID);
	channel.bulkDelete(100);
		
	refreshDevices();
	setInterval(refreshDevices, config.updatePeriod*1000);
	//setInterval(saveData, config.savePeriod*60*100);
});


client.on('message', message => {
	if(message.author.bot) return;
	if(message.channel.id !== config.channelID) return;

	if(message.content.startsWith(config.prefix)) {		
		// execute the command
		const args = message.content.trim().slice(config.prefix.length).split(/ +/);
		const command = args.shift().toLowerCase();

		if(!client.commands.has(command)) {
			message.channel.send(`Type ${config.prefix}help to check available commands.`);
		}else{
			try {
				client.commands.get(command).execute(message, args);
			}catch(error) {
				log(error);
				message.reply('There was an error trying to execute that command!');
			}
		}
		
		// reprint the table to be "pinned" to the bottom
		if(lastMessageID) {
			message.channel.fetchMessage(lastMessageID)
			.then(msg => {
				msg.delete();
				lastMessageID = null;
				printTable();
			});
		}
	}else{
		message.channel.send(`Type ${config.prefix}help to check available commands.`);
		// reprint the table to be "pinned" to the bottom
		if(lastMessageID) {
			message.channel.fetchMessage(lastMessageID)
			.then(msg => {
				msg.delete();
				lastMessageID = null;
				printTable();
			});
		}
	}
});

function refreshDevices() {
	find().then(onlineDevices => {
		// reset the status
		for(let [mac, device] of devices) {
			if(device.status === 'Online') {
				let time = moment().utcOffset(config.utcOffset).format('MM/DD HH:mm');
				device.status = `Last seen ${time}`;
			}
		}

		onlineDevices.forEach(onlineDevice => {
			// add a device if it is new
			if(!devices.has(onlineDevice.mac)) {
				addDevice(onlineDevice);
			}
			// update the status
			devices.get(onlineDevice.mac).status = 'Online';
		});

		printTable();
	});
}

function addDevice(device) {
	devices.set(device.mac, {
		name: device.name.substring(0, 20),
		ip: device.ip,
		mac: device.mac,
		label: 'Unlabeled',
		status: 'Online'
	});
}

function printTable() {
	let table = new AsciiTable();
	table.setHeading('Device', 'IP', 'MAC', 'Label', 'Status');
	// populate the table
	for(let [mac, device] of devices) {
		table.addRow(device.name, device.ip, mac, device.label, device.status);
	}
		
	table.sortColumn(4, function(a, b) {
  		if(a == 'Online')
  			return -1;
  		else 
  			return 1;  		
	});

	let channel = client.channels.get(config.channelID);
	let time = moment().utcOffset(config.utcOffset).format('MM/DD HH:mm');
	let footer = `\nLast updated: ${time} | Update rate: ${config.updatePeriod}s`;
	if(!lastMessageID) {
		channel.send("```\n"+`${table.toString()}`+footer+"```")
			.then(msg => lastMessageID = msg.id);
	}else{
		client.channels.get(config.channelID)
			.fetchMessage(lastMessageID)
				.then((message) => {
					message.edit("```\n"+`${table.toString()}`+footer+"```");
				});
	}
}

client.login(config.token);
