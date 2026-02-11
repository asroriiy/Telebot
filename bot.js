require('dotenv').config();
const express = require("express");
const { Bot, Keyboard, InputFile, webhookCallback } = require("grammy");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const app = express();
const upload = multer({ dest: "uploads/" });
const PORT = process.env.PORT || 3000; 

const ADMIN_PHONE = process.env.AdminTel;
const ADMIN_PASS = process.env.AdminPass;
const LOG_GROUP_ID = Number(process.env.LOG_GROUP_ID); 
const bot = new Bot(process.env.BOT_TOKEN);

app.use(express.json());

const USERS_FILE = "./users_db.json";
const COMPLAINTS_FILE = "./complaints_db.json";
const OTP_CACHE = new Map();

const initFile = (p, i) => { if (!fs.existsSync(p)) fs.writeFileSync(p, JSON.stringify(i)); };
initFile(USERS_FILE, []);
initFile(COMPLAINTS_FILE, []);

const getData = (f) => JSON.parse(fs.readFileSync(f, "utf8"));
const setData = (f, d) => fs.writeFileSync(f, JSON.stringify(d, null, 2));
const clean = (p) => p.replace(/\D/g, "");

const contactData = {
    "8-mart": "Mirmusayev Shaxzodbek Abdurashid o'g'li \n +998940341000",
    "Buston": "Abdurahatov Shoxrux Abdurashid o'g'li \n +998994631289",
    "Dorilfunun": "Ashurov Xasanbek Sayfiddin o'g'li \n +998944544411",
    "Lashkarak": "Mirzakarimov Bexzod Faxriddinovich \n +998999720860",
    "Samarchuq": "Qo'chqorov Sardor Sherzod o'g'li \n +998945187727",
    "Ulug'bek": "Rais: Hayitqulova Ra'no +998944260725 \n Hokim yordamchisi: +998935247474 \n Yoshlar yetakchisi: +998999081294",
    "Xakkarman": "Azimjonov Olimjon Azimjon o'g'li \n +998992615111",
    "Bobotog'": "Muxitdinov Shoxruxbek To'lqinovich \n +998331777723",
    "Beruniy": "Rais: Zakirov Abduvohid +998993666715 \n Yoshlar yetakchisi: +998936285010",
    "Bog'i surh": "Arabova Mohira Karimovna \n +998931673777",
    "Chotqol": "Xayrullayev Durbek Ubaydulla o'g'li \n +998930050851",
    "Do'stlik": "Rustamova Ruxsora Sobirjon qizi \n +998943239503",
    "Go'zal": "Rais: Dushayeva Xurshida +998770684004 \n Yoshlar yetakchisi: +998991713676",
    "G'afur G'ulom": "Rais: Zakirova Gulchexra +998942186775 \n Yoshlar yetakchisi: +998900938600",
    "Grum": "Qarshiboyev Sanjar Abdug'ani o'g'li",
    "Gulbog'": "Abdumannobov Doston Davrom o'g'li \n +998940146144",
    "Gulzor": "Axmedov Islombek Baxodir o'g'li \n +998943141144",
    "Istiqbol": "Rais: Nishanova Maxmuda +998901747478 \n Yoshlar yetakchisi: +998900084200",
    "Istiqlol": "Akromjonov Temurmalik Akromjon o'g'li \n +998944041016",
    "Jigariston": "Rais: Babaraximova Mehriniso +998949321055 \n Yoshlar yetakchisi: +998944246292",
    "Karvon": "Boymatjonov Ahror Asqarjonovich \n +998945554045",
    "Kimyogar": "Mingboyev Ma'ruf Tolib o'g'li \n +998931690914",
    "Ko'k terak": "Axmedov Sulton Xasanboy O'gli \n +998990017144",
    "Maydon": "Rais: Mengliyev Ixtibor +998936075351 \n Yoshlar yetakchisi: +998940383735",
    "Mustaqillik": "Qurbonqulov Umidjon Shuhrat o'g'li \n +998931873673",
    "Namuna": "Abdumalikov Sardor Murodjon o'g'li \n +998932829657",
    "Navbahor": "Saydraxmanov Doston Saidibroximovich \n +998990996116",
    "Navro'z-1": "Rais: Kaykieva Xafiza +998994004333 \n Yoshlar yetakchisi: +998958661501",
    "Nurchi": "Ashurboyev Asilbek Bahodiro'g'li \n +998936662124",
    "Obliq": "Nazmiddinxonov Zayniddinxon Baxodir o'g'li \n +998949323130",
    "Obod": "Rais: Eshmuratov Xusnutdin +998931723680 \n Yoshlar yetakchisi: +998909719717",
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
    "Ibrat Farzandlari": "Ibrat Farzandlari - xorijiy tillarni onlayn o'rganish platformasi.",
    "Ustoz AI": "Ustoz AI - zamonaviy kasblarni o'rganish platformasi.",
    "Mutolaa": "Mutolaa - onlayn kutubxonani o'z ichiga olgan kitobxonlik loyihasi.",
    "Yashil makon": "Yashil makon - ekologiyani asrash uchun ishlab chiqilgan loyiha.",
    "Iqtidor": "Iqtidor - iste'dodli yoshlarni aniqlash va qo'llash loyihasi.",
    "Jasorat": "Jasorat - liderlik va vatanparvarlik loyihasi.",
    "Qizlar akademiyasi": "Qizlar akademiyasi - STEM va kasb-hunar loyihasi.",
    "Matbuot va media": "Matbuot va media - jurnalistika va media treninglari."
};

