require('dotenv').config();
const express = require("express");
const { Bot, Keyboard, InputFile, webhookCallback } = require("grammy");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000; 

const MAIN_ADMIN = Number(process.env.MAIN_ADMIN);
const PROMO_ADMIN = Number(process.env.PROMO_ADMIN);
const ADMIN = Number(process.env.ADMIN);
const ADMINS = [MAIN_ADMIN, PROMO_ADMIN, ADMIN];
const LOG_GROUP_ID = Number(process.env.LOG_GROUP_ID); 

const bot = new Bot(process.env.BOT_TOKEN);

bot.catch((err) => {
    console.error(`Error in middleware:`, err.error);
});

const USERS_FILE = "./users.json";
const CHATS_FILE = "./chats.json";
const WARNS_FILE = "./warns.json";
const LAST_MSG_FILE = "./last_messages.json";

const initFile = (path, initialData) => {
    if (!fs.existsSync(path)) fs.writeFileSync(path, JSON.stringify(initialData));
};

initFile(USERS_FILE, []);
initFile(CHATS_FILE, []);
initFile(WARNS_FILE, {});
initFile(LAST_MSG_FILE, {});

const readJson = (path, fallback) => {
    try {
        const data = fs.readFileSync(path, "utf8");
        return JSON.parse(data || JSON.stringify(fallback));
    } catch (e) { return fallback; }
};

let userDatabase = new Set((readJson(USERS_FILE, []) || []).map(Number));
let chatDatabase = new Set((readJson(CHATS_FILE, []) || []).map(Number));
let warns = readJson(WARNS_FILE, {});
let lastMessages = readJson(LAST_MSG_FILE, {});

const saveData = () => {
    fs.writeFileSync(USERS_FILE, JSON.stringify(Array.from(userDatabase)));
    fs.writeFileSync(CHATS_FILE, JSON.stringify(Array.from(chatDatabase)));
    fs.writeFileSync(WARNS_FILE, JSON.stringify(warns));
    fs.writeFileSync(LAST_MSG_FILE, JSON.stringify(lastMessages));
};

const userKeyboard = new Keyboard().text("Mahallalar").text("Ma'lumot").resized();
const adminKeyboard = new Keyboard().text("Mahallalar").text("Ma'lumot").row().text("📊 Statistika").text("⚠️ Ogohlantirishlar").row().text("📢 Yangilik").resized();

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
    .text("Yoshlik").row().text("⬅️ Orqaga").resized();

const haqidaKeyboard = new Keyboard().text("Yoshlar daftari").row().text("Volontyorlik").row().text("Loyihalar").row().text("Mahalla yettiligi").row().text("⬅️ Orqaga").resized();
const mahallayYettiligiKB = new Keyboard()
    .text("Rais").row()
    .text("Hokim yordamchisi").row()
    .text("Yoshlar yetakchisi").row()
    .text("Xotin-qizlar faoli").row()
    .text("Soliq inspektori").row()
    .text("Profilaktika inspektori").row()
    .text("Ijtimoiy xodim").row()
    .text("⬅️ Orqaga").resized();

const loyihalarKB = new Keyboard().text("Ibrat Farzandlari").row().text("Ustoz AI").row().text("Mutolaa").row().text("Yashil makon").row().text("Iqtidor").row().text("Jasorat").row().text("Qizlar akademiyasi").row().text("Matbuot va media").row().text("⬅️ Orqaga").resized();

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
    "Go'zal": " Abduqaxxarov Dilmurod Umarali o'g'li \n +998991713676 ",
    "G'afur G'ulom": "Yuldashaliyev Ixtiyar Baxtiyarovich \n +998900938600",
    "Grum": "Qarshiboyev Sanjar Abdug'ani o'g'li",
    "Gulbog'": "Abdumannobov Doston Davrom o'g'li \n +998940146144",
    "Gulzor": "Axmedov Islombek Baxodir o'g'li \n +998943141144",
    "Istiqbol": " Sheraliyev Diyorbek Zafar o'g'li \n +998900084200",
    "Istiqlol": "Akromjonov Temurmalik Akromjon o'g'li \n +998944041016",
    "Jigariston": "Uralov Husniddin Urazali o'g'li \n +998944246292",
    "Karvon": "Boymatjonov Ahror Asqarjonovich \n +998945554045",
    "Kimyogar": "Mingboyev Ma'ruf Tolib o'g'li \n +998931690914",
    "Ko'k terak": "Axmedov Sulton Xasanboy O'gli \n +998990017144",
    "Maydon": "Matqosimov Javlon Orifjonovich \n +998940383735",
    "Mustaqillik": "Qurbonqulov Umidjon Shuhrat o'g'li \n +998931873673",
    "Namuna": "Abdumalikov Sardor Murodjon o'g'li \n +998932829657",
    "Navbahor": "Saydraxmanov Doston Saidibroximovich \n +998990996116",
    "Navro'z-1": "Uralov Muhammadali Abdullajon o'g'li \n",
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

