const express = require("express"); 
const { Bot, Keyboard, InputFile } = require("grammy");
const fs = require("fs");
const { info } = require("console");

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Bot is running...');
});

app.listen(PORT, () => {
    console.log(`Web server portda ishga tushdi: ${PORT}`);
});

const MAIN_ADMIN = 6235292618; 
const PROMO_ADMIN = 624184607; 
const ADMIN = 1202479635;
const ADMINS = [MAIN_ADMIN, PROMO_ADMIN, ADMIN];
const LOG_GROUP_ID = 5132818564; 

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

const readJson = (path, fallback) => {
    try {
        const data = fs.readFileSync(path, "utf8");
        return JSON.parse(data || JSON.stringify(fallback));
    } catch (e) {
        return fallback;
    }
};

let userDatabase = new Set((readJson(USERS_FILE, []) || []).map(Number));
let chatDatabase = new Set((readJson(CHATS_FILE, []) || []).map(Number));
let warns = readJson(WARNS_FILE, {});

const saveData = () => {
    fs.writeFileSync(USERS_FILE, JSON.stringify(Array.from(userDatabase)));
    fs.writeFileSync(CHATS_FILE, JSON.stringify(Array.from(chatDatabase)));
    fs.writeFileSync(WARNS_FILE, JSON.stringify(warns));
};

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
    .text("Yoshlik").row()
    .text("⬅️ Orqaga").resized(); 

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

const haqidaKeyboard = new Keyboard().text("Yoshlar daftari").row().text("Volontyorlik").row().text("Loyihalar").row().text("⬅️ Orqaga").resized();

const haqidaMenu = {
    "Yoshlar daftari": "O'zbekiston qonunchiligiga ko'ra, 14 yoshga to'lgan va 30 yoshdan oshmagan (31 yoshga to'lmagan) fuqarolar **Yoshlar daftari** ga kiritilish huquqiga ega. Ushbu yosh toifasidagi fuqarolar jamg'arma mablag'lari hisobidan qo'llab-quvvatlanadi. Mazkur tashabbus yoshlarning ijtimoiy-iqtisodiy muammolarini hal etish va ularning turmush sifatini oshirishga qaratilgan. \n \n **Qo'llab quvvatlash turlari** \n • Yoshlarning bandligini ta'minlash \n  • Tadbirkorlikka jalb qilish \n • Xorijda xavfsiz mehnat migratsiyasini tashkil etish \n \n **Kasb-hunarga o'qitish: \n •Kasb-hunar o'rgatish orqali yoshlarni ish bilan ta'minlash. \n • Tadbirkorlik tashabbuslarini qo'llab-quvvatlash. \n \n **Ta'lim xarajatlarini qoplash:** \n • Ta'lim xarajatlarini qoplash uchun subsidiya ajratish. \n • Haydovchilik o'quv kurslari xarajatlarini qoplash. \n \n **Moddiy yordam:** \n •Og'ir moddiy ahvoldagi yoshlarga bir martalik yordam ko'rsatish. \n \n **Iqtidorli yoshlarni qo'llab-quvvatlash:** \n  • Ilm-fan, sport, san'at va madaniyat sohalaridagi tashabbuslarni rivojlantirish uchun subsidiyalar.",
    "Volontyorlik": "Volontyorlik (faoliyati) - bu biror inson o'z xohishi bilan vaqti va mehnatini qandaydir jamoat ishiga, ko'p hollarda hech moddiy foydasiz yordam berishi. Ya'ni volontyorlik faoliyati bilan shug'ullanishda Siz ko'ngilli ravishda o'z vaqtingiz va kuchingizni qandaydir ijtimoiy ishlarni amalga oshirishga sarflaysiz. "
};

const loyihalar = new Keyboard().text("Ibrat Farzandlari").row().text("Ustoz AI").row().text("Mutolaa").row().text("Yashil makon").row().text("Iqtidor").row().text("Jasorat").row().text("Qizlar akademiyasi").row().text("Matbuot va media").text("⬅️ Orqaga").resized();

