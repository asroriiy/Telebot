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
const mahallalar = new Keyboard().text("8-mart").text("Buston").row().text("Dorilfunun").text("Lashkarak").row().text("Samarchuq").text("Ulug'bek").row().text("Xakkarman").text("Bobotog'").row().text("Beruniy").text("Bog'i surh").row().text("Chotqol").text("Do'stlik").row().text("Go'zal").text("G'afur G'ulom").row().text("Grum").text("Gulbog'").row().text("Gulzor").text("Istiqbol").row().text("Istiqlol").text("Jigariston").row().text("Karvon").text("Kimyogar").row().text("Ko'k terak").text("Maydon").row().text("Mustaqillik").text("Namuna").row().text("Navbahor").text("Navro'z-1").row().text("Nurchi").text("Obliq").row().text("Obod").text("Oppartak").row().text("Ozodlik").text("Qorabog'").row().text("Sog'lom").text("Taraqqiyot").row().text("YABS").text("Yangi go'shtsoy").row().text("Yangi hayot").text("Yangiobod").row().text("Yoshlik")
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

    if (text === "Yordam") {
        const Keyboard = isAdmin ? adminKeyboard : userKeyboard;
        return ctx.reply("🆘 Mahallani tanlang." , {reply_markup: Keyboard}) 
    }
    if (text === "Haqida") return ctx.reply("🤖 Bu bot Angren shahar Yoshlar ishlari agentligi tomonidan tayyorlandi.");

    if (text === "8-mart") return ctx.reply("Mirmusayev Shaxzodbek Abdurashid o'g'li \n +998940341000");
    if (text === "Buston") return ctx.reply("Abdurahatov Shoxrux Abdurashid o'g'li \n +998994631289 ");
    if (text === "Dorilfunun") return ctx.reply("Ashurov Xasanbek Sayfiddin o'g'li \n +998944544411");
    if (text === "Lashkarak") return ctx.reply("Mirzakarimov Bexzod  Faxriddinovich \n +998999720860");
    if (text === "Samarchuq") return ctx.reply("Qo'chqorov Sardor Sherzod o'g'li \n +998945187727");
    if (text === "Ulug'bek") return ctx.reply("Abduvahabova Barno Erkinjon qizi \n +998999081294");
    if (text === "Xakkarman") return ctx.reply("Azimjonov Olimjon Azimjon o'g'li \n +998992615111 ");
    if (text === "Bobotog'") return ctx.reply("Muxitdinov Shoxruxbek To'lqinovich \n +998331777723 ");
    if (text === "Beruniy") return ctx.reply(" Tadjiyev Aloviddin Shavkatovich \n +998936285010 ");
    if (text === "Bog'i surh") return ctx.reply("Arabova Mohira Karimovna \n +998931673777 ");
    if (text === "Chotqol") return ctx.reply("Xayrullayev Durbek Ubaydulla o'g'li \n +998930050851 ");
    if (text === "Do'stlik") return ctx.reply("Rustamova Ruxsora Sobirjon qizi \n +998943239503 ");
    if (text === "Go'zal") return ctx.reply("Abduqaxxarov Dilmurod Umarali o'g'li \n +998991713676 ");
    if (text === "G'afur G'ulom") return ctx.reply("Yuldashaliyev Ixtiyar Baxtiyarovich \n +998900938600 ");
    if (text === "Grum") return ctx.reply("Qarshiboyev Sanjar Abdug'ani o'g'li  ");
    if (text === "Gulbog'") return ctx.reply("Abdumannobov Doston Davrom o'g'li \n +998940146144 ");
    if (text === "Gulzor") return ctx.reply("Axmedov Islombek Baxodir o'g'li \n +998943141144 ");
    if (text === "Istiqbol") return ctx.reply("Sheraliyev Diyorbek Zafar o'g'li \n +998900084200 ");
    if (text === "Istiqlol") return ctx.reply("Akromjonov Temurmalik Akromjon o'g'li \n +998944041016 ");
    if (text === "Jigariston") return ctx.reply("Uralov Husniddin Urazali o'g'li \n +998944246292 ");
    if (text === "Karvon") return ctx.reply("Boymatjonov Ahror Asqarjonovich \n +998945554045 ");
    if (text === "Kimyogar") return ctx.reply("Mingboyev Ma'ruf Tolib o'g'li \n +998931690914 ");
    if (text === "Ko'k terak") return ctx.reply("Axmedov Sulton Xasanboy O'gli \n +998990017144 ");
    if (text === "Maydon") return ctx.reply("Matqosimov Javlon Orifjonovich \n +998940383735");
    if (text === "Mustaqillik") return ctx.reply("Qurbonqulov Umidjon Shuhrat o'g'li \n +998931873673 ");
    if (text === "Namuna") return ctx.reply("Abdumalikov Sardor Murodjon o'g'li \n +998932829657 ");
    if (text === "Navbahor") return ctx.reply("Saydraxmanov Doston Saidibroximovich \n +998990996116");
    if (text === "Navro'z-1") return ctx.reply("Uralov Muhammadali Abdullajon o'g'li \n +998958661501 ");
    if (text === "Nurchi") return ctx.reply("Ashurboyev Asilbek Bahodiro'g'li \n +998936662124 ");
    if (text === "Obliq") return ctx.reply("Nazmiddinxonov Zayniddinxon Baxodir o'g'li \n +998949323130 ")
    if (text === "Obod") return ctx.reply("Madaminov Elyor Sherzod o'g'li \n +998909719717 ");
    if (text === "Oppartak") return ctx.reply("Siddikov Samandar Xamroqulovich \n +998949444740 ");
    if (text === "Ozodlik") return ctx.reply("Quvonov Ixtiyor Ilxamitdinovich \n +998943632334 ");
    if (text === "Qorabog'") return ctx.reply("Umirzakov Axror Abdumannop o'g'li \n +998949265401 ");
    if (text === "Sog'lom") return ctx.reply("Matxoliqov Javlon Jumaboy o'g'li +998931738419 ");
    if (text === "Taraqqiyot") return ctx.reply(" Roxatillayev Sherzodbek Farxod o'g'li \n +998936273815 ");
    if (text === "YABS") return ctx.reply("Axmedov Jahongir Mamasoli o'g'li \n +998949253675 ");
    if (text === "Yangi go'shtsoy") return ctx.reply("Mamasodikov Doston Dilshod o'g'li \n +998997259299 ");
    if (text === "Yangi hayot") return  ctx.reply("Jamolov Avazbek Azimjon o'g'li \n +998885449898 ");
    if (text === "Yangiobod") return ctx.reply("Barkinov Farrux Xayrulla o'g'li \n +998991074167 ");
    if (text === "Yoshlik") return ctx.reply("Chorshanbiyev Qudrat Alisherovich \n +998936004294");
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

