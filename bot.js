const express = require("express");
const { Bot, Keyboard } = require("grammy");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => res.send("Bot is running..."));
app.listen(PORT, () =>
    console.log(`🌐 Web server ishga tushdi: ${PORT}`)
);

const ADMINS = [
    "6235292618", 
    "624184607",  
    "1202479635", 
    "8396868638"  
];

const isAdmin = (ctx) => ADMINS.includes(String(ctx.from.id));

const bot = new Bot("TOKENNI_BU_YERGA_QO‘Y");

const USERS_FILE = "./users.json";
const CHATS_FILE = "./chats.json";
const WARNS_FILE = "./warns.json";

const initFile = (path, data) => {
    if (!fs.existsSync(path)) {
        fs.writeFileSync(path, JSON.stringify(data, null, 2));
    }
};

initFile(USERS_FILE, []);
initFile(CHATS_FILE, []);
initFile(WARNS_FILE, {});

let users = new Set(JSON.parse(fs.readFileSync(USERS_FILE)));
let chats = new Set(JSON.parse(fs.readFileSync(CHATS_FILE)));
let warns = JSON.parse(fs.readFileSync(WARNS_FILE));

const saveData = () => {
    fs.writeFileSync(USERS_FILE, JSON.stringify([...users], null, 2));
    fs.writeFileSync(CHATS_FILE, JSON.stringify([...chats], null, 2));
    fs.writeFileSync(WARNS_FILE, JSON.stringify([...warns], null, 2));
};

const userKeyboard = new Keyboard()
    .text("Yordam")
    .text("Haqida")
    .resized();

const adminKeyboard = new Keyboard()
    .text("Yordam")
    .text("Haqida")
    .row()
    .text("📊 Statistika")
    .text("📢 Yangilik")
    .resized();

bot.command("start", async (ctx) => {
    if (ctx.chat.type !== "private") return;

    const uid = String(ctx.from.id);
    users.add(uid);
    saveData();

    const keyboard = isAdmin(ctx) ? adminKeyboard : userKeyboard;

    await ctx.reply(
        `Assalomu alaykum, ${ctx.from.first_name}! 👋`,
        { reply_markup: keyboard }
    );
});

bot.command("send", async (ctx) => {
    if (!isAdmin(ctx)) return;

    const rep = ctx.message.reply_to_message;
    if (!rep) return ctx.reply("❌ Xabarga reply qiling!");

    const targets = [...new Set([...users, ...chats])];
    let sent = 0;

    await ctx.reply(`⏳ ${targets.length} ta joyga yuborilmoqda...`);

    for (const id of targets) {
        try {
            await bot.api.copyMessage(id, ctx.chat.id, rep.message_id);
            sent++;
            if (sent % 25 === 0)
                await new Promise(r => setTimeout(r, 1000));
        } catch {}
    }

    await ctx.reply(`✅ Yuborildi: ${sent} ta`);
});

bot.on("message", async (ctx) => {
    const uid = String(ctx.from.id);
    const text = ctx.message.text || ctx.message.caption || "";
    const admin = isAdmin(ctx);

    if (ctx.chat.type !== "private") {
        chats.add(String(ctx.chat.id));
        saveData();
        return;
    }

    users.add(uid);
    saveData();

    if (admin) {
        if (text === "📊 Statistika") {
            return ctx.reply(
                `📊 Statistika\n👤 Users: ${users.size}\n👥 Groups: ${chats.size}`
            );
        }

        if (text === "📢 Yangilik") {
            return ctx.reply("📢 Xabarga reply qilib /send yozing");
        }
    }

    if (text === "Yordam")
        return ctx.reply("🆘 Savolingizni yozing, adminlar ko‘radi.");

    if (text === "Haqida")
        return ctx.reply("🤖 Bu bot Angren shahar Yoshlar ishlari agentligi tomonidan tayyorlandi. \n Instagram sahifamiz https://www.instagram.com/angren_rasmiy?igsh=MWl5c3Z2amJvcmo3dQ== \n Telegram sahifamiz: @angren_rasmiy");

    if (!admin && !text.startsWith("/")) {
        const header =
            `📩 Yangi murojaat\n` +
            `👤 ${ctx.from.first_name}\n` +
            `🆔 ID: ${uid}\n\n`;

        for (const adminId of ADMINS) {
            try {
                await bot.api.sendMessage(adminId, header);
                await bot.api.copyMessage(adminId, ctx.chat.id, ctx.message.message_id);
            } catch {}
        }

        return ctx.reply("✅ Xabaringiz adminga yuborildi");
    }
});

bot.catch(err => console.error("❌ Xatolik:", err));
bot.start();

process.once("SIGINT", () => bot.stop());
process.once("SIGTERM", () => bot.stop());

console.log("🤖 Bot ishga tushdi");
