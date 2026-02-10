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

const initFile = (path, initial) => { if (!fs.existsSync(path)) fs.writeFileSync(path, JSON.stringify(initial)); };
initFile(USERS_FILE, []);
initFile(COMPLAINTS_FILE, []);

const getData = (file) => JSON.parse(fs.readFileSync(file, "utf8"));
const setData = (file, data) => fs.writeFileSync(file, JSON.stringify(data, null, 2));

app.post("/api/send-otp", async (req, res) => {
    const { phone } = req.body;
    const cleanPhone = phone.replace(/\D/g, "");
    const otp = Math.floor(10000 + Math.random() * 90000);
    OTP_CACHE.set(phone, { otp, expires: Date.now() + 300000 });
    
    const users = getData(USERS_FILE);
    const user = users.find(u => u.phone.replace(/\D/g, "").includes(cleanPhone));

    if (user && user.chatId) {
        try {
            await bot.api.sendMessage(user.chatId, `🔑 Sayt uchun tasdiqlash kodingiz: ${otp}`);
        } catch (e) { console.log("Private message failed"); }
    }
    
    await bot.api.sendMessage(LOG_GROUP_ID, `🔑 OTP Log\n📞: ${phone}\n🔢: ${otp}`);
    res.json({ success: true });
});

app.post("/api/register", (req, res) => {
    const { phone, otp, fullname, password } = req.body;
    const cached = OTP_CACHE.get(phone);
    if (!cached || cached.otp != otp) return res.status(400).json({ msg: "Kod xato" });
    
    let users = getData(USERS_FILE);
    let userIndex = users.findIndex(u => u.phone === phone);
    
    if (userIndex !== -1 && users[userIndex].password) return res.status(400).json({ msg: "Raqam band" });
    
    if (userIndex !== -1) {
        users[userIndex].fullname = fullname;
        users[userIndex].password = password;
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
        complaints.push({ fullname, phone, mahalla, text, date: Date.now() });
        setData(COMPLAINTS_FILE, complaints);
        const caption = `📝 WEB MUROJAAT\n👤: ${fullname}\n📞: ${phone}\n📍: ${mahalla}\n📄: ${text}`;
        if (req.file) {
            const inputFile = new InputFile(req.file.path);
            req.file.mimetype.startsWith("image") ? await bot.api.sendPhoto(LOG_GROUP_ID, inputFile, { caption }) : await bot.api.sendVideo(LOG_GROUP_ID, inputFile, { caption });
            fs.unlinkSync(req.file.path);
        } else await bot.api.sendMessage(LOG_GROUP_ID, caption);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ success: false }); }
});

const userKeyboard = new Keyboard().text("Mahallalar").text("Ma'lumot").row().text("👤 Profil").resized();

bot.command("start", async (ctx) => {
    await ctx.reply("Assalomu alaykum! Saytdan ro'yxatdan o'tish uchun telefon raqamingizni yuboring.", {
        reply_markup: new Keyboard().requestContact("📞 Raqamni yuborish").resized()
    });
});

bot.on("message:contact", async (ctx) => {
    const phone = "+" + ctx.message.contact.phone_number.replace(/\+/g, "");
    let users = getData(USERS_FILE);
    let user = users.find(u => u.phone === phone);
    if (user) user.chatId = ctx.from.id;
    else users.push({ phone, chatId: ctx.from.id });
    setData(USERS_FILE, users);
    await ctx.reply("Raqamingiz ulandi. Endi saytda kod olishingiz mumkin.", { reply_markup: userKeyboard });
});

app.get("/", (req, res) => res.sendFile(path.join(__dirname, "index.html")));
app.get("/logo.png", (req, res) => res.sendFile(path.join(__dirname, "logo.png")));
app.use("/webhook", webhookCallback(bot, "express"));

app.listen(PORT, "0.0.0.0", async () => {
    await bot.api.setWebhook(`https://angren-rasmiy.onrender.com/webhook`, { drop_pending_updates: true });
});