const haqidaMenu = {
    "Yoshlar daftari": "O'zbekiston qonunchiligiga ko'ra, 14 yoshdan 30 yoshgacha bo'lgan fuqarolar kiritiladi.",
    "Volontyorlik": "Volontyorlik - jamiyat manfaati uchun ko'ngilli xizmat qilishdir.",
};

const loyihalarHaqida = {
    "Ibrat Farzandlari": { img: "./ibrat.png", info: "Ibrat Farzandlari - xorijiy tillarni onlayn o'rganish platformasi.\nLink: https://play.google.com/store/apps/details?id=uz.ibrat.farzandlari" },
    "Ustoz AI": { img: "./ustozai.png", info: "Ustoz AI - zamonaviy kasblarni o'rganish platformasi.\nLink: https://play.google.com/store/apps/details?id=uz.uztozedu.ustozai" },
    "Mutolaa": { img: "./mutolaa.png", info: "Mutolaa - onlayn kutubxonani o'z ichiga olgan kitobxonlik loyihasi.\nLink: https://play.google.com/store/apps/details?id=uz.mutolaa.commercial.mutolaa" },
    "Yashil makon": { img: "./yashilmakon.png", info: "Yashil makon - ekologiyani asrash uchun ishlab chiqilgan loyiha." },
    "Iqtidor": { img: "./iqtidor.png", info: "Iqtidor - iste'dodli yoshlarni aniqlash va qo'llash loyihasi." },
    "Jasorat": { info: "Jasorat - liderlik va vatanparvarlik loyihasi." },
    "Qizlar akademiyasi": { img: "./qizlarakademiyasi.png", info: "Qizlar akademiyasi - STEM va kasb-hunar loyihasi." },
    "Matbuot va media": { info: "Matbuot va media - jurnalistika va media treninglari." }
};

const mahallalar7 = {
    "Rais": "Ehtiyojmand oilalarga uy-joyini yaxshilashga ko‘maklashish, mahallaning umumiy ahvolini nazorat qilish.",
    "Hokim yordamchisi": "Ishsiz fuqarolarga ish topishda yordam ko‘rsatish, bandlik masalalarini hal qilish.",
    "Yoshlar yetakchisi": "Yoshlarni sport, musiqa va turli to‘garaklarga jalb qilish orqali bo‘sh vaqtni mazmunli o‘tkazishni ta’minlash.",
    "Xotin-qizlar faoli": "Ayollarni tadbirkorlik, kasanachilik va hunarmandchilikka jalb qilish orqali ularning iqtisodiy ahvolini yaxshilash.",
    "Profilaktika inspektori": "Mahallada huquqbuzarliklarning oldini olish, jamoat tartibini saqlash va fuqarolar xavfsizligini ta’minlash.",
    "Soliq inspektori": "Soliq bazasini kengaytirish, tadbirkorlik faoliyatini qonuniylashtirish va o‘zini o‘zi band qilganlarni kichik biznes toifasiga o‘tkazishga ko‘maklashish.",
    "Ijtimoiy xodim": "Yolg‘iz keksalar, nogironlar va boshqa muhtojlarga ijtimoiy xizmat ko‘rsatish bilan shug‘ullanish."
};

bot.command("start", async (ctx) => {
    const userId = ctx.from.id;
    userDatabase.add(userId);
    saveData();
    const kb = ADMINS.includes(userId) ? adminKeyboard : userKeyboard;
    await ctx.reply("Assalomu alaykum, " + ctx.from.first_name + "!", { reply_markup: kb });
});

