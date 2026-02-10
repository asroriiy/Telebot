require('dotenv').config();
const express = require("express");
const { Bot, Keyboard, InputFile, webhookCallback } = require("grammy");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const app = express();
const upload = multer({ dest: "uploads/" });
const PORT = process.env.PORT || 3000; 

const MAIN_ADMIN = Number(process.env.MAIN_ADMIN);
const PROMO_ADMIN = Number(process.env.PROMO_ADMIN);
const ADMIN = Number(process.env.ADMIN);
const ADMINS = [MAIN_ADMIN, PROMO_ADMIN, ADMIN];
const LOG_GROUP_ID = Number(process.env.LOG_GROUP_ID); 

const bot = new Bot(process.env.BOT_TOKEN);

app.use(express.json());

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/logo.png", (req, res) => {
    res.sendFile(path.join(__dirname, "logo.png"));
});

app.post("/api/murojaat", upload.single("evidence"), async (req, res) => {
    try {
        const { fullname, phone, mahalla, text } = req.body;
        const caption = `📝 WEB MUROJAAT\n\n👤: ${fullname}\n📞: ${phone}\n📍: ${mahalla}\n\n📄: ${text}`;
        
        if (req.file) {
            const filePath = req.file.path;
            const inputFile = new InputFile(filePath);
            
            if (req.file.mimetype.startsWith("image")) {
                await bot.api.sendPhoto(LOG_GROUP_ID, inputFile, { caption });
            } else {
                await bot.api.sendVideo(LOG_GROUP_ID, inputFile, { caption });
            }
            fs.unlinkSync(filePath);
        } else {
            await bot.api.sendMessage(LOG_GROUP_ID, caption);
        }
        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false });
    }
});

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
    } catch (e) { return fallback; }
};

let userDatabase = new Set((readJson(USERS_FILE, []) || []).map(Number));
let chatDatabase = new Set((readJson(CHATS_FILE, []) || []).map(Number));
let warns = readJson(WARNS_FILE, {});

const saveData = () => {
    fs.writeFileSync(USERS_FILE, JSON.stringify(Array.from(userDatabase)));
    fs.writeFileSync(CHATS_FILE, JSON.stringify(Array.from(chatDatabase)));
    fs.writeFileSync(WARNS_FILE, JSON.stringify(warns));
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
const loyihalarKB = new Keyboard().text("Ibrat Farzandlari").row().text("Ustoz AI").row().text("Mutolaa").row().text("Yashil makon").row().text("Iqtidor").row().text("Jasorat").row().text("Qizlar akademiyasi").row().text("Matbuot va media").row().text("⬅️ Orqaga").resized();

const contactData = {"8-mart":"Mirmusayev Shaxzodbek \n +998940341000","Buston":"Abdurahatov Shoxrux \n +998994631289","Dorilfunun":"Ashurov Xasanbek \n +998944544411","Lashkarak":"Mirzakarimov Bexzod \n +998999720860","Samarchuq":"Qo'chqorov Sardor \n +998945187727","Ulug'bek":"Rais: Hayitqulova Ra'no +998944260725","Xakkarman":"Azimjonov Olimjon \n +998992615111","Bobotog'":"Muxitdinov Shoxruxbek \n +998331777723","Beruniy":"Rais: Zakirov Abduvohid +998993666715","Bog'i surh":"Arabova Mohira \n +998931673777","Chotqol":"Xayrullayev Durbek \n +998930050851","Do'stlik":"Rustamova Ruxsora \n +998943239503","Go'zal":"Rais: Dushayeva Xurshida +998770684004","G'afur G'ulom":"Rais: Zakirova Gulchexra +998942186775","Grum":"Qarshiboyev Sanjar","Gulbog'":"Abdumannobov Doston \n +998940146144","Gulzor":"Axmedov Islombek \n +998943141144","Istiqbol":"Rais: Nishanova Maxmuda +998901747478","Istiqlol":"Akromjonov Temurmalik \n +998944041016","Jigariston":"Rais: Babaraximova Mehriniso +998949321055","Karvon":"Boymatjonov Ahror \n +998945554045","Kimyogar":"Mingboyev Ma'ruf \n +998931690914","Ko'k terak":"Axmedov Sulton \n +998990017144","Maydon":"Rais: Mengliyev Ixtibor +998936075351","Mustaqillik":"Qurbonqulov Umidjon \n +998931873673","Namuna":"Abdumalikov Sardor \n +998932829657","Navbahor":"Saydraxmanov Doston \n +998990996116","Navro'z-1":"Rais: Kaykieva Xafiza +998994004333","Nurchi":"Ashurboyev Asilbek \n +998936662124","Obliq":"Nazmiddinxonov Zayniddinxon \n +998949323130","Obod":"Rais: Eshmuratov Xusnutdin +998931723680","Oppartak":"Siddikov Samandar \n +998949444740","Ozodlik":"Quvonov Ixtiyor \n +998943632334","Qorabog'":"Umirzakov Axror \n +998949265401","Sog'lom":"Matxoliqov Javlon +998931738419","Taraqqiyot":"Roxatillayev Sherzodbek \n +998936273815","YABS":"Axmedov Jahongir \n +998949253675","Yangi go'shtsoy":"Mamasodikov Doston \n +998997259299","Yangi hayot":"Jamolov Avazbek \n +998885449898","Yangiobod":"Barkinov Farrux \n +998991074167","Yoshlik":"Chorshanbiyev Qudrat \n +998936004294"};

bot.command("start", async (ctx) => {
    const userId = ctx.from.id;
    userDatabase.add(userId);
    saveData();
    const kb = ADMINS.includes(userId) ? adminKeyboard : userKeyboard;
    await ctx.reply("Assalomu alaykum!", { reply_markup: kb });
});

bot.on("message", async (ctx) => {
    if (!ctx.from) return;
    const text = ctx.message.text || "";
    if (text === "⬅️ Orqaga") return ctx.reply("Asosiy menyu.", { reply_markup: ADMINS.includes(ctx.from.id) ? adminKeyboard : userKeyboard });
    if (text === "Mahallalar") return ctx.reply("Tanlang:", { reply_markup: mahallalar });
    if (text === "Ma'lumot") return ctx.reply("Tanlang:", { reply_markup: haqidaKeyboard });
    if (contactData[text]) return ctx.reply(contactData[text]);
});

// ... (rest of your code)

app.use("/webhook", webhookCallback(bot, "express"));

app.listen(PORT, "0.0.0.0", async () => {
    try {
        // EDIT THIS LINE ONLY: Change 'telebot-15k8' to your new name
        await bot.api.setWebhook(`https://angren_rasmiy.onrender.com/webhook`, { drop_pending_updates: true });
        console.log("✅ Webhook updated successfully!");
    } catch (err) {
        console.error("❌ Webhook error:", err);
    }
});

