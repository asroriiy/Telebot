const express = require("express"); 
const { Bot, Keyboard } = require("grammy");
const fs = require("fs");

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

const bot = new Bot("7196410668:AAE7H7dNMZ_dTDYapSb0JJlIXHqKEbVcENg");

const USERS_FILE = "./users.json";
const CHATS_FILE = "./chats.json";
const WARNS_FILE = "./warns.json";
const COOLDOWN_FILE = "./cooldowns.json";

const initFile = (path, initialData) => {
    if (!fs.existsSync(path)) fs.writeFileSync(path, JSON.stringify(initialData));
};
initFile(USERS_FILE, []);
initFile(CHATS_FILE, []);
initFile(WARNS_FILE, {});
initFile(COOLDOWN_FILE, {});

let userDatabase = new Set(JSON.parse(fs.readFileSync(USERS_FILE)));
let chatDatabase = new Set(JSON.parse(fs.readFileSync(CHATS_FILE)));
let warns = JSON.parse(fs.readFileSync(WARNS_FILE));
let cooldowns = JSON.parse(fs.readFileSync(COOLDOWN_FILE));

const saveData = () => {
    fs.writeFileSync(USERS_FILE, JSON.stringify(Array.from(userDatabase)));
    fs.writeFileSync(CHATS_FILE, JSON.stringify(Array.from(chatDatabase)));
    fs.writeFileSync(WARNS_FILE, JSON.stringify(warns));
    fs.writeFileSync(COOLDOWN_FILE, JSON.stringify(cooldowns));
};

const userKeyboard = new Keyboard().text("Yordam").text("Haqida").resized();
const adminKeyboard = new Keyboard().text("Yordam").text("Haqida").row().text("📊 Statistika").text("📢 Yangilik").resized();

bot.command("start", async (ctx) => {
    const userId = ctx.from.id;
    if (ctx.chat.type === "private") {
        userDatabase.add(userId);
        saveData();
        const isAdmin = ADMINS.includes(userId);
        const keyboard = isAdmin ? adminKeyboard : userKeyboard;
        await ctx.reply(`Assalomu alaykum, hurmatli ${ctx.from.first_name}, botga xush kelibsiz!`, { reply_markup: keyboard });
    } else {
        chatDatabase.add(ctx.chat.id);
        saveData();
        await ctx.reply("Bot guruhda faol! 🛡️");
    }
});

bot.command("send", async (ctx) => {
    if (!ADMINS.includes(ctx.from.id)) return;

    const rep = ctx.message.reply_to_message;
    if (!rep) return ctx.reply("❌ Xabarga reply qiling!");

    const targets = [...new Set([...userDatabase, ...chatDatabase])];
    await ctx.reply(`⏳ ${targets.length} ta manzilga yuborish boshlandi...`);

    let ok = 0;
    for (const tid of targets) {
        try {
            await bot.api.copyMessage(tid, ctx.chat.id, rep.message_id);
            ok++;
            if (ok % 25 === 0) await new Promise(r => setTimeout(r, 1000));
        } catch (e) {
            if (e.description?.includes("blocked") || e.description?.includes("chat not found")) {
                userDatabase.delete(tid);
                chatDatabase.delete(tid);
            }
        }
    }
    saveData(); 
    await ctx.reply(`✅ Jarayon yakunlandi: ${ok} ta joyga yetkazildi.`);
});

bot.on("message", async (ctx) => {
    const userId = ctx.from.id;
    const text = ctx.message.text || ctx.message.caption || "";
    const document = ctx.message.document; 
    const isAdmin = ADMINS.includes(userId);
    const isMenu = ["Yordam", "Haqida", "📊 Statistika", "📢 Yangilik"].includes(text);

    if (ctx.chat.type !== "private") {
        let isSpam = false;
        let reason = "";

        if (text && /(https?:\/\/[^\s]+|t\.me\/[^\s]+)/i.test(text)) {
            isSpam = true;
            reason = "Reklama tarqatish";
        }

        if (document && document.file_name && document.file_name.toLowerCase().endsWith(".apk")) {
            isSpam = true;
            reason = "APK fayl yuborish";
        }

        if (isSpam && !isAdmin) {
            const member = await ctx.getChatMember(userId);
            if (!["administrator", "creator"].includes(member.status)) {
                await ctx.deleteMessage().catch(() => {});
                warns[userId] = (warns[userId] || 0) + 1;
                saveData();
                return ctx.reply(`⚠️ ${ctx.from.first_name}, guruhda ${reason} taqiqlangan! (Ogohlantirish: ${warns[userId]})`);
            }
        }
        return; 
    }

    userDatabase.add(userId);
    saveData();

    if (isAdmin) {
        if (text === "📊 Statistika") {
            return ctx.reply(`📈 **Statistika:**\n👤 Foydalanuvchilar: ${userDatabase.size}\n👥 Guruhlar: ${chatDatabase.size}`);
        }
        if (text === "📢 Yangilik") {
            return ctx.reply("📢 Xabarga **Reply** qilib `/send` deb yozing.");
        }
    }

    if (text === "Yordam") return ctx.reply("🆘 Adminga yozish uchun shunchaki xabar yuboring.");
    if (text === "Haqida") return ctx.reply("🤖 Bu bot Angren shahar Yoshlar ishlari agentligi tomonidan tayyorlandi.");

    if (isAdmin && ctx.message.reply_to_message) {
        const replyMsg = ctx.message.reply_to_message.text || ctx.message.reply_to_message.caption || "";
        const targetId = replyMsg.match(/ID: (\d+)/)?.[1];
        if (targetId) {
            try {
                await bot.api.sendMessage(targetId, "🔔 **Admindan javob keldi:**");
                await bot.api.copyMessage(targetId, ctx.chat.id, ctx.message.message_id);
                return ctx.reply("Javob yuborildi! ✅");
            } catch (e) { return ctx.reply("❌ Xabar yuborilmadi."); }
        }
    }

    if (!isAdmin && !isMenu && !text.startsWith("/")) {
        const now = Date.now();
        const lastTime = cooldowns[userId] || 0;
        const oneDay = 24 * 60 * 60 * 1000;

        if (now - lastTime < oneDay) {
            const remaining = oneDay - (now - lastTime);
            const hours = Math.floor(remaining / (1000 * 60 * 60));
            const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
            return ctx.reply(`⚠️ Siz kuniga faqat 1 marta murojaat yubora olasiz. \n\nQayta urinish: ${hours} soat ${minutes} daqiqa.`);
        }

        const reportHeader = `📩 **Yangi murojaat!**\n👤 Ism: ${ctx.from.first_name}\n🆔 ID: ${userId}\n\n👇 Javob uchun reply qiling:`;
        for (const adminId of ADMINS) {
            try {
                await bot.api.sendMessage(adminId, reportHeader);
                await bot.api.copyMessage(adminId, ctx.chat.id, ctx.message.message_id);
            } catch (e) { console.log(`Admin ${adminId} botni bloklagan.`); }
        }
        
        cooldowns[userId] = now;
        saveData();
        return ctx.reply("Xabaringiz adminga yetkazildi! ✅");
    }
});

bot.catch((err) => console.error("Xatolik:", err));

bot.start();
console.log("Bot barqaror ishga tushdi...");

process.once('SIGINT', () => bot.stop());
process.once('SIGTERM', () => bot.stop());