const loyihalarHaqida = {
    "Ibrat Farzandlari" : {
        img: "./ibrat.png",
        info: "Ibrat Farzandlari - bu xorijiy tillarni onlayn tarzda o'rganish uchun mo'ljallangan platforma bo'lib, u foydalanuvchilarga interaktiv darslar, testlar va amaliy mashqlar orqali til ko'nikmalarini rivojlantirish imkoniyatini taqdim etadi. \n Ilovani yuklab olish: https://play.google.com/store/apps/details?id=uz.ibrat.farzandlari&hl=en \n https://apps.apple.com/tj/app/ibrat-academy/id6447472950"
    } ,
    "Ustoz AI" : {
        img: "./ustozai.png",
        info: "Ustoz AI - zamonaviy kasblarni o'rganishga qaratilgan ta'lim platformasi bo'lib, u o'quvchilarga individual yondashuv orqali bilim olish imkoniyatini taqdim etadi. \n Ilovani yuklab olish: https://play.google.com/store/apps/details?id=uz.uztozedu.ustozai&hl=en \n https://apps.apple.com/us/app/ustoz-ai/id6504815934"
    },
    "Mutolaa" : {
        img: "./mutolaa.png",
        info: "Mutolaa - bu yoshlarni kitob o'qishga rag'batlantirish va ularning bilim doirasini kengaytirishga qaratilgan loyiha bo'lib, unda turli janrlardagi kitoblarning onlayn kutubxonasi hisoblanadi. \n Ilovani yuklab olish: https://play.google.com/store/apps/details?id=uz.mutolaa.commercial.mutolaa&hl=en \n https://apps.apple.com/us/app/mutolaa/id6475738561"
    }, 
    "Yashil makon" : {
        img: "./yashilmakon.png",
        info: "Yashil makon - bu atrof-muhitni muhofaza qilish va ekologik ongni oshirishga qaratilgan loyiha bo'lib, unda tabiatni asrash, daraxt ekish va chiqindilarni kamaytirish kabi tashabbuslar amalga oshiriladi."
    }, 
    "Iqtidor" : {
        img: "./iqtidor.png",
        info: "Iqtidor - bu yoshlarning iqtidorini kashf etish va rivojlantirishga qaratilgan loyiha bo'lib, unda turli sohalarda iste'dodli yoshlar uchun tanlovlar, treninglar va mentorlik dasturlari tashkil etiladi."
    }, 
    "Jasorat" : {
        info: "Jasorat - bu yoshlar o'rtasida yetakchilik qobiliyatlarini rivojlantirishga qaratilgan loyiha bo'lib, unda liderlik treninglari, jamoaviy loyihalar va ijtimoiy tashabbuslar orqali yoshlarning o'ziga bo'lgan ishonchini oshirishga yordam beriladi."
    }, 
    "Qizlar akademiyasi" : {
        img: "./qizlarakademiyasi.png",
        info: "Qizlar akademiyasi - bu qizlarni ta'lim va kasb-hunarga yo'naltirishga qaratilgan loyiha bo'lib, unda STEM (fan, texnologiya, muhandislik, matematika) sohalarida malaka oshirish uchun maxsus kurslar va treninglar o'tkaziladi."
    }, 
    "Matbuot va media" : {
        info: "Matbuot va media - bu yoshlarni ommaviy axborot vositalari sohasida malaka oshirishga qaratilgan loyiha bo'lib, unda jurnalistika, foto va video tahrirlash, ijtimoiy media boshqaruvi kabi ko'nikmalarni rivojlantirish uchun treninglar va amaliy mashg'ulotlar o'tkaziladi."
    }
};

bot.command("start", async (ctx) => {
    const userId = ctx.from.id;
    if (ctx.chat.type === "private") {
        userDatabase.add(userId);
        saveData();
        const keyboard = ADMINS.includes(userId) ? adminKeyboard : userKeyboard;
        await ctx.reply(`Assalomu alaykum, ${ctx.from.first_name}!`, { reply_markup: keyboard });
    } else {
        chatDatabase.add(ctx.chat.id);
        saveData();
    }
});

