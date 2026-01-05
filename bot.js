const express = require("express"); 
const { Bot, Keyboard } = require("grammy");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Bot is running...');
});

app.listen(PORT, () => {
    console.log(`Web server portda ishga tushdi: ${PORT}`);
});

// --- KONFIGURATSIYA ---
const MAIN_ADMIN = 6235292618; 
const PROMO_ADMIN = 624184607; 
const ADMIN = 1202479635;
const ADMINS = [MAIN_ADMIN, PROMO_ADMIN, ADMIN];
const LOG_GROUP_ID = -1001234567890; // SHU YERGA LOG GURUHI ID'SINI YOZING

const bot = new Bot("7196410668:AAE7H7dNMZ_dTDYapSb0JJlIXHqKEbVcENg");

const USERS_FILE = "./users.json";
const CHATS_FILE = "./chats.json";
const WARNS_FILE = "./warns.json";

const initFile = (path, initialData) => {
    if (!fs.existsSync(path)) fs.writeFileSync(path, JSON.stringify(initialData));
};
initFile(USERS_FILE, []);
initFile(CHATS_FILE, []);
initFile(WARNS_FILE, {});

let userDatabase = new Set(JSON.parse(fs.readFileSync(USERS_FILE)));
let chatDatabase = new Set(JSON.parse(fs.readFileSync(CHATS_FILE)));
let warns = JSON.parse(fs.readFileSync(WARNS_FILE));

const saveData = () => {
    fs.writeFileSync(USERS_FILE, JSON.stringify(Array.from(userDatabase)));
    fs.writeFileSync(CHATS_FILE, JSON.stringify(Array.from(chatDatabase)));
    fs.writeFileSync(WARNS_FILE, JSON.stringify(warns));
};

// --- KLAVIATURALAR ---
const userKeyboard = new Keyboard().text("Yordam").text("Haqida").resized();
const adminKeyboard = new Keyboard()
    .text("Yordam").text("Haqida").row()
    .text("📊 Statistika").text("⚠️ Ogohlantirishlar").row()
    .text("📢 Yangilik").resized();

const mahallalar = new Keyboard()
    .text("8-mart").text("Buston").row()
    .text("Dorilfunun").text("Lashkarak").row()
    .text("Samarchuq").text("Ulug'bek").row()
    .text("Xakkarman").text("Bobotog'").row()
    .text("Beruniy").text("Bog'i surh").row()
    .text("Chotqol").text("Do'stlik").row()
    .text("Go'zal").text("G'afur G'ulom").row()
    .text("Grum").text("Gulbog'").row()
    .text("Gulzor").text("Istiqbol").row()
    .text("Istiqlol").text("Jigariston").row()
    .text("Karvon").text("Kimyogar").row()
    .text("Ko'k terak").text("Maydon").row()
    .text("Mustaqillik").text("Namuna").row()
    .text("Navbahor").text("Navro'z-1").row()
    .text("Nurchi").text("Obliq").row()
    .text("Obod").text("Oppartak").row()
    .text("Ozodlik").text("Qorabog'").row()
    .text("Sog'lom").text("Taraqqiyot").row()
    .text("YABS").text("Yangi go'shtsoy").row()
    .text("Yangi hayot").text("Yangiobod").row()
    .text("Yoshlik").resized();

bot.command("start", async (ctx) => {
    const userId = ctx.from.id;
    if (ctx.chat.type === "private") {
        userDatabase.add(userId);
        saveData();
        const keyboard = ADMINS.includes(userId) ? adminKeyboard : userKeyboard;
        await ctx.reply(`Assalomu alaykum, ${ctx.from.first_name}, botga xush kelibsiz!`, { reply_markup: keyboard });
    } else {
        chatDatabase.add(ctx.chat.id);
        saveData();
        await ctx.reply("Bot guruhda faol! 🛡️");
    }
});

