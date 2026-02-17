require('dotenv').config();
const express = require("express");
const { Bot, Keyboard, InputFile, webhookCallback } = require("grammy");
const fs = require("fs");
const path = require("path");
const multer = require('multer');

// --- SOZLAMALAR ---
const upload = multer({ dest: 'uploads/' });
const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3000;
const MAIN_ADMIN = Number(process.env.MAIN_ADMIN);
const bot = new Bot(process.env.BOT_TOKEN);

const USERS_FILE = "./users.json";

// Foydalanuvchi ma'lumotlar bazasini tekshirish
if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify({ private: [], groups: [] }));
}

// Admin holati (Xabar tarqatish uchun)
let isBroadcasting = false;

// --- YORDAMCHI FUNKSIYALAR ---

function registerUser(ctx) {
    try {
        const data = JSON.parse(fs.readFileSync(USERS_FILE));
        const chatId = ctx.chat.id;
        const isGroup = ctx.chat.type === "group" || ctx.chat.type === "supergroup";
        const targetKey = isGroup ? "groups" : "private";

        if (!data.private.includes(chatId) && !data.groups.includes(chatId)) {
            data[targetKey].push(chatId);
            fs.writeFileSync(USERS_FILE, JSON.stringify(data, null, 2));
        }
    } catch (e) {
        console.error("Registratsiyada xato:", e);
    }
}

async function sendSmartReply(ctx, photoPath, captionText) {
    try {
        if (fs.existsSync(photoPath)) {
            await ctx.replyWithPhoto(new InputFile(photoPath), {
                caption: captionText,
                parse_mode: "HTML"
            });
        } else {
            await ctx.reply(captionText, { parse_mode: "HTML" });
        }
    } catch (error) {
        await ctx.reply(captionText, { parse_mode: "HTML" });
    }
}

// --- MA'LUMOTLAR ---

