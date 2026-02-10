require('dotenv').config();
const express = require("express");
const { Bot, Keyboard, InputFile, webhookCallback } = require("grammy");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const app = express();
const upload = multer({ dest: "uploads/" });
const PORT = process.env.PORT || 3000; 

const ADMIN_PHONE = "+998945777097";
const ADMIN_PASS = "adminHuman";
const ADMINS = [Number(process.env.MAIN_ADMIN), Number(process.env.PROMO_ADMIN), Number(process.env.ADMIN)];
const LOG_GROUP_ID = Number(process.env.LOG_GROUP_ID); 

const bot = new Bot(process.env.BOT_TOKEN);

app.use(express.json());

const USERS_FILE = "./users_db.json";
const COMPLAINTS_FILE = "./complaints_db.json";
const OTP_CACHE = new Map();

const initFile = (path, initial) => { if (!fs.existsSync(path)) fs.writeFileSync(path, JSON.stringify(initial)); };
initFile(USERS_FILE, []);
initFile(COMPLAINTS_FILE, []);

const getData = (file) => JSON.parse(fs.readFileSync(file, "utf8"));
const setData = (file, data) => fs.writeFileSync(file, JSON.stringify(data, null, 2));

app.post("/api/send-otp", async (req, res) => {
    const { phone } = req.body;
    const otp = Math.floor(10000 + Math.random() * 90000);
    OTP_CACHE.set(phone, { otp, expires: Date.now() + 300000 });
    
    await bot.api.sendMessage(LOG_GROUP_ID, `🔑 Tasdiqlash kodi\n📞: ${phone}\n🔢: ${otp}`);
    res.json({ success: true });
});

app.post("/api/register", (req, res) => {
    const { phone, otp, fullname, password } = req.body;
    const cached = OTP_CACHE.get(phone);
    
    if (!cached || cached.otp != otp) return res.status(400).json({ msg: "Kod xato" });
    
    let users = getData(USERS_FILE);
    if (users.find(u => u.phone === phone)) return res.status(400).json({ msg: "Raqam band" });
    
    const newUser = { phone, fullname, password, joined: Date.now() };
    users.push(newUser);
    setData(USERS_FILE, users);
    res.json({ success: true, user: newUser });
});

app.post("/api/login", (req, res) => {
    const { phone, pass } = req.body;
    if (phone === ADMIN_PHONE && pass === ADMIN_PASS) {
        return res.json({ success: true, user: { fullname: "Admin", phone: ADMIN_PHONE, isAdmin: true } });
    }
    const users = getData(USERS_FILE);
    const user = users.find(u => u.phone === phone && u.password === pass);
    if (user) res.json({ success: true, user });
    else res.status(401).json({ success: false });
});

app.get("/api/check-limit", (req, res) => {
    const { phone } = req.query;
    if (phone === ADMIN_PHONE) return res.json({ allowed: true });
    
    const complaints = getData(COMPLAINTS_FILE);
    const last = complaints.filter(c => c.phone === phone).sort((a,b) => b.date - a.date)[0];
    
    if (last && (Date.now() - last.date) < 86400000) return res.json({ allowed: false });
    res.json({ allowed: true });
});

app.get("/api/my-complaints", (req, res) => {
    const { phone } = req.query;
    const complaints = getData(COMPLAINTS_FILE);
    res.json(complaints.filter(c => c.phone === phone));
});

app.post("/api/murojaat", upload.single("evidence"), async (req, res) => {
    try {
        const { fullname, phone, mahalla, text } = req.body;
        const complaints = getData(COMPLAINTS_FILE);
        const newEntry = { fullname, phone, mahalla, text, date: Date.now() };
        complaints.push(newEntry);
        setData(COMPLAINTS_FILE, complaints);

        const caption = `📝 WEB MUROJAAT\n\n👤: ${fullname}\n📞: ${phone}\n📍: ${mahalla}\n\n📄: ${text}`;
        if (req.file) {
            const inputFile = new InputFile(req.file.path);
            if (req.file.mimetype.startsWith("image")) await bot.api.sendPhoto(LOG_GROUP_ID, inputFile, { caption });
            else await bot.api.sendVideo(LOG_GROUP_ID, inputFile, { caption });
            fs.unlinkSync(req.file.path);
        } else {
            await bot.api.sendMessage(LOG_GROUP_ID, caption);
        }
        res.json({ success: true });
    } catch (e) { res.status(500).json({ success: false }); }
});

