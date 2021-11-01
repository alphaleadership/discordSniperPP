const { Client, MessageEmbed } = require('discord.js');
const chalk = require('chalk');
const fs = require('fs');

const client = new Client({ fetchAllMembers: true });
const timer = ms => new Promise(res => setTimeout(res, ms));

let opt =require('./config.json')
let channels = [];
let channelsChanged = false;
let users = []

// Created by Lorio (github.com/ImLorio)

client.on('guildCreate', async (guild) => {
    guild.members.fetch()
})

async function loadChannel() {
    channels = []
    for (const channel of opt.channels) {
        if (client.channels.cache.get(channel)) channels.push(client.channels.cache.get(channel)) && info(`channel ${chalk.bgCyan.black(` ${channel} `)} found!`);
        else err(`channel ${chalk.bgRed.white(` ${channel} `)} not found!`);
    }
    if (channelsChanged) channelsChanged = false
}

client.on('ready', async () => {
    console.log('yep!');

    await loadChannel()
    await loadUsers()
    for await (const user of users) {
        if (channelsChanged) await loadChannel()
        let avatar = client.users.cache.get(user[0]).displayAvatarURL({ format: 'png', dynamic: true, size: 2048 });
        for (const i in channels) channels[i].send(new MessageEmbed().setImage(avatar).setColor(newColor()));
        await timer(opt.time);
    };

})

client.on('message', async (message) => {

    if (!message.content.startsWith(opt.prefix) || message.author.bot || !message.guild) return;
    if (opt.wl.includes(message.author.id) || message.author.id === opt.owner) {} else return


    const MessageArray = message.content.split(/\s+/g),
        command = MessageArray[0].toLowerCase().substring(opt.prefix.length),
        args = MessageArray.slice(1);

    switch (command) {
        case `help`:
            message.reply(
                new MessageEmbed().setTitle(`Help Menu`)
                .addFields([{
                    name: `\`${opt.prefix}help\``,
                    value: `Show this menu`
                }, {
                    name: `\`${opt.prefix}channel <list/add/remove>\``,
                    value: `List, add or remove a channel`
                }, {
                    name: `\`${opt.prefix}config <prefix/timer>\``,
                    value: `Configure prefix and timer`
                }, {
                    name: `\`${opt.prefix}wl <user>\``,
                    value: `Allow user to use all commands`
                }]).setFooter(`Created by ImLorio`).setColor(newColor())
            );
        break; case `channel`:
            if (args[0] === 'list') {
                message.reply(new MessageEmbed().setTitle(`All channel configured`)
                    .setDescription(opt.channels.map((channel, index) => {
                        if (client.channels.cache.get(channel)){
                            let data = client.channels.cache.get(channel);
                            return `\`${index + 1}.\` **${data.name}** ||\`${data.id}\`|| in **${data.guild.name}** ||\`${data.guild.id}\`||`;
                        } else return `**ERROR**: no channel found for \`${channel}\``;
                    })
                ).setFooter(`Created by ImLorio`).setColor(newColor()));
            } else if (args[0]=== 'add') {

                let channel = (message.guild.channels.cache.get(args[1]) || message.mentions.channels.first())
                if (channel) {} else return message.reply(`**ERROR**, ${args[1]} not found`)
                if (opt.channels.includes(channel.id)) return message.reply(`**ERROR**, ${args[1]} already configured!`)
                
                message.reply(
                    new MessageEmbed().setTitle(`Channel changed!`).setColor(newColor())
                    .setDescription(`**${channel.name}** ||\`${channel.id}\`|| added.`)
                );
                opt.channels.push(channel.id);

                saveConfig();
            } else if (args[0] === 'remove') {

                if (args[1]) {} else return message.reply(`**ERROR**, no argument`)
                let channel = (message.guild.channels.cache.get(args[1]) || message.mentions.channels.first())
                if (channel && opt.channels.includes(channel.id)) {} else return message.reply(`**ERROR**, ${args[1]} not found`);

                message.reply(
                    new MessageEmbed().setTitle(`Channel changed!`).setColor(newColor())
                    .setDescription(`**${channel.name}** ||\`${channel.id}\`|| removed.`)
                );
                opt.channels = opt.channels.filter(i => i !== channel.id);
                
                saveConfig();
            } else {
                message.reply(
                    new MessageEmbed().setTitle(`Channel Help Menu`).setDescription(`\`<channel>\` can be a channel mention or a channel id`)
                    .addFields([{
                        name: `\`${opt.prefix}channel list\``,
                        value: `List all current channel`
                    }, {
                        name: `\`${opt.prefix}channel add <channel>\``,
                        value: `List, add or remove a channel`
                    }, {
                        name: `\`${opt.prefix}config remove <channel>\``,
                        value: `Configure prefix and timer`
                    }]).setFooter(`Created by ImLorio`).setColor(newColor())
                );
            };
        break; case `config`:
            
            if (args[0] === 'prefix') {
                let newPrefix = args.slice(1)
                
                message.reply(`__Nouveau prefix:__\`${opt.prefix}\` -> \`${newPrefix}\``);
                opt.prefix = newPrefix;

                saveConfig()
            } else if (args[0] === 'timer') {
                let newTimer = args[1]
                if (isNaN(newTimer)) return message.reply(`__**ERREUR**__: Votre nombre n'est pas valide`);
                if (newTimer < 1200) return message.reply(`__**ERREUR**__: Votre nombre est trop petit. (min: 1200)`);
                
                message.reply(new MessageEmbed().setDescription(`__New timer:__\`${opt.time}\` -> \`${newTimer}\``).setFooter(`Created by ImLorio`).setColor(newColor()))
                opt.time = newTimer;

                saveConfig()
            } else {
                message.reply(
                    new MessageEmbed().setTitle(`Configuration Help Menu`)
                    .addFields([{
                        name: `\`${opt.prefix}config prefix <prefix>\``,
                        value: `Change current prefix to custom prefix.`
                    }, {
                        name: `\`${opt.prefix}channel timer <time>\``,
                        value: `Change current timer to custom timer (in ms) Min: 1200ms`
                    }]).setFooter(`Created by ImLorio`).setColor(newColor())
                );
            }
            
        break;
        default:
            break;
    }

    if (message.content.toLowerCase().startsWith(`${opt.prefix}prefix`)) { // command config prefix
        let newPrefix = message.content.split(' ').slice(1);
        message.reply(`__Nouveau prefix:__\`${opt.prefix}\` -> \`${newPrefix.join(' ')}\``);
        opt.prefix = newPrefix.join(' ');
        console.log('Set prefix to ' + opt.prefix);
        saveConfig()
    }
    if (message.content.toLowerCase().startsWith(`${opt.prefix}timer`)) { // command config timer
        let newTimer = message.content.split(' ').slice(1)[0];
        message.reply(`__Nouveau timer:__\`${opt.time}\` -> \`${newTimer}\``)
        console.log('Set timer to ' + opt.time);
    }
})

