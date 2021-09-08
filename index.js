const Discord = require('discord.js');
const fs = require('fs');

const client = new Discord.Client({ fetchAllMembers: true });
const opt = JSON.parse(fs.readFileSync('./config.json', 'utf-8'));
const timer = ms => new Promise(res => setTimeout(res, ms));
let channels = [];
let changed = false;

// Created by Lorio (github.com/ImLorio)

client.on('guildCreate', async (guild) => {
    guild.fetchAuditLogs({
        "type": "BOT_ADD",
        "limit": 1
    }).then(logs => {
        let log = logs.entries.first()
        console.log(log.executor.tag)
    });
})

client.on('ready', async () => {
    console.log('yep!');

    for (const i in opt.channels) {
        if (client.channels.cache.get(opt.channels[i])) channels.push(client.channels.cache.get(opt.channels[i]));
    }
    const users = await shuffledArray(client.users.cache);
    for await (const user of users) {
        if (changed) {
            channels = []
            for (const i in opt.channels) channels.push(client.channels.cache.get(opt.channels[i]))
            changed = false
        };
        let avatar = client.users.cache.get(user[0]).displayAvatarURL({ format: 'png', dynamic: true, size: 1024 });
        for (const i in channels) channels[i].send(new Discord.MessageEmbed().setImage(avatar).setColor(newColor()));
        await timer(opt.time);
    };
})

client.on('message', async (message) => {
    if (opt.owners.includes(message.author.id)) {} else return
    // if (message.author.id === "810114164806254602" || message.author.id === "592322732906250250") { } else return;
    if (message.content.toLowerCase().startsWith(`${opt.prefix}setchannel`)) { // command setchannel
        let changChan = message.content.split(' ').slice(1);
        console.log('Set channel to ' + changChan.join(', '));
        opt.channels = changChan;
        saveConfig()
        changed = true;

        let msg = [
            ``
        ];
        for (const i in opt.channels) {
            let chan = client.channels.cache.get(opt.channels[i]);
            message.reply(`__Nouveau salon:__ \`${chan.name}\` ||(${chan.id})|| dans le serveur \`${chan.guild.name}\` ||(${chan.guild.id})||.`);
        }
    };
    if (message.content.toLowerCase().startsWith(`${opt.prefix}listchannel`)) { // command listchannel
        for (const i in opt.channels) {
            let chan = client.channels.cache.get(opt.channels[i]);
            message.reply(`__liste salon:__ \`${chan.name}\` ||(${chan.id})|| dans le serveur \`${chan.guild.name}\` ||(${chan.guild.id})||.`);
        }
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
        if (isNaN(newTimer)) return message.reply(`__**ERREUR**__: Votre nombre n'est pas valide`);
        if (newTimer < 1200) return message.reply(`__**ERREUR**__: Votre nombre est trop petit. (min: 1200)`);
        message.reply(`__Nouveau timer:__\`${opt.time}\` -> \`${newTimer}\``)
        opt.time = newTimer;
        console.log('Set timer to ' + opt.time);
        saveConfig()
    }
    if (message.content.toLowerCase().startsWith(`${opt.prefix}help`)) { // command help
        message.reply(
            `\`\`\`md` +
            `\n- ${opt.prefix}listchannel` +
            `\n- ${opt.prefix}setchannel <id> <id> <id>` +
            `\n- ${opt.prefix}prefix <prefix>` +
            `\n- ${opt.prefix}timer <time in ms>` +
            `\n- ${opt.prefix}help` +
            `\`\`\``
        );
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
/*function RGBtoHex(r, g, b) {
    return `#${r.toString(16)}${g.toString(16)}${b.toString(16)}`;
}*/
function newColor() {
    const [r, g, b] = HSLtoRGB(Math.random(), 1, (Math.floor(Math.random() * 16) + 75) * .01);
    return `#${r.toString(16)}${g.toString(16)}${b.toString(16)}` // RGB to Hexa RGBtoHex(r, g, b)
}
function shuffledArray(array) {
    return array.sort(() => 0.5 - Math.random());
}
const saveConfig = () => fs.writeFileSync('config.json', JSON.stringify(opt));
