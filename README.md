# lan-monitor-bot

This a lightweight discord bot that can be, for example ran on a RaspberryPI to monitor your network and notify you of events through Discord. The bot uses the Address Resolution Protocol (ARP) to discover local devices. Of course you can run it on your computer if you wish to. I am planning to create triggers so that the bot can be linked with other IoT devices to easily automate stuff around the house such as triggering cameras, sensors etc. 

## Features
* Monitors devices on your network from discord.
* Shows last time a device has been online.
* Label the devices for easier recognition. 
* Delete old devices from the list. 
* (In development) Notify when a device goes offline/online with a message. 
* (In development) Custom HTTP request calls to endpoints when a device goes online/offline. (Could be used to automate IoT devices)

## Pictures
![Picture](https://github.com/Ivstiv/lan-monitor-bot/blob/master/pic.png)

## Commands
The commands use the default prefix "+". 

* `+help | Shows all commands with descriptions.`
* `+label add <mac address> <label> | Adds a label to a device.`
* `+label remove <mac address> | Removes a label from a device.`
* `+device remove <mac address> | Removes a device 
from the list.`

In development: 

* `+notify online <mac address> | Sends a message every time the device comes online.`
* `+notify offline <mac address> | Sends a message every time the device goes offline.`

## Setup a bot
1. [Here](https://www.digitaltrends.com/gaming/how-to-make-a-discord-bot/) is a tutorial on how to do that.

Invitation link(populate CLIENT_ID and PERMISSIONS_ID):
>https://discordapp.com/oauth2/authorize?&client_id=CLIENT_ID&scope=bot&permissions=PERMISSIONS_ID

## Installation
1. Make sure you have Node JS installed!

2. Clone the repository. 

3. Install the bot

	`npm install`
4. Create a config file.

    `cp example-config.json config.json`
5. Edit the config with your own bot token and channel id. You can find more info on how to find them [here](https://github.com/Chikachi/DiscordIntegration/wiki/How-to-get-a-token-and-channel-ID-for-Discord).

6. Start the bot. 

    `node index`
7. You can use tmux, screen, systemd or npm's package "forever" to hold the bot working on the background.

## Tips

If you get "?" in the names column this is because you are either running the bot on Windows or the DNS server that you are using is an external one and not the default gateway so there is no way to resolve the names. 

Works really well on a RaspberryPI without putting a lot of processing load on it. 

Make sure that only you have access to the channel since the information obtained from it could be used for malicious purposes.

If you move the bot your can restore all device data from the file "devices.json". Just move it in the bot's directory to be loaded on startup. 

## Config
token - Bot's token, can be found in the discord's developers portal.

prefix - Bot's prefix before the commands.

channelID - The ID of the channel where you want the bot to operate in. 

utcOffset - If for some reason the timing of the bot is different from your timezone you can edit this to create an offset.

updatePeriod - Update rate of the displayed table. 

savePeriod - Save rate of the data to a file. 

## Links
* Discord.js docuemntation <https://discord.js.org/#/docs/main/stable/general/welcome>

* ARP wiki page for reference
<https://en.wikipedia.org/wiki/Address_Resolution_Protocol>