require('dotenv').config();
const express = require("express");
const { Bot, InputFile, webhookCallback } = require("grammy");
const fs = require("fs");
const path = require("path");
const multer = require('multer');

// Fayllarni vaqtincha saqlash uchun 'uploads' papkasini sozlash
const upload = multer({ dest: 'uploads/' });
const app = express();
app.use(express.json());

// Static fayllarni (index.html, rasm) ulash
app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3000;
const MAIN_ADMIN = Number(process.env.MAIN_ADMIN);
const bot = new Bot(process.env.BOT_TOKEN);

const USERS_FILE = "./users.json";
if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, JSON.stringify([]));

// Ma'lumotlar (Bular o'zgarishsiz qolgan)
const contactData = {
    "8-mart": "Mirmusayev Shaxzodbek Abdurashid o'g'li \n +998940341000",
    "Buston": "Abdurahatov Shoxrux Abdurashid o'g'li \n +998994631289",
    "Dorilfunun": "Ashurov Xasanbek Sayfiddin o'g'li \n +998944544411",
    "Lashkarak": "Mirzakarimov Bexzod Faxriddinovich \n +998999720860",
    "Samarchuq": "Qo'chqorov Sardor Sherzod o'g'li \n +998945187727",
    "Ulug'bek": "Yoshlar yetakchisi: Abduvahabova Barno Erkinjon qizi +998999081294",
    "Xakkarman": "Azimjonov Olimjon Azimjon o'g'li \n +998992615111",
    "Bobotog'": "Muxitdinov Shoxruxbek To'lqinovich \n +998331777723",
    "Beruniy": "Yoshlar yetakchisi: Tadjiyev Aloviddin Shavkatovich +998936285010",
    "Bog'i surh": "Arabova Mohira Karimovna \n +998931673777",
    "Chotqol": "Xayrullayev Durbek Ubaydulla o'g'li \n +998930050851",
    "Do'stlik": "Rustamova Ruxsora Sobirjon qizi \n +998943239503",
    "Go'zal": "Yoshlar yetakchisi: Abduqaxxarov Dilmurod Umarali o'g'li +998991713676",
    "G'afur G'ulom": "Yoshlar yetakchisi: Yuldashaliyev Ixtiyar Baxtiyarovich +998900938600",
    "Grum": "Qarshiboyev Sanjar Abdug'ani o'g'li",
    "Gulbog'": "Abdumannobov Doston Davrom o'g'li \n +998940146144",
    "Gulzor": "Axmedov Islombek Baxodir o'g'li \n +998943141144",
    "Istiqbol": "Yoshlar yetakchisi: Sheraliyev Diyorbek Zafar o'g'li +998900084200",
    "Istiqlol": "Akromjonov Temurmalik Akromjon o'g'li \n +998944041016",
    "Jigariston": "Yoshlar yetakchisi: Uralov Husniddin Urazali o'g'li +998944246292",
    "Karvon": "Boymatjonov Ahror Asqarjonovich \n +998945554045",
    "Kimyogar": "Mingboyev Ma'ruf Tolib o'g'li \n +998931690914",
    "Ko'k terak": "Axmedov Sulton Xasanboy O'gli \n +998990017144",
    "Maydon": "Yoshlar yetakchisi: Matqosimov Javlon Orifjonovich +998940383735",
    "Mustaqillik": "Qurbonqulov Umidjon Shuhrat o'g'li \n +998931873673",
    "Namuna": "Abdumalikov Sardor Murodjon o'g'li \n +998932829657",
    "Navbahor": "Saydraxmanov Doston Saidibroximovich \n +998990996116",
    "Navro'z-1": "Uralov Muhammadali Abdullajon o'g'li +998958661501",
    "Nurchi": "Ashurboyev Asilbek Bahodiro'g'li \n +998936662124",
    "Obliq": "Nazmiddinxonov Zayniddinxon Baxodir o'g'li \n +998949323130",
    "Obod": "Yoshlar yetakchisi: Madaminov Elyor Sherzod o'g'li +998909719717",
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
app.get('/api/data', (req, res) => res.json({ contactData, loyihalarHaqida }));
app.post('/api/send-otp', (req, res) => res.json({ success: true }));
app.post('/api/register', (req, res) => res.json({ user: { phone: req.body.phone, fullname: req.body.fullname } }));
app.post('/api/login', (req, res) => res.json({ user: { phone: req.body.phone, fullname: "Foydalanuvchi" } }));

// TO'G'IRLANGAN MUROJAAT QISMI
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

            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        } else {
            await bot.api.sendMessage(MAIN_ADMIN, log, { parse_mode: "HTML" });
        }
        res.json({ ok: true });
    } catch (error) {
        console.error("Xatolik:", error);
        res.status(500).json({ ok: false });
    }
});

// Bot webhook
app.use("/webhook", webhookCallback(bot, "express"));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

bot.command("start", (ctx) => {
    ctx.reply("Xush kelibsiz! Mahalla yoshlar portalining botiga ulandingiz.");
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`✅ Server ishlamoqda: ${PORT}`);
});