app.get("/api/data", (req, res) => {
    res.json({ contactData, loyihalarHaqida });
});

app.post("/api/send-otp", async (req, res) => {
    const { phone } = req.body;
    const cleanPhone = clean(phone || "");
    const otp = Math.floor(10000 + Math.random() * 90000);
    OTP_CACHE.set(cleanPhone, { otp, expires: Date.now() + 300000 });
    const users = getData(USERS_FILE);
    const user = users.find(u => u.phone && clean(u.phone).includes(cleanPhone));
    if (user && user.chatId) {
        try {
            await bot.api.sendMessage(user.chatId, `🔑 Tasdiqlash kodi: ${otp}`);
            return res.json({ success: true });
        } catch (e) { return res.status(500).json({ success: false, msg: "Botga yozishda xatolik" }); }
    } else { return res.status(400).json({ success: false, msg: "Avval botga /start bosing!" }); }
});

app.post("/api/register", (req, res) => {
    const { phone, otp, fullname, password } = req.body;
    const cleanPhone = clean(phone);
    const cached = OTP_CACHE.get(cleanPhone);
    if (!cached || cached.otp != otp) return res.status(400).json({ msg: "Kod xato" });
    let users = getData(USERS_FILE);
    let uIdx = users.findIndex(u => clean(u.phone) === cleanPhone);
    if (uIdx !== -1) { users[uIdx].fullname = fullname; users[uIdx].password = password; }
    else { users.push({ phone: cleanPhone, fullname, password, joined: Date.now() }); }
    setData(USERS_FILE, users);
    res.json({ success: true, user: users.find(u => clean(u.phone) === cleanPhone) });
});

app.post("/api/login", (req, res) => {
    const { phone, pass } = req.body;
    const cleanPhone = clean(phone);
    if (cleanPhone === clean(ADMIN_PHONE || "") && pass === ADMIN_PASS) {
        return res.json({ success: true, user: { fullname: "Admin", phone: ADMIN_PHONE, isAdmin: true } });
    }
    const users = getData(USERS_FILE);
    const user = users.find(u => clean(u.phone) === cleanPhone && u.password === pass);
    if (user) res.json({ success: true, user });
    else res.status(401).json({ success: false });
});

app.post("/api/murojaat", upload.single("evidence"), async (req, res) => {
    try {
        const { fullname, phone, mahalla, text } = req.body;
        const comps = getData(COMPLAINTS_FILE);
        comps.push({ fullname, phone, mahalla, text, date: Date.now() });
        setData(COMPLAINTS_FILE, comps);
        const cap = `📝 WEB MUROJAAT\n👤: ${fullname}\n📞: ${phone}\n📍: ${mahalla}\n📄: ${text}`;
        if (req.file) {
            const input = new InputFile(req.file.path);
            req.file.mimetype.startsWith("image") ? await bot.api.sendPhoto(LOG_GROUP_ID, input, { caption: cap }) : await bot.api.sendVideo(LOG_GROUP_ID, input, { caption: cap });
            fs.unlinkSync(req.file.path);
        } else await bot.api.sendMessage(LOG_GROUP_ID, cap);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ success: false }); }
});

bot.command("start", async (ctx) => {
    await ctx.reply("Assalomu alaykum! Ro'yxatdan o'tish uchun telefon raqamingizni yuboring.", {
        reply_markup: new Keyboard().requestContact("📞 Raqamni yuborish").resized()
    });
});

bot.on("message:contact", async (ctx) => {
    const phone = clean(ctx.message.contact.phone_number);
    let users = getData(USERS_FILE);
    let user = users.find(u => clean(u.phone) === phone);
    if (user) { user.chatId = ctx.from.id; } 
    else { users.push({ phone, chatId: ctx.from.id }); }
    setData(USERS_FILE, users);
    await ctx.reply("Raqamingiz ulandi. Endi saytda ro'yxatdan o'tishingiz mumkin.");
});

app.get("/", (req, res) => res.sendFile(path.join(__dirname, "index.html")));
app.use("/webhook", webhookCallback(bot, "express"));
app.listen(PORT, "0.0.0.0", () => console.log(`Server running on port ${PORT}`));
