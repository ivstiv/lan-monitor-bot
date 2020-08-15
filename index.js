const config = require('./config.json');
const {devices, saveDevices, loadDevices, log} = require('./Storage.js');
const Discord = require("discord.js");
const fs = require('fs');
const find = require('local-devices');
const AsciiTable = require('ascii-table');
const moment = require('moment');
const client = new Discord.Client();

const PAGE_SIZE = 10;
let currentPage = 1;
let lastMessageID = null;

client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

// adding commands from files
for (const file of commandFiles)  {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}

client.on("ready", () => {
	log('Bot is running. . .');

	try {
	  if(fs.existsSync('devices.json')) {
	    loadDevices();
	  }
	}catch(err) {
	  log(err);
	}
	
	refreshDevices();

	setInterval(refreshDevices, config.updatePeriod*1000);
	setInterval(saveDevices, config.savePeriod*1000);
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
			message.channel.messages.fetch(lastMessageID)
			.then(msg => {
				msg.delete();
				lastMessageID = null;
				printTable(currentPage, PAGE_SIZE);
			});
		}
	}else{
		message.channel.send(`Type ${config.prefix}help to check available commands.`);
		// reprint the table to be "pinned" to the bottom
		if(lastMessageID) {
			message.channel.messages.fetch(lastMessageID)
			.then(msg => {
				msg.delete();
				lastMessageID = null;
				printTable(currentPage, PAGE_SIZE);
			});
		}
	}
});

function refreshDevices() {
	find().then(onlineDevices => {
		// reset the status to last seen for all
		for(let [mac, device] of devices) {
			if(device.status === 'Online') {
				let time = moment(device.lastSeen).utcOffset(config.utcOffset).format('MM/DD HH:mm');
				device.status = `Last seen ${time}`;
			}
		}

		onlineDevices.forEach(onlineDevice => {
			// add a device if it is new
			if(!devices.has(onlineDevice.mac)) {
				addDevice(onlineDevice);
			}
			// update the status to online
			devices.get(onlineDevice.mac).status = 'Online';
			devices.get(onlineDevice.mac).lastSeen = moment().valueOf();
		});

		printTable(currentPage, PAGE_SIZE);
	});
}

function addDevice(device) {
	devices.set(device.mac, {
		name: device.name.substring(0, 20),
		ip: device.ip,
		mac: device.mac,
		label: 'Unlabeled',
		status: 'Online',
		lastSeen: moment().valueOf(),
	});
}

function printTable(page, pageSize) {

	// sort the devices by lastSeen timestamp
	let sorted = Array.from(devices.entries());
	sorted.sort((a,b) => {
		if (a[1].lastSeen < b[1].lastSeen)  return 1;
		if (b[1].lastSeen < a[1].lastSeen) return -1;
		return 0;
	});

	let table = new AsciiTable();
	table.setHeading('Device', 'IP', 'MAC', 'Label', 'Status');

	// populate the table
	for(let i = (page-1)*pageSize; i < sorted.length && i < page*pageSize; i++) {
		table.addRow(sorted[i][1].name, sorted[i][1].ip, sorted[i][1].mac, sorted[i][1].label, sorted[i][1].status);
	}

	if (table.getRows.length === 0) {
		table.addRow('', '', '', '', '');
	}
	
	let channel = client.channels.cache.get(config.channelID);
	let time = moment().utcOffset(config.utcOffset).format('MM/DD HH:mm');
	let footer = `\nPage: ${page} | Last updated: ${time} | Update rate: ${config.updatePeriod}s`;
	if(!lastMessageID) {
		channel.send("```\n"+`${table.toString()}`+footer+"```")
			.then(msg => {
				lastMessageID = msg.id
				addPaginationControls(msg)
			});
	}else{
		client.channels.cache.get(config.channelID).messages
			.fetch(lastMessageID)
				.then((message) => {
					message.edit("```\n"+`${table.toString()}`+footer+"```");
				});
	}
}

function addPaginationControls(msg) {
	msg.react('⬅️')
		.then(() => msg.react('➡️'))
		.catch(() => console.error('[ERROR]One of the pagination controls failed to react.'));

	const filter = (reaction, user) => {
		return ['⬅️', '➡️'].includes(reaction.emoji.name) && user.id !== msg.author.id;
	};

	const collector = msg.createReactionCollector(filter);
	let maxPage = 5;

	collector.on('collect', (reaction, user) => {

		let prevPage = currentPage;

		if (reaction.emoji.name === '⬅️') {
			if(currentPage > 1) {
				currentPage--
			}
		} else if (reaction.emoji.name === '➡️') {
			if(currentPage < maxPage) {
				currentPage++
			}
		}

		if (reaction.count > 1) {
			reaction.users.remove(user.id);
		}

		// save on bandwidth and spamming the buttons
		if (prevPage !== currentPage)
			printTable(currentPage, PAGE_SIZE);
		console.log("Showing page:"+currentPage)
	})
}

client.login(config.token);