bot.command("send", async (ctx) => {
    if (!ADMINS.includes(ctx.from.id)) return;
    const rep = ctx.message.reply_to_message;
    if (!rep) return ctx.reply("Xabarga reply qiling!");
    const targets = [...new Set([...userDatabase, ...chatDatabase])];
    let ok = 0;
    for (const tid of targets) {
        try { await bot.api.copyMessage(tid, ctx.chat.id, rep.message_id); ok++; } catch (e) {}
    }
    await ctx.reply("✅ Yetkazildi: " + ok);
});

bot.on("message", async (ctx) => {
    if (!ctx.from) return;
    const userId = ctx.from.id;
    const text = ctx.message.text || "";
    const isAdmin = ADMINS.includes(userId);

    if (ctx.chat.type !== "private") {
        let isSpam = false;
        let reason = "";
        const document = ctx.message.document;

        if (text && /(https?:\/\/[^\s]+|t\.me\/[^\s]+)/i.test(text)) { 
            isSpam = true; reason = "Reklama tarqatish"; 
        } 
        else if (document && document.file_name && document.file_name.toLowerCase().endsWith(".apk")) { 
            isSpam = true; reason = "APK fayl yuborish"; 
        }

        if (isSpam) {
            const member = await ctx.getChatMember(userId);
            const isGroupAdmin = ["administrator", "creator"].includes(member.status);
            if (!isGroupAdmin) {
                warns[userId] = (warns[userId] || 0) + 1;
                saveData();
                await ctx.deleteMessage().catch(() => {});
                const logMsg = `🛡 <b>Xavfsizlik tizimi:</b>\n\n👤 Foydalanuvchi: ${ctx.from.first_name}\n🆔 ID: <code>${userId}</code>\n⚠️ Sabab: ${reason}\n📈 Jami ogohlantirishlar: ${warns[userId]}\n📍 Guruh: ${ctx.chat.title}`;
                await bot.api.sendMessage(LOG_GROUP_ID, logMsg, { parse_mode: "HTML" }).catch(() => {});
                return ctx.reply(`⚠️ ${ctx.from.first_name}, ${reason} taqiqlangan! (Ogohlantirish: ${warns[userId]})`);
            }
        }
        return; 
    }

    if (text === "⬅️ Orqaga") {
        const kb = isAdmin ? adminKeyboard : userKeyboard;
        return ctx.reply("Asosiy menyu.", { reply_markup: kb });
    }
    if (text === "Mahallalar") return ctx.reply("Mahallani tanlang:", { reply_markup: mahallalar });
    if (text === "Ma'lumot") return ctx.reply("Bo'limni tanlang:", { reply_markup: haqidaKeyboard });
    if (text === "Loyihalar") return ctx.reply("Loyihani tanlang:", { reply_markup: loyihalarKB });
    if (text === "Mahalla yettiligi") return ctx.reply("Yettilik a'zosini tanlang:", { reply_markup: mahallayYettiligiKB });

    if (contactData[text]) return ctx.reply(contactData[text]);
    if (haqidaMenu[text]) return ctx.reply(haqidaMenu[text]);
    if (mahallalar7[text]) return ctx.reply(mahallalar7[text]);
    
    if (loyihalarHaqida[text]) {
        const p = loyihalarHaqida[text];
        if (p.img && fs.existsSync(p.img)) {
            return ctx.replyWithPhoto(new InputFile(p.img), { caption: p.info });
        }
        return ctx.reply(p.info);
    }

    if (isAdmin) {
        if (text === "📊 Statistika") return ctx.reply("👤 Userlar: " + userDatabase.size + "\n👥 Guruhlar: " + chatDatabase.size);
        if (text === "⚠️ Ogohlantirishlar") return ctx.reply("⚠️ Warns ro'yxati: " + JSON.stringify(warns, null, 2));
    }
});

app.use(express.json());
app.use("/webhook", webhookCallback(bot, "express"));

app.listen(PORT, "0.0.0.0", async () => {
    console.log(`✅ Server running on port ${PORT}`);
    try {
        const domain = "https://telebot-15k8.onrender.com"; 
        await bot.api.setWebhook(`${domain}/webhook`, {
            drop_pending_updates: true,
            allowed_updates: ["message", "callback_query", "chat_member"]
        });
        console.log(`🚀 Webhook set to ${domain}/webhook`);
    } catch (err) {
        console.error("❌ Webhook setup error:", err);
    }
});