const userKeyboard = new Keyboard().text("Mahallalar").text("Ma'lumot").row().text("👤 Profil").resized();
const contactData = {"8-mart":"Mirmusayev Shaxzodbek \n +998940341000","Buston":"Abdurahatov Shoxrux \n +998994631289","Dorilfunun":"Ashurov Xasanbek \n +998944544411","Lashkarak":"Mirzakarimov Bexzod \n +998999720860","Samarchuq":"Qo'chqorov Sardor \n +998945187727","Ulug'bek":"Rais: Hayitqulova Ra'no +998944260725","Xakkarman":"Azimjonov Olimjon \n +998992615111","Bobotog'":"Muxitdinov Shoxruxbek \n +998331777723","Beruniy":"Rais: Zakirov Abduvohid +998993666715","Bog'i surh":"Arabova Mohira \n +998931673777","Chotqol":"Xayrullayev Durbek \n +998930050851","Do'stlik":"Rustamova Ruxsora \n +998943239503","Go'zal":"Rais: Dushayeva Xurshida +998770684004","G'afur G'ulom":"Rais: Zakirova Gulchexra +998942186775","Grum":"Qarshiboyev Sanjar","Gulbog'":"Abdumannobov Doston \n +998940146144","Gulzor":"Axmedov Islombek \n +998943141144","Istiqbol":"Rais: Nishanova Maxmuda +998901747478","Istiqlol":"Akromjonov Temurmalik \n +998944041016","Jigariston":"Rais: Babaraximova Mehriniso +998949321055","Karvon":"Boymatjonov Ahror \n +998945554045","Kimyogar":"Mingboyev Ma'ruf \n +998931690914","Ko'k terak":"Axmedov Sulton \n +998990017144","Maydon":"Rais: Mengliyev Ixtibor +998936075351","Mustaqillik":"Qurbonqulov Umidjon \n +998931873673","Namuna":"Abdumalikov Sardor \n +998932829657","Navbahor":"Saydraxmanov Doston \n +998990996116","Navro'z-1":"Rais: Kaykieva Xafiza +998994004333","Nurchi":"Ashurboyev Asilbek \n +998936662124","Obliq":"Nazmiddinxonov Zayniddinxon \n +998949323130","Obod":"Rais: Eshmuratov Xusnutdin +998931723680","Oppartak":"Siddikov Samandar \n +998949444740","Ozodlik":"Quvonov Ixtiyor \n +998943632334","Qorabog'":"Umirzakov Axror \n +998949265401","Sog'lom":"Matxoliqov Javlon +998931738419","Taraqqiyot":"Roxatillayev Sherzodbek \n +998936273815","YABS":"Axmedov Jahongir \n +998949253675","Yangi go'shtsoy":"Mamasodikov Doston \n +998997259299","Yangi hayot":"Jamolov Avazbek \n +998885449898","Yangiobod":"Barkinov Farrux \n +998991074167","Yoshlik":"Chorshanbiyev Qudrat \n +998936004294"};

bot.command("start", (ctx) => ctx.reply("Assalomu alaykum!", { reply_markup: userKeyboard }));

bot.on("message", async (ctx) => {
    const text = ctx.message.text;
    if (text === "👤 Profil") return ctx.reply(`Ism: ${ctx.from.first_name}\nID: ${ctx.from.id}`);
    if (text === "Mahallalar") return ctx.reply("Tanlang:", { reply_markup: new Keyboard().text("8-mart").text("Buston").row().text("⬅️ Orqaga").resized() }); // Add other districts as needed
    if (contactData[text]) return ctx.reply(contactData[text]);
    if (text === "⬅️ Orqaga") return ctx.reply("Asosiy menyu", { reply_markup: userKeyboard });
});

app.get("/", (req, res) => res.sendFile(path.join(__dirname, "index.html")));
app.get("/logo.png", (req, res) => res.sendFile(path.join(__dirname, "logo.png")));
app.use("/webhook", webhookCallback(bot, "express"));

app.listen(PORT, "0.0.0.0", async () => {
    await bot.api.setWebhook(`https://angren-rasmiy.onrender.com/webhook`, { drop_pending_updates: true });
    console.log("🚀 Server is running");
});