const contactData = {
    "8-mart": "Mirmusayev Shaxzodbek Abdurashid o'g'li \n +998940341000",
    "Buston": "Abdurahatov Shoxrux Abdurashid o'g'li \n +998994631289",
    "Dorilfunun": "Ashurov Xasanbek Sayfiddin o'g'li \n +998944544411",
    "Lashkarak": "Mirzakarimov Bexzod Faxriddinovich \n +998999720860",
    "Samarchuq": "Qo'chqorov Sardor Sherzod o'g'li \n +998945187727",
    "Ulug'bek": "Rais: Hayitqulova Ra'no Abdulqosimova +998944260725 \n Hokim yordamchisi Eshmuratovna Dilfuza Erkinovna +998935247474 \n Yoshlar yetakchisi: Abduvahabova Barno Erkinjon qizi +99899081294 \n Profilaktika inspektori: Masidiqov Baxxrom Rustam o'g'li +998944168388 \n Ijtimoiy xodim: Aliboyeva Ozoda Ermatovna +998944064244 \n Soliq inspektori: Kasimov Bahodir Shavkat o'g'li +998900424024",
    "Xakkarman": "Azimjonov Olimjon Azimjon o'g'li \n +998992615111",
    "Bobotog'": "Muxitdinov Shoxruxbek To'lqinovich \n +998331777723",
    "Beruniy": "Rais: Zakirov Abduvohid Gafarovich +998993666715 \n Hokim yordamchisi: Tangirov Soxibjon Sobirjonovich +998938389983 \n Xotin-qizlar faoli: Ismoddinova Gulnoza G'ulomovna +998936041042 \n Yoshlar yetakchisi: Tadjiyev Aloviddin Shavkatovich +998936285010 \n Profilaktika inspektori: Shokirov Zoir Muxammad o'g'li +998990856998 \n Ijtimoiy xodim: Xasanova Mayna Olimovna +998998992669 \n Soliq inspektori: Urazmatov Diler Sobirjon o'g'li +998937177292",
    "Bog'i surh": "Arabova Mohira Karimovna \n +998931673777",
    "Chotqol": "Xayrullayev Durbek Ubaydulla o'g'li \n +998930050851",
    "Do'stlik": "Rustamova Ruxsora Sobirjon qizi \n +998943239503",
    "Go'zal": "Rais: Dushayeva Xurshida Mamatovna +998770684004 \n Hokim yordamchisi: Murodov Dilmurod Manazarovich +998933149000 \n Xotin-qizlar faoli: Jo'rayeva Komila Shodiyorovna +998939992808 \n Yoshlar yetakchisi: Abduqaxxarov Dilmurod Umarali o'g'li +998991713676 \n Profilaktika inspektori: Shodiyev Umar Samidjanovich +998931895722",
    "G'afur G'ulom": "Rais: Zakirova Gulchexra Hayitbayevna +998942186775 \n Hokim yordamchisi: Go'rog'liyev Bekmurod Sultonmurod og'li +998949909601 \n Xotin qizlar faoli: Mirzaliyeva Nargiza Ismailldjanovna +998944262216 \n Yoshlar yetakchisi: Yuldashaliyev Ixtiyar Baxtiyarovich +998900938600 \n Profilaktika inspektori: Yarkulov Sirojiddin Erkinboy o'g'li +998941649922 \n Ijtimoiy xodim: Isambayeva Muyassar Saparovna +998943603673 \n Soliq xodimi: Sanaqulov Ulug'bek To'ychi o'g'li +998909481212",
    "Grum": "Qarshiboyev Sanjar Abdug'ani o'g'li",
    "Gulbog'": "Abdumannobov Doston Davrom o'g'li \n +998940146144",
    "Gulzor": "Axmedov Islombek Baxodir o'g'li \n +998943141144",
    "Istiqbol": "Rais: Nishanova Maxmuda Xusanovna +998901747478 \n Hokim yordamchisi: Mirzamedov Sunnatullo Nematullayevich +998975988191 \n Xotin qizlar faoli: Tagayeva Kamola Mamatova +998931894006 \n Yoshlar yetakchisi: Sheraliyev Diyorbek Zafar o'g'li +998900084200 \n Profilaktika inspektori: Kurbanovv Abdulaziz Abdulxoshim o'g'li +998944998195 \n Soliq xodimi: Kosimov Baxodir Shavkat o'g'li +998990020665",
    "Istiqlol": "Akromjonov Temurmalik Akromjon o'g'li \n +998944041016",
    "Jigariston": "Rais: Babaraximova Mehriniso Shakirovna +998949321055 \n Hokim yordamchisi: Bakirov Azimjon Jamaljonovich +998936002086 \n Xotin-qizlar faoli: Abdurahmanova Shahlo Abdimuxtarovna +998936150982 \n Yoshlar yetakchisi: Uralov Husniddin Urazali o'g'li +998944246292 \n Profilaktika inspektori: Urazaliyev Shoxboz Sobir o'g'li +998943311993 \n Ijtimoiy xodim: Raimkulova Inobat Ziyayevna +998936043602 \n Soliq inspektori: Karimov Sardorbek Odiljon o'g'li +998931150098",
    "Karvon": "Boymatjonov Ahror Asqarjonovich \n +998945554045",
    "Kimyogar": "Mingboyev Ma'ruf Tolib o'g'li \n +998931690914",
    "Ko'k terak": "Axmedov Sulton Xasanboy O'gli \n +998990017144",
    "Maydon": "Rais: Mengliyev Ixtibor Maxmutalievna +998936075351 \n Hokim yordamchisi: Haitkulova Iroda Gulamovna +998930809001 \n Xotin qizlar faoli: Akbarxonova Irodaxon Tavobxonovna +998943679772 \n Yoshlar yetakchisi: Matqosimov Javlon Orifjonovich +998940383735 \n Profilaktika inspektori: Jumabaev Ravshann O'ktam o'g'li +998944867733 \n Ijtimoiy xodim: Maraximova Shoxista Abdusatarovna +998936668287 \n Soliq xodimi: Xatamov Ikramali Ismanalievich +998941706666",
    "Mustaqillik": "Qurbonqulov Umidjon Shuhrat o'g'li \n +998931873673",
    "Namuna": "Abdumalikov Sardor Murodjon o'g'li \n +998932829657",
    "Navbahor": "Saydraxmanov Doston Saidibroximovich \n +998990996116",
    "Navro'z-1": "Rais: Kaykieva Xafiza Salimovna +998994004333 \n Hokim yordamchisi: Usmanov Ikrom Israilovich +998944010113 \n Xotin qizlar faoli: Kukanova Iroda Baxtiyorovna +998978861225 \n Uralov Muhammadali Abdullajon o'g'li +998958661501 \n Profilaktika inspektori: Raimkulov Abdurasul Alisher o'g'li +998949578090 \n Ijtimoiy xodim: Nasrullayev Abdulaziz Abdumalikovich +998942178788 \n Soliq xodimi: Xamraqulov Abdurashid Saxobiddinovich +998946256575",
    "Nurchi": "Ashurboyev Asilbek Bahodiro'g'li \n +998936662124",
    "Obliq": "Nazmiddinxonov Zayniddinxon Baxodir o'g'li \n +998949323130",
    "Obod": "Rais: Eshmuratov Xusnutdin Mamataliyevich +998931723680 \n Hokim yordamchisi: Nurmatov Mansur Zoirovich +998937025251 \n Xotin qizlar faoli: Bekova Ra'no Abdunazarova +998998807782 \n Yoshlar yetakchisi: Madaminov Elyor Sherzod o'g'li +998909719717 \n Profilaktika inspektori: Sadikov Shodiyor Abduvaxob o'g'li +998944123264 \n Ijtimoiy xodim: Madasheva Navbahor Ergashbaevna +998949262097 \n Soliq xodimi: Kosimov Bahodir Shavkat o'g'li +998990020665",
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

// --- KEYBOARDLAR ---

const userKb = new Keyboard().text("📍 Mahallalar").row().text("ℹ️ Ma'lumot").resized();
const adminKb = new Keyboard().text("📍 Mahallalar").row().text("ℹ️ Ma'lumot").row().text("📊 Statistika").text("📢 Xabar tarqatish").resized();
const backBtn = "⬅️ Orqaga";

const malumotKb = new Keyboard()
    .text("📋 Yoshlar daftari").text("🛡 Temir daftar").row()
    .text("👥 Sardorlar yo'nalishi").text("🏛 Mahalla yettiligi").row()
    .text(backBtn).resized();

const sardorlarKb = new Keyboard()
    .text("⭐ Bosh sardor").text("📚 Ibrat farzandlari").row()
    .text("🤖 Ustoz AI").text("📖 Mutolaa").row()
    .text("🌳 Yashil makon").text("📺 Matbuot va media").row()
    .text("💡 Iqtidor").text("👩‍🎓 Qizlar akademiyasi").row()
    .text("🦾 Jasorat").row()
    .text(backBtn).resized();

const yettilikKb = new Keyboard()
    .text("👤 Mahalla raisi").text("💼 Hokim yordamchisi").row()
    .text("👩‍💼 Xotin-qizlar faoli").text("👔 Yoshlar yetakchisi").row()
    .text("👮 Profilaktika inspektori").text("🤝 Ijtimoiy xodim").row()
    .text("💰 Soliq inspektori").row()
    .text(backBtn).resized();

const mahallalarList = Object.keys(contactData).sort();
const makeMahallaKb = () => {
    const kb = new Keyboard();
    mahallalarList.forEach((m, i) => {
        kb.text(m);
        if ((i + 1) % 2 === 0) kb.row();
    });
    return kb.row().text(backBtn).resized();
};

// --- BOT KOMANDALARI VA ESHITUVCHILAR ---

bot.command("start", async (ctx) => {
    registerUser(ctx);
    const kb = ctx.from.id === MAIN_ADMIN ? adminKb : userKb;
    await ctx.reply("Xush kelibsiz! Kerakli bo'limni tanlang:", { reply_markup: kb });
});

bot.on("my_chat_member", (ctx) => {
    if (ctx.myChatMember.new_chat_member.status === "member") {
        registerUser(ctx);
    }
});

bot.hears("📍 Mahallalar", (ctx) => ctx.reply("Mahallani tanlang:", { reply_markup: makeMahallaKb() }));
bot.hears("ℹ️ Ma'lumot", (ctx) => ctx.reply("Ma'lumot turini tanlang:", { reply_markup: malumotKb }));
bot.hears("👥 Sardorlar yo'nalishi", (ctx) => ctx.reply("Loyihani tanlang:", { reply_markup: sardorlarKb }));
bot.hears("🏛 Mahalla yettiligi", (ctx) => ctx.reply("Lavozimni tanlang:", { reply_markup: yettilikKb }));
bot.hears(backBtn, (ctx) => {
    const kb = ctx.from.id === MAIN_ADMIN ? adminKb : userKb;
    ctx.reply("Asosiy menyu:", { reply_markup: kb });
});

// Mahallalar bo'yicha ma'lumot
bot.hears(mahallalarList, (ctx) => {
    const info = contactData[ctx.message.text];
    ctx.reply(`📍 <b>${ctx.message.text}</b> mahallasi mas'ullari:\n\n${info}`, { parse_mode: "HTML" });
});

// --- MA'LUMOT BO'LIMLARI ---

bot.hears("👤 Mahalla raisi", (ctx) => ctx.reply("<b>Mahalla raisi (Oqsoqol):</b>\n\nMahalla yettiligining rahbari. Umumiy ahvol va ijtimoiy-ma’naviy muhitga mas’ul.", { parse_mode: "HTML" }));
bot.hears("💼 Hokim yordamchisi", (ctx) => ctx.reply("<b>Hokim yordamchisi:</b>\n\nTadbirkorlikni rivojlantirish, aholi bandligi va kambag‘allikni qisqartirishga mas’ul.", { parse_mode: "HTML" }));
bot.hears("👔 Yoshlar yetakchisi", (ctx) => ctx.reply("<b>Yoshlar yetakchisi:</b>\n\n'Yoshlar daftari' va besh tashabbus tadbirlariga mas’ul.", { parse_mode: "HTML" }));
bot.hears("👩‍💼 Xotin-qizlar faoli", (ctx) => ctx.reply("<b>Xotin-qizlar faoli:</b>\n\nOila va xotin-qizlarni qo‘llab-quvvatlash, 'Ayollar daftari'ga mas’ul.", { parse_mode: "HTML" }));
bot.hears("👮 Profilaktika inspektori", (ctx) => ctx.reply("<b>Profilaktika inspektori:</b>\n\nJamoat tartibini saqlash va xavfsizlikka mas’ul.", { parse_mode: "HTML" }));
bot.hears("🤝 Ijtimoiy xodim", (ctx) => ctx.reply("<b>Ijtimoiy xodim:</b>\n\nNogironligi bor va ehtiyojmand qatlamga ijtimoiy xizmat ko'rsatishga mas'ul.", { parse_mode: "HTML" }));
bot.hears("💰 Soliq inspektori", (ctx) => ctx.reply("<b>Soliq inspektori:</b>\n\nSoliq bazasini kengaytirish va tadbirkorlarga ko'maklashishga mas'ul.", { parse_mode: "HTML" }));

bot.hears("📋 Yoshlar daftari", (ctx) => ctx.reply("<b>📋 Yoshlar daftari:</b>\n\nModdiy yordam, subsidiya va ijtimoiy himoyaga muhtoj yoshlar tizimi.", { parse_mode: "HTML" }));
bot.hears("🛡 Temir daftar", (ctx) => ctx.reply("<b>🛡 Temir daftar:</b>\n\nKam ta'minlangan oilalarni qo'llab-quvvatlash tizimi.", { parse_mode: "HTML" }));

// --- SARDORLAR YO'NALISHI ---

bot.hears("⭐ Bosh sardor", (ctx) => sendSmartReply(ctx, "./public/bosh_sardor.png", "<b>Mahalla Bosh sardori:</b>\n\nYoshlar yetakchisining asosiy ko'makchisi."));
bot.hears("📚 Ibrat farzandlari", (ctx) => sendSmartReply(ctx, "./public/ibrat.png", "<b>Ibrat Farzandlari:</b>\n\nTillar o'rganish loyihasi."));
bot.hears("🤖 Ustoz AI", (ctx) => sendSmartReply(ctx, "./public/ustozai.png", "<b>Ustoz AI:</b>\n\nZamonaviy kasblar platformasi."));
bot.hears("📖 Mutolaa", (ctx) => sendSmartReply(ctx, "./public/mutolaa.png", "<b>Mutolaa:</b>\n\nKitobxonlikni targ‘ib qiluvchi loyiha."));
bot.hears("🌳 Yashil makon", (ctx) => sendSmartReply(ctx, "./public/yashil_makon.png", "<b>Yashil makon:</b>\n\nKo‘kalamzorlashtirish tashabbusi."));
bot.hears("📺 Matbuot va media", (ctx) => sendSmartReply(ctx, "./public/media.png", "<b>Matbuot va media sardori:</b>\n\nYangiliklarni yorituvchi mobil muxbir."));
bot.hears("💡 Iqtidor", (ctx) => sendSmartReply(ctx, "./public/iqtidor.png", "<b>Iqtidor:</b>\n\nYoshlarni kashf etish yo‘nalishi."));
bot.hears("👩‍🎓 Qizlar akademiyasi", (ctx) => sendSmartReply(ctx, "./public/qizlar.png", "<b>Qizlar akademiyasi:</b>\n\nQizlarni bilimga yo‘naltirish loyihasi."));
bot.hears("🦾 Jasorat", (ctx) => sendSmartReply(ctx, "./public/jasorat.png", "<b>Jasorat:</b>\n\nVatanparvarlik yo‘nalishi."));

// --- ADMIN FUNKSIYALARI ---

bot.hears("📊 Statistika", (ctx) => {
    if (ctx.from.id !== MAIN_ADMIN) return;
    const data = JSON.parse(fs.readFileSync(USERS_FILE));
    const total = data.private.length + data.groups.length;
    ctx.reply(`📊 <b>Statistika:</b>\n\n👤 Shaxsiy: ${data.private.length}\n👥 Guruhlar: ${data.groups.length}\n🏁 Jami: ${total}`, { parse_mode: "HTML" });
});

bot.hears("📢 Xabar tarqatish", (ctx) => {
    if (ctx.from.id !== MAIN_ADMIN) return;
    isBroadcasting = true;
    ctx.reply("📢 Xabarni yuboring (Text, Rasm, Video).\nBekor qilish uchun /cancel");
});

// Xabar tarqatish mantiqi
bot.on("message", async (ctx, next) => {
    if (ctx.from.id !== MAIN_ADMIN || !isBroadcasting) return next();

    if (ctx.message.text === "/cancel") {
        isBroadcasting = false;
        return ctx.reply("❌ Bekor qilindi.");
    }

    const data = JSON.parse(fs.readFileSync(USERS_FILE));
    const allUsers = [...data.private, ...data.groups];
    isBroadcasting = false;

    await ctx.reply(`⏳ ${allUsers.length} ta manzilga yuborilmoqda...`);

    let count = 0;
    for (const id of allUsers) {
        try {
            await new Promise(res => setTimeout(res, 50)); // Spam-filterdan qochish
            await bot.api.copyMessage(id, ctx.from.id, ctx.message.id);
            count++;
        } catch (e) {
            console.log(`${id} ga yuborilmadi.`);
        }
    }
    await ctx.reply(`✅ Jarayon tugadi. ${count} foydalanuvchiga yetib bordi.`);
});

// --- WEB API ---

app.post('/api/murojaat', upload.single('file'), async (req, res) => {
    try {
        const { fullname, phone, text, mahalla } = req.body;
        const log = `📝 <b>Yangi Murojaat!</b>\n\n👤: ${fullname}\n📞: ${phone}\n📍: ${mahalla}\n💬: ${text}`;
        
        if (req.file) {
            const filePath = path.resolve(req.file.path);
            const inputFile = new InputFile(filePath);
            
            if (req.file.mimetype.startsWith('image/')) {
                await bot.api.sendPhoto(MAIN_ADMIN, inputFile, { caption: log, parse_mode: "HTML" });
            } else if (req.file.mimetype.startsWith('video/')) {
                await bot.api.sendVideo(MAIN_ADMIN, inputFile, { caption: log, parse_mode: "HTML" });
            } else {
                await bot.api.sendDocument(MAIN_ADMIN, inputFile, { caption: log, parse_mode: "HTML" });
            }
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        } else {
            await bot.api.sendMessage(MAIN_ADMIN, log, { parse_mode: "HTML" });
        }
        res.json({ ok: true });
    } catch (e) {
        res.status(500).json({ ok: false });
    }
});

app.use("/webhook", webhookCallback(bot, "express"));
app.listen(PORT, "0.0.0.0", () => console.log(`✅ Server ${PORT} portda faol!`));