bot.command("send", async (ctx) => {
    if (!ADMINS.includes(ctx.from.id)) return;
    const rep = ctx.message.reply_to_message;
    if (!rep) return ctx.reply("❌ Xabarga reply qiling!");

    const targets = [...new Set([...userDatabase, ...chatDatabase])];
    await ctx.reply(`⏳ ${targets.length} ta manzilga yuborish boshlandi...`);

    let ok = 0;
    for (const tid of targets) {
        try {
            await bot.api.copyMessage(tid, ctx.chat.id, rep.message_id);
            ok++;
            if (ok % 25 === 0) await new Promise(r => setTimeout(r, 1000));
        } catch (e) {
            userDatabase.delete(tid);
            chatDatabase.delete(tid);
        }
    }
    saveData(); 
    await ctx.reply(`✅ Jarayon yakunlandi: ${ok} ta joyga yetkazildi.`);
});

bot.on("message", async (ctx) => {
    const userId = ctx.from.id;
    const text = ctx.message.text || ctx.message.caption || "";
    const document = ctx.message.document; 
    const isAdmin = ADMINS.includes(userId);

    if (ctx.chat.type !== "private") {
        let isSpam = false;
        let reason = "";

        if (text && /(https?:\/\/[^\s]+|t\.me\/[^\s]+)/i.test(text)) {
            isSpam = true; reason = "Reklama/Havola";
        }
        if (document && document.file_name?.toLowerCase().endsWith(".apk")) {
            isSpam = true; reason = "APK fayl";
        }

        if (isSpam && !isAdmin) {
            const member = await ctx.getChatMember(userId);
            if (!["administrator", "creator"].includes(member.status)) {
                warns[userId] = (warns[userId] || 0) + 1;
                saveData();

                await ctx.deleteMessage().catch(() => {});
                
                await ctx.reply(`⚠️ ${ctx.from.first_name}, guruhda ${reason} yuborish taqiqlangan! (Ogohlantirish: ${warns[userId]})`);

                const logText = `🚨 **Qoidabuzarlik aniqlandi!**\n\n👤 **User:** ${ctx.from.first_name}\n🆔 **ID:** \`${userId}\`\n📂 **Sabab:** ${reason}\n🔢 **Jami ogohlantirishlar:** ${warns[userId]}\n📍 **Guruh:** ${ctx.chat.title}`;
                await bot.api.sendMessage(LOG_GROUP_ID, logText).catch(e => console.log("Log guruhiga xabar ketmadi."));
                return;
            }
        }
        return; 
    }

    if (isAdmin) {
        if (text === "📊 Statistika") {
            return ctx.reply(`📈 **Statistika:**\n👤 Foydalanuvchilar: ${userDatabase.size}\n👥 Guruhlar: ${chatDatabase.size}`);
        }
        if (text === "⚠️ Ogohlantirishlar") {
            let warnList = "📋 **Ogohlantirish olganlar:**\n\n";
            const entries = Object.entries(warns);
            if (entries.length === 0) {
                warnList += "Hozircha hech kimda ogohlantirish yo'q.";
            } else {
                entries.forEach(([id, count]) => {
                    warnList += `👤 ID: \`${id}\` — ⚠️ **${count} marta**\n`;
                });
            }
            return ctx.reply(warnList, { parse_mode: "Markdown" });
        }
        if (text === "📢 Yangilik") {
            return ctx.reply("📢 Xabarga **Reply** qilib `/send` deb yozing.");
        }
    }

    if (text === "Yordam") {
        return ctx.reply("🆘 Mahallani tanlang.", { reply_markup: mahallalar });
    }
    if (text === "Haqida") {
        return ctx.reply("🤖 Bu bot Angren shahar Yoshlar ishlari agentligi tomonidan tayyorlandi.");
    }

    const contactData = {
        "8-mart": "Mirmusayev Shaxzodbek Abdurashid o'g'li \n +998940341000",
        "Buston": "Abdurahatov Shoxrux Abdurashid o'g'li \n +998994631289",
        "Dorilfunun": "Ashurov Xasanbek Sayfiddin o'g'li \n +998944544411",
        "Lashkarak": "Mirzakarimov Bexzod Faxriddinovich \n +998999720860",
        "Samarchuq": "Qo'chqorov Sardor Sherzod o'g'li \n +998945187727",
        "Ulug'bek": "Abduvahabova Barno Erkinjon qizi \n +998999081294",
        "Xakkarman": "Azimjonov Olimjon Azimjon o'g'li \n +998992615111",
        "Bobotog'": "Muxitdinov Shoxruxbek To'lqinovich \n +998331777723",
        "Beruniy": "Tadjiyev Aloviddin Shavkatovich \n +998936285010",
        "Bog'i surh": "Arabova Mohira Karimovna \n +998931673777",
        "Chotqol": "Xayrullayev Durbek Ubaydulla o'g'li \n +998930050851",
        "Do'stlik": "Rustamova Ruxsora Sobirjon qizi \n +998943239503",
        "Go'zal": "Abduqaxxarov Dilmurod Umarali o'g'li \n +998991713676",
        "G'afur G'ulom": "Yuldashaliyev Ixtiyar Baxtiyarovich \n +998900938600",
        "Grum": "Qarshiboyev Sanjar Abdug'ani o'g'li",
        "Gulbog'": "Abdumannobov Doston Davrom o'g'li \n +998940146144",
        "Gulzor": "Axmedov Islombek Baxodir o'g'li \n +998943141144",
        "Istiqbol": "Sheraliyev Diyorbek Zafar o'g'li \n +998900084200",
        "Istiqlol": "Akromjonov Temurmalik Akromjon o'g'li \n +998944041016",
        "Jigariston": "Uralov Husniddin Urazali o'g'li \n +998944246292",
        "Karvon": "Boymatjonov Ahror Asqarjonovich \n +998945554045",
        "Kimyogar": "Mingboyev Ma'ruf Tolib o'g'li \n +998931690914",
        "Ko'k terak": "Axmedov Sulton Xasanboy O'gli \n +998990017144",
        "Maydon": "Matqosimov Javlon Orifjonovich \n +998940383735",
        "Mustaqillik": "Qurbonqulov Umidjon Shuhrat o'g'li \n +998931873673",
        "Namuna": "Abdumalikov Sardor Murodjon o'g'li \n +998932829657",
        "Navbahor": "Saydraxmanov Doston Saidibroximovich \n +998990996116",
        "Navro'z-1": "Uralov Muhammadali Abdullajon o'g'li \n +998958661501",
        "Nurchi": "Ashurboyev Asilbek Bahodiro'g'li \n +998936662124",
        "Obliq": "Nazmiddinxonov Zayniddinxon Baxodir o'g'li \n +998949323130",
        "Obod": "Madaminov Elyor Sherzod o'g'li \n +998909719717",
        "Oppartak": "Siddikov Samandar Xamroqulovich \n +998949444740",
        "Ozodlik": "Quvonov Ixtiyor Ilxamitdinovich \n +998943632334",
        "Qorabog'": "Umirzakov Axror Abdumannop o'g'li \n +998949265401",
        "Sog'lom": "Matxoliqov Javlon Jumaboy o'g'li +998931738419",
        "Taraqqiyot": "Roxatillayev Sherzodbek Farxod o'g'li \n +998936273815",
        "YABS": "Axmedov Jahongir Mamasoli o'g'li \n +998949253675",
        "Yangi go'shtsoy": "Mamasodikov Doston Dilshod o'g'li \n +998997259299",
        "Yangi hayot": "Jamolov Avazbek Azimjon o'g'li \n +998885449898",
        "Yangiobod": "Barkinov Farrux Xayrulla o'g'li \n +998991074167",
        "Yoshlik": "Chorshanbiyev Qudrat Alisherovich \n +998936004294"
    };

    if (contactData[text]) {
        return ctx.reply(contactData[text]);
    }
});

bot.catch((err) => console.error("Xatolik yuz berdi:", err));

bot.start();
console.log("Bot Angren loyihasi uchun ishga tushirildi...");
