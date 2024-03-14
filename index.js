const dotenv = require('dotenv');
// Check for --dev option
if (process.argv.includes('--dev')) {
    dotenv.config({path: '.env.dev'});
} else {
    dotenv.config({path: '.env'});
}

const {token, clientId} = process.env;

const {Client, REST, Routes, GatewayIntentBits, EmbedBuilder, ChannelType,codeBlock} = require('discord.js');
const client = new Client({
	intents: [
			GatewayIntentBits.Guilds,
			GatewayIntentBits.GuildMessages,
			GatewayIntentBits.MessageContent,
	]
});

const fs = require('fs');
const help = fs
    .readFileSync("help.md")
    .toString();

const callNickname = function (guild, author) {
    const member = guild.member;
    return member
        ? member.displayName
        : author.username;
}

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', async message => {
    try {
        const {content, channel, author, guild} = message;
        const currentChannel = channel.name;

        if (author.bot) {
            return;
        }

        const nickname = callNickname(guild, author);

        if (content.startsWith('<:') && content.endsWith('>')) {
            const emoji_id = content
                .replace('<:', '')
                .split('>')[0]
                .split(':')[1];
            const emoji_url = `https://cdn.discordapp.com/emojis/${emoji_id}.png`;

            const imageEmbed = new EmbedBuilder()
                .setImage(emoji_url)
                .setAuthor({ name: nickname, iconURL: author.avatarURL(), url: author.avatarURL() })

            await channel.send({ embeds: [imageEmbed] });

            /*time unitl delete in milliseconds*/
            message.delete({timeout: 500});
        }

        //리스트 채널에서 이미지 목록 불러옴 최대 100개
        if (content.startsWith(':')) {
            const channelList = [...guild.channels.cache]
                .filter(
                    (e) => e[1].type === ChannelType.GuildText 
                )
                .map((e) => {
                    return {id: e[1].id, name: e[1].name}
                });

            //스티커 목록 채널 찾기
            const stickerChannel = channelList.find((element) => {
                return element
                    .name
                    .includes('스티커');
            });

            if (stickerChannel !== undefined) {
                //스티커 목록 리로드
                guild
                    .channels
                    .cache
                    .get(stickerChannel.id)
                    .messages
                    .fetch({limit: 100})
                    .then(messages => {
                        const stickerList = messages
                            .filter((m) => {
                                return [...m.attachments].length > 0;
                            })
                            .map((m) => {
                                return {
                                    name: m.content,
                                    url: [...m.attachments][0][1].url
                                }
                            });

                        const stickerName = content.endsWith(':')
                            ? content.substring(1, content.length - 1)
                            : content.substring(1);
                        const sticker = stickerList.find((s) => s.name === stickerName);

                        if (sticker !== undefined) {
                            const imageEmbed = new EmbedBuilder()
                                .setImage(sticker.url)
                                .setAuthor({ name: nickname, iconURL: author.avatarURL(), url: author.avatarURL() })

                            channel.send({ embeds: [imageEmbed] });

                            /*time unitl delete in milliseconds*/
                            message.delete({timeout: 500});
                        }
                    });
            }
            return;
        }
    } catch (error) {
        console.log(error);
    }
});

client.on('interactionCreate', async interaction => {
    try {
        if (interaction.isChatInputCommand() && interaction.commandName === '도움말') {
            await interaction.reply({content: codeBlock(help), ephemeral: true});
        }
    } catch (error) {
        console.log(error);
    }
});

const commands = [
    {
        name: '도움말',
        description: '사용법 설명'
    }
];

const rest = new REST('10').setToken(token);

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');
        await rest.put(Routes.applicationCommands(clientId), {body: commands});
        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();

client.login(token);