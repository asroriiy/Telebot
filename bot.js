require('dotenv').config();
const express = require("express");
const { Bot, Keyboard, InputFile, webhookCallback } = require("grammy");
const fs = require("fs");
const path = require("path"); // Faqat bir marta bo'lishi kerak
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const app = express();
app.use(express.json());

// 1. Static fayllarni ulash (index.html uchun)
app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3000;
const MAIN_ADMIN = Number(process.env.MAIN_ADMIN);
const ADMINS = [MAIN_ADMIN, Number(process.env.PROMO_ADMIN), Number(process.env.ADMIN)];

const bot = new Bot(process.env.BOT_TOKEN);

const USERS_FILE = "./users.json";
const CHATS_FILE = "./chats.json";

if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, JSON.stringify([]));
if (!fs.existsSync(CHATS_FILE)) fs.writeFileSync(CHATS_FILE, JSON.stringify([]));

let userDatabase = new Set(JSON.parse(fs.readFileSync(USERS_FILE, "utf8")).map(Number));

const contactData = {
    "8-mart": "Mirmusayev Shaxzodbek Abdurashid o'g'li \n +998940341000",
    "Buston": "Abdurahatov Shoxrux Abdurashid o'g'li \n +998994631289",
    "Dorilfunun": "Ashurov Xasanbek Sayfiddin o'g'li \n +998944544411",
    "Lashkarak": "Mirzakarimov Bexzod Faxriddinovich \n +998999720860",
    "Samarchuq": "Qo'chqorov Sardor Sherzod o'g'li \n +998945187727",
    "Ulug'bek": "Rais: Hayitqulova Ra'no Abdulqosimova +998944260725 \n Hokim yordamchisi Eshmuratovna Dilfuza Erkinovna +998935247474 \n Yoshlar yetakchisi: Abduvahabova Barno Erkinjon qizi +998999081294 \n Profilaktika inspektori: Masidiqov Baxxrom Rustam o'g'li +998944168388 \n Ijtimoiy xodim: Aliboyeva Ozoda Ermatovna +998944064244 \n Soliq inspektori: Kasimov Bahodir Shavkat o'g'li +998900424024",
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

const loyihalarHaqida = {
    "Ibrat Farzandlari": { info: "Ibrat Farzandlari - xorijiy tillarni onlayn o'rganish platformasi." },
    "Ustoz AI": { info: "Ustoz AI - zamonaviy kasblarni o'rganish platformasi." },
    "Mutolaa": { info: "Mutolaa - onlayn kutubxonani o'z ichiga olgan kitobxonlik loyihasi." },
    "Yashil makon": { info: "Yashil makon - ekologiyani asrash uchun ishlab chiqilgan loyiha." },
    "Iqtidor": { info: "Iqtidor - iste'dodli yoshlarni aniqlash va qo'llash loyihasi." },
    "Jasorat": { info: "Jasorat - liderlik va vatanparvarlik loyihasi." },
    "Qizlar akademiyasi": { info: "Qizlar akademiyasi - STEM va kasb-hunar loyihasi." },
    "Matbuot va media": { info: "Matbuot va media - jurnalistika va media treninglari." }
};

// API Endpointlar
app.get('/api/data', (req, res) => {
    res.json({ contactData, loyihalarHaqida });
});

app.post('/api/send-otp', (req, res) => {
    res.json({ success: true });
});

app.post('/api/register', (req, res) => {
    const { phone, fullname } = req.body;
    res.json({ user: { phone, fullname } });
});

app.post('/api/login', (req, res) => {
    const { phone } = req.body;
    res.json({ user: { phone, fullname: "Foydalanuvchi" } });
});

app.post('/api/murojaat', upload.single('file'), async (req, res) => {
    try {
        const { fullname, phone, text, mahalla } = req.body;
        const file = req.file; 

        const log = `📝 <b>Yangi Murojaat!</b>\n\n` +
                    `👤: ${fullname}\n` +
                    `📞: ${phone}\n` +
                    `📍: ${mahalla}\n` +
                    `💬: ${text}`;

        if (file) {
            const filePath = file.path; 
            const inputFile = new InputFile(filePath);

            if (file.mimetype.startsWith('image/')) {
                await bot.api.sendPhoto(MAIN_ADMIN, inputFile, { caption: log, parse_mode: "HTML" });
            } else if (file.mimetype.startsWith('video/')) {
                await bot.api.sendVideo(MAIN_ADMIN, inputFile, { caption: log, parse_mode: "HTML" });
            } else {
                await bot.api.sendDocument(MAIN_ADMIN, inputFile, { caption: log, parse_mode: "HTML" });
            }

            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        } else {
            // MANA BU QISM QOLIB KETGAN EDI:
            // Fayl yo'q bo'lsa faqat matnni yuborish
            await bot.api.sendMessage(MAIN_ADMIN, log, { parse_mode: "HTML" });
        }

        res.json({ ok: true });
    } catch (error) {
        console.error("Murojaat yuborishda xatolik:", error);
        res.status(500).json({ ok: false });
    }
}); // Qavs to'g'ri yopildi

// Bot webhook
app.use("/webhook", webhookCallback(bot, "express"));

// Asosiy sahifa (Brauzerda / ochilganda)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

bot.command("start", (ctx) => {
    userDatabase.add(ctx.from.id);
    fs.writeFileSync(USERS_FILE, JSON.stringify(Array.from(userDatabase)));
    ctx.reply("Xush kelibsiz! Mahalla yoshlar portalining botiga ulandingiz.");
});

// Serverni yurgizish (Render uchun 0.0.0.0 muhim)
app.listen(PORT, "0.0.0.0", () => {
    console.log(`✅ Server ishga tushdi: Port ${PORT}`);
});

