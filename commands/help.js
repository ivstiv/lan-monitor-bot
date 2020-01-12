const Discord = require("discord.js");
const config = require('./../config.json');

module.exports = {
	name: 'help',
	description: 'Shows available commands.',
	execute(message, args) {
		const helpEmbed = new Discord.RichEmbed()
				.setColor('#0099ff')
				.setTitle('Commands:')
				.addField(`**${config.prefix}help**`, '**Shows this menu.**')
				.addField(`**${config.prefix}label add <mac address> <label>**`, '**Adds a label to a device.**')
				.addField(`**${config.prefix}label remove <mac address>**`, '**Removes a label from a device.**')
				.addField(`**${config.prefix}device remove <mac address>**`, '**Removes a device from the list.**');
			
		message.channel.send(helpEmbed);
	}
}