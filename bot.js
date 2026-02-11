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

app.post("/api/send-otp", async (req, res) => {
    const { phone } = req.body;
    const cleanPhone = phone.replace(/\D/g, "");
    const otp = Math.floor(10000 + Math.random() * 90000);
    OTP_CACHE.set(phone, { otp, expires: Date.now() + 300000 });
    
    const users = getData(USERS_FILE);
    // Find user by phone to get their chatId
    const user = users.find(u => u.phone && u.phone.replace(/\D/g, "").includes(cleanPhone));

    if (user && user.chatId) {
        try {
            await bot.api.sendMessage(user.chatId, `🔑 Tasdiqlash kodi: ${otp}`);
            return res.json({ success: true });
        } catch (e) {
            return res.status(500).json({ success: false, msg: "Botga yozishda xatolik" });
        }
    } else {
        // If user hasn't started the bot, we can't send the code
        return res.status(400).json({ success: false, msg: "Avval botga /start bosing!" });
    }
});

app.post("/api/register", (req, res) => {
    const { phone, otp, fullname, password } = req.body;
    const cached = OTP_CACHE.get(phone);
    if (!cached || cached.otp != otp) return res.status(400).json({ msg: "Kod xato" });
    
    let users = getData(USERS_FILE);
    let uIdx = users.findIndex(u => u.phone === phone);
    
    if (uIdx !== -1) {
        users[uIdx].fullname = fullname;
        users[uIdx].password = password;
    } else {
        users.push({ phone, fullname, password, joined: Date.now() });
    }
    
    setData(USERS_FILE, users);
    res.json({ success: true, user: users.find(u => u.phone === phone) });
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

const userKB = new Keyboard().text("Mahallalar").text("Ma'lumot").row().text("👤 Profil").resized();

bot.command("start", async (ctx) => {
    await ctx.reply("Assalomu alaykum! Ro'yxatdan o'tish uchun telefon raqamingizni yuboring.", {
        reply_markup: new Keyboard().requestContact("📞 Raqamni yuborish").resized()
    });
});

bot.on("message:contact", async (ctx) => {
    const phone = "+" + ctx.message.contact.phone_number.replace(/\+/g, "");
    let users = getData(USERS_FILE);
    let user = users.find(u => u.phone === phone);
    if (user) {
        user.chatId = ctx.from.id;
    } else {
        users.push({ phone, chatId: ctx.from.id });
    }
    setData(USERS_FILE, users);
    await ctx.reply("Raqamingiz ulandi. Endi saytda kod olishingiz mumkin.", { reply_markup: userKB });
});

app.get("/", (req, res) => res.sendFile(path.join(__dirname, "index.html")));
app.get("/logo.png", (req, res) => res.sendFile(path.join(__dirname, "logo.png")));
app.use("/webhook", webhookCallback(bot, "express"));

app.listen(PORT, "0.0.0.0", async () => {
    const hostname = process.env.RENDER_EXTERNAL_HOSTNAME;
    if (hostname) {
        await bot.api.setWebhook(`https://${hostname}/webhook`, { drop_pending_updates: true });
        console.log("✅ Bot live on: " + hostname);
    }
});