client.login(opt.token)

function HSLtoRGB(h, s, l) {
    let r, g, b;

    const rd = (a) => {
        return Math.floor(Math.max(Math.min(a * 256, 255), 0));
    };

    const hueToRGB = (m, n, o) => {
        if (o < 0) o += 1;
        if (o > 1) o -= 1;
        if (o < 1 / 6) return m + (n - m) * 6 * o;
        if (o < 1 / 2) return n;
        if (o < 2 / 3) return m + (n - m) * (2 / 3 - o) * 6;
        return m;
    }

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = hueToRGB(p, q, h + 1 / 3);
    g = hueToRGB(p, q, h);
    b = hueToRGB(p, q, h - 1 / 3);

    return [rd(r), rd(g), rd(b)]
}
function newColor() {
    const [r, g, b] = HSLtoRGB(Math.random(), 1, (Math.floor(Math.random() * 16) + 75) * .01);
    return `#${r.toString(16)}${g.toString(16)}${b.toString(16)}` // RGB to Hexa RGBtoHex(r, g, b)
}
function shuffledArray(array) {
    return array.sort(() => 0.5 - Math.random());
}

const saveConfig = async () => await fs.writeFileSync('config.json', JSON.stringify(opt));
const loadUsers = async () => users = await shuffledArray(client.users.cache);

const err = (data) => console.log(chalk.red(`[ERROR] ${data}`))
const info = (data) => console.log(chalk.cyan(`[INFO] ${data}`))