bot.command("send", async (ctx) => {
    if (!ADMINS.includes(ctx.from.id)) return;
    const rep = ctx.message.reply_to_message;
    if (!rep) return ctx.reply("❌ Xabarga reply qiling!");

    const targets = [...new Set([...userDatabase, ...chatDatabase])];
    await ctx.reply(`⏳ Yuborish boshlandi...`);

    let ok = 0;
    for (const tid of targets) {
        try {
            await bot.api.copyMessage(tid, ctx.chat.id, rep.message_id);
            ok++;
        } catch (e) {
            userDatabase.delete(tid);
            chatDatabase.delete(tid);
        }
    }
    saveData();
    await ctx.reply(`✅ Yetkazildi: ${ok}`);
});

bot.on("message", async (ctx) => {
    if (!ctx.from) return; 
    const userId = ctx.from.id; 
    const text = ctx.message.text || ctx.message.caption || "";
    const document = ctx.message.document; 
    const isAdmin = ADMINS.includes(userId);

    if (ctx.chat.type !== "private") {
        let isSpam = false;
        let reason = "";
        if (text && /(https?:\/\/[^\s]+|t\.me\/[^\s]+)/i.test(text)) { isSpam = true; reason = "Reklama"; }
        if (document && document.file_name?.toLowerCase().endsWith(".apk")) { isSpam = true; reason = "APK fayl"; }

        if (isSpam && !isAdmin) {
            const member = await ctx.getChatMember(userId);
            if (!["administrator", "creator"].includes(member.status)) {
                warns[userId] = (warns[userId] || 0) + 1;
                saveData();
                await ctx.deleteMessage().catch(() => {});
                await ctx.reply(`⚠️ ${ctx.from.first_name}, ${reason} taqiqlangan! (Warn: ${warns[userId]})`);
                
                const log = `🚨 **Qoidabuzar:**\n👤 ${ctx.from.first_name}\n🆔 \`${userId}\`\n📂 ${reason}\n📍 ${ctx.chat.title}`;
                await bot.api.sendMessage(LOG_GROUP_ID, log).catch(() => {});
                return;
            }
        }
        return; 
    }

    if (text === "⬅️ Orqaga") {
        const keyboard = isAdmin ? adminKeyboard : userKeyboard;
        return ctx.reply("Asosiy menyuga qaytdingiz.", { reply_markup: keyboard });
    }

    if (isAdmin) {
        if (text === "📊 Statistika") return ctx.reply(`👤 Users: ${userDatabase.size}\n👥 Groups: ${chatDatabase.size}`);
        if (text === "⚠️ Ogohlantirishlar") {
            if (!Object.keys(warns).length) return ctx.reply("Hali hech kimda warn yo'q.");
            let list = "📋 **Ro'yxat:**\n\n";
            Object.entries(warns).forEach(([id, c]) => list += `ID: \`${id}\` - ${c} marta\n`);
            return ctx.reply(list);
        }
        if (text === "📢 Yangilik") return ctx.reply("Xabarga reply qilib `/send` yozing.");
    }

    if (text === "Yordam") return ctx.reply(" Mahallani tanlang.", { reply_markup: mahallalar });
    if (text === "Haqida") return ctx.reply("Quyidan kerakli bo'limni tanlang", { reply_markup: haqidaKeyboard });
    if (text === "Loyihalar") return ctx.reply("Loyihani tanlang", { reply_markup: loyihalar})
    if (contactData[text]) return ctx.reply(contactData[text]); 
    if (haqidaMenu[text]) return ctx.reply(haqidaMenu[text], { parse_mode: "Markdown" });
    if (loyihalarHaqida[text]) {
        const loyiha = loyihalarHaqida[text];
        if (loyiha.img) {
            await ctx.replyWithPhoto(new InputFile(loyiha.img), { caption: loyiha.info });
        } else {
            await ctx.reply(loyiha.info);
        }
        return;
    };
});

bot.start();
