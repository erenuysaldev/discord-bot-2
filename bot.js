import { Client, GatewayIntentBits, EmbedBuilder, PermissionsBitField } from 'discord.js';
import { joinVoiceChannel } from '@discordjs/voice';
import figlet from 'figlet';

const client = new Client({ 
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers] 
});

client.once('ready', () => {
    console.log('Bot hazır!');
    client.user.setActivity("Henry's Angel", { type: 'WATCHING' });

    const voiceChannelId = '';//voice channel id
    const voiceChannel = client.channels.cache.get(voiceChannelId);

    if (voiceChannel) {
        joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: voiceChannel.guild.id,
            adapterCreator: voiceChannel.guild.voiceAdapterCreator,
        });
        console.log(`Bot ${voiceChannel.name} kanalına girdi.`);
    } else {
        console.log('Belirtilen ses kanalı bulunamadı.');
    }
});

let gameActive = false;
let randomNumber = 0;
let attempts = 0;

client.on('messageCreate', async message => {
    // Admin kontrolü
    const isAdmin = message.member && message.member.permissions.has(PermissionsBitField.Flags.Administrator);

    // Yasaklama komutu
    if (message.content.startsWith('!ban')) {
        if (!isAdmin) {
            return message.channel.send('Bu komutu kullanma yetkiniz yok.');
        }
        const user = message.mentions.users.first();
        if (user) {
            const member = message.guild.members.cache.get(user.id);
            member.ban()
                .then(() => {
                    message.channel.send(`${user.tag} yasaklandı.`);
                })
                .catch(err => {
                    message.channel.send('Yasaklama işlemi başarısız oldu.');
                    console.error(err);
                });
        } else {
            message.channel.send('Yasaklamak için bir kullanıcı belirtmelisiniz.');
        }
    }

    // Atma komutu
    if (message.content.startsWith('!kick')) {
        if (!isAdmin) {
            return message.channel.send('Bu komutu kullanma yetkiniz yok.');
        }
        const user = message.mentions.users.first();
        if (user) {
            const member = message.guild.members.cache.get(user.id);
            member.kick()
                .then(() => {
                    message.channel.send(`${user.tag} atıldı.`);
                })
                .catch(err => {
                    message.channel.send('Atma işlemi başarısız oldu.');
                    console.error(err);
                });
        } else {
            message.channel.send('Atmak için bir kullanıcı belirtmelisiniz.');
        }
    }

    // Kanalı kilitleme komutu
    if (message.content.startsWith('!lock')) {
        if (!isAdmin) {
            return message.channel.send('Bu komutu kullanma yetkiniz yok.');
        }
        const channel = message.channel;
        channel.permissionOverwrites.edit(channel.guild.roles.everyone, { SEND_MESSAGES: false })
            .then(() => {
                message.channel.send('Bu kanal kilitlendi. Mesaj gönderilemez.');
            })
            .catch(err => {
                message.channel.send('Kanalı kilitleme işlemi başarısız oldu.');
                console.error(err);
            });
    }

    // Avatar gösterme komutu
    if (message.content.startsWith('!avatar')) {
        const user = message.mentions.users.first();
        if (user) {
            const avatarEmbed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle(`${user.username} Avatarı`)
                .setImage(user.displayAvatarURL({ dynamic: true, size: 1024 }))
                .setTimestamp();

            message.channel.send({ embeds: [avatarEmbed] });
        } else {
            message.channel.send('Avatarını görmek istediğiniz kullanıcıyı etiketlemelisiniz.');
        }
    }

    // Oyun başlatma
    if (message.content.startsWith('!startgame')) {
        if (gameActive) {
            return message.channel.send('Oyun zaten aktif!');
        }
        randomNumber = Math.floor(Math.random() * 100) + 1; 
        attempts = 0;
        gameActive = true;
        message.channel.send('Sayı tahmin etme oyunu başladı! 1 ile 100 arasında bir sayı tahmin edin.');
    }

    // Tahmin komutu
    if (message.content.startsWith('!guess')) {
        if (!gameActive) {
            return message.channel.send('Öncelikle oyunu başlatmalısınız! `!startgame` ile başlayın.');
        }
        const guess = parseInt(message.content.split(' ')[1]);
        attempts++;

        if (isNaN(guess)) {
            return message.channel.send('Lütfen geçerli bir sayı tahmin edin.');
        }

        if (guess < randomNumber) {
            message.channel.send('Tahmininiz çok düşük! Tekrar deneyin.');
        } else if (guess > randomNumber) {
            message.channel.send('Tahmininiz çok yüksek! Tekrar deneyin.');
        } else {
            message.channel.send(`Tebrikler! Doğru tahmin ettiniz! Sayı: ${randomNumber}. Toplam deneme: ${attempts}`);
            gameActive = false;
        }
    }

    // Oyunu sonlandırma
    if (message.content.startsWith('!endgame')) {
        if (!gameActive) {
            return message.channel.send('Oyun aktif değil.');
        }
        gameActive = false;
        message.channel.send(`Oyun sona erdi. Doğru sayı: ${randomNumber}.`);
    }

    // Rastgele boy tahmin etme
    if (message.content.startsWith('!kaccm')) {
        const user = message.author;
        const randomSize = Math.floor(Math.random() * 50) + 1; 

        const kaccmEmbed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle(`${user.username} Avatarı`)
            .setImage(user.displayAvatarURL({ dynamic: true, size: 1024 }))
            .addFields(
                { name: 'Penis boyu:', value: `${randomSize} cm`, inline: true }
            )
            .setTimestamp();

        message.channel.send({ embeds: [kaccmEmbed] });
    }

    // Anket başlatma
    if (message.content.startsWith('!poll')) {
        const question = message.content.split(' ').slice(1).join(' ');
        const pollEmbed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Anket')
            .setDescription(question)
            .setFooter({ text: 'Reaksiyonlar ile oy kullanın!' });

        message.channel.send({ embeds: [pollEmbed] }).then(sentMessage => {
            sentMessage.react('👍');
            sentMessage.react('👎');
        });
    }

    // Yardım komutu
    if (message.content === '!help') {
        const helpMessage = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Yardım Menüsü')
            .setDescription('Mevcut komutların listesi:')
            .addFields(
                { name: '!help', value: 'Bu yardım menüsünü gösterir' },
                { name: '!ping', value: 'Botun ping değerini gösterir' },
                { name: '!clear <sayı>', value: 'Belirtilen sayıda mesajı siler. (1-100 arası)' },
                { name: '!ascii <metin>', value: 'Verilen metni ASCII sanatına dönüştürür.' },
                { name: '!ban @kullanıcı', value: 'Belirtilen kullanıcıyı yasaklar. (Yalnızca adminler)', inline: true },
                { name: '!kick @kullanıcı', value: 'Belirtilen kullanıcıyı atar. (Yalnızca adminler)', inline: true },
                { name: '!lock', value: 'Bu kanalı kilitler. (Yalnızca adminler)', inline: true },
                { name: '!avatar @kullanıcı', value: 'Belirtilen kullanıcının avatarını gösterir.', inline: true },
                { name: '!startgame', value: 'Sayı tahmin etme oyununu başlatır.', inline: true },
                { name: '!guess [sayı]', value: 'Tahmininizi gönderin.', inline: true },
                { name: '!endgame', value: 'Oyunu sona erdirir.', inline: true },
                { name: '!kaccm', value: 'Kendi boyunu tahmin eder.', inline: true },
                { name: '!poll [soru]', value: 'Bir anket başlatır.', inline: true },
                { name: '!remindme [süre] [hatırlatıcı]', value: 'Belirtilen süre sonunda hatırlatır.', inline: true }
            )
            .setTimestamp();

        message.channel.send({ embeds: [helpMessage] });
    }

    // Ping komutu
    if (message.content === '!ping') {
        message.channel.send(`Ping: ${client.ws.ping}ms`);
    }

    // Mesaj silme
    if (message.content.startsWith('!clear')) {
        if (!isAdmin) {
            return message.channel.send('Bu komutu kullanma yetkiniz yok.');
        }
        const args = message.content.split(' ').slice(1);
        const amount = parseInt(args[0]);

        if (isNaN(amount) || amount < 1 || amount > 100) {
            return message.channel.send('1 ile 100 arasında bir sayı girin.');
        }

        await message.channel.bulkDelete(amount + 1)
            .catch(err => message.channel.send('Mesajları silme işlemi başarısız oldu.'));
    }

    // ASCII sanatı komutu
    if (message.content.startsWith('!ascii')) {
        const text = message.content.split(' ').slice(1).join(' ');
        figlet(text, (err, data) => {
            if (err) {
                console.error(err);
                return message.channel.send('Bir hata oluştu.');
            }
            message.channel.send('```' + data + '```');
        });
    }
});

client.login('YOUR_BOT_TOKEN');
