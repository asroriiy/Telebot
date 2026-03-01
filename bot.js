require('dotenv').config();
const { Bot, Keyboard, webhookCallback } = require("grammy");
const express = require("express");
const fs = require("fs").promises;
const path = require("path");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const MAIN_ADMIN = Number(process.env.MAIN_ADMIN);
const bot = new Bot(process.env.BOT_TOKEN);

const USERS_FILE = "./users.json";
const DATA_FILE = "./mahallaData.json";

// --- BAZANI TEKSHIRISH ---
async function initFiles() {
    try {
        await fs.access(USERS_FILE);
    } catch {
        await fs.writeFile(USERS_FILE, JSON.stringify({ private: [], groups: [] }, null, 2));
    }
}
initFiles();

// Mahalla ma'lumotlari
let mahallaData = [
    // ... (your existing mahalla data remains the same)
      {
    m: "G'afur G'ulom",
    members: {
      rais: "Zakirova G.H. +998942186775",
      hokim_yordamchisi: "Go'rog'liyev B.S. +998949909601",
      yoshlar_yetakchisi: "Yuldashaliyev I.B. +998900938600",
      xotin_qizlar: "Mirzaliyeva N.I. +998944262216",
      inspektor: "Yarkulov S.E. +998941649922",
      soliqchi: "Sanaqulov U.T. +998909481212",
      ijtimoiy_xodim: "Isambayeva M.S. +998943603673"
    }
  },
  {
    m: "Istiqlol",
    members: {
      rais: "Akromjonov T.A. +998944041016",
      hokim_yordamchisi: "Azizqulov I.T. +998944140027",
      yoshlar_yetakchisi: "Sharipov S.S. +998944002626",
      xotin_qizlar: "Karimova M.N. +998931150098",
      inspektor: "Abdivaliyev S.S. +998944034242",
      soliqchi: "Sanaqulov U.T. +998909481212",
      ijtimoiy_xodim: "Nuritdinova M.A. +998944122822"
    }
  },
  {
    m: "Istiqbol",
    members: {
      rais: "Nishanova M.X. +998901747478",
      hokim_yordamchisi: "Mirzamedov S.N. +998975988191",
      yoshlar_yetakchisi: "Sheraliyev D.Z. +998900084200",
      xotin_qizlar: "Tagayeva K.M. +998931894006",
      inspektor: "Kurbanov A.A. +998944998195",
      soliqchi: "Kosimov B.S. +998990020665",
      ijtimoiy_xodim: "Aliboyeva O.E. +998944064244"
    }
  },
  {
    m: "Oppartaq",
    members: {
      rais: "Saydaxmedov B.G'. +998931725515",
      hokim_yordamchisi: "Siddiqov S.X. +998949444740",
      yoshlar_yetakchisi: "Xonimqulov S.E. +998936275727",
      xotin_qizlar: "Siddiqova M.S. +998936001968",
      inspektor: "Atabayev S.U. +998942168388",
      soliqchi: "Karimov S.O. +998931150098",
      ijtimoiy_xodim: "Tojiddinova N.M. +998944114227"
    }
  },
  {
    m: "Chotqol",
    members: {
      rais: "Sattarov B.X. +998943677464",
      hokim_yordamchisi: "Xayrullayev D.U. +998930050851",
      yoshlar_yetakchisi: "Mamasoliyev M.B. +998991300096",
      xotin_qizlar: "Saydakulova Z.A. +998944246714",
      inspektor: "Maxamatov A.D. +998944030232",
      soliqchi: "Sanaqulov U.T. +998909481212",
      ijtimoiy_xodim: "Toshmetova O'.B. +998944122822"
    }
  },
  {
    m: "Taraqqiyot",
    members: {
      rais: "Roxatillayev S.F. +998936273815",
      hokim_yordamchisi: "Mirzakarimov B.F. +998999720860",
      yoshlar_yetakchisi: "Ergashev J.R. +998993950800",
      xotin_qizlar: "Abduraxmonova R.E. +998933930848",
      inspektor: "Qobilov S.B. +998944084422",
      soliqchi: "Xatamov I.I. +998941706666",
      ijtimoiy_xodim: "Xolmatova N.M. +998936005030"
    }
  },
  {
    m: "Beruniy",
    members: {
      rais: "Zakirov A.G. +998993666715",
      hokim_yordamchisi: "Tangirov S.S. +998938389983",
      yoshlar_yetakchisi: "Tadjiyev A.S. +998936285010",
      xotin_qizlar: "Ismoddinova G.G'. +998936041042",
      inspektor: "Shokirov Z.M. +998990856998",
      soliqchi: "Urazmatov D.S. +998937177292",
      ijtimoiy_xodim: "Xasanova M.O. +998998992669"
    }
  },
  {
    m: "Jigariston",
    members: {
      rais: "Babaraximova M.S. +998949321055",
      hokim_yordamchisi: "Bakirov A.J. +998936002086",
      yoshlar_yetakchisi: "Uralov H.U. +998944246292",
      xotin_qizlar: "Abdurahmanova S.A. +998936150982",
      inspektor: "Urazaliyev S.S. +998943311993",
      soliqchi: "Karimov S.O. +998931150098",
      ijtimoiy_xodim: "Raimkulova I.Z. +998936043602"
    }
  },
  {
    m: "Ulug'bek",
    members: {
      rais: "Hayitqulova R.A. +998944260725",
      hokim_yordamchisi: "Eshmuratovna D.E. +998935247474",
      yoshlar_yetakchisi: "Abduvahabova B.E. +99899081294",
      xotin_qizlar: "Bekova R.A. +998998807782",
      inspektor: "Masidiqov B.R. +998944168388",
      soliqchi: "Kasimov B.S. +998900424024",
      ijtimoiy_xodim: "Aliboyeva O.E. +998944064244"
    }
  },
  {
    m: "Navro'z",
    members: {
      rais: "Kaykieva X.S. +998994004333",
      hokim_yordamchisi: "Usmanov I.I. +998944010113",
      yoshlar_yetakchisi: "Uralov M.A. +998958661501",
      xotin_qizlar: "Kukanova I.B. +998978861225",
      inspektor: "Raimkulov A.A. +998949578090",
      soliqchi: "Xamraqulov A.S. +998946256575",
      ijtimoiy_xodim: "Nasrullayev A.A. +998942178788"
    }
  },
  {
    m: "8-mart",
    members: {
      rais: "Mirmusayev S.A. +998940341000",
      hokim_yordamchisi: "Axmedov S.X. +998990017144",
      yoshlar_yetakchisi: "Abduqaxxarov D.U. +998991713676",
      xotin_qizlar: "Jo'rayeva K.S. +998939992808",
      inspektor: "Shodiyev U.S. +998931895722",
      soliqchi: "Xatamov I.I. +998941706666",
      ijtimoiy_xodim: "Madasheva N.E. +998949262097"
    }
  },
  {
    m: "Bo'ston",
    members: {
      rais: "Abdurahatov S.A. +998994631289",
      hokim_yordamchisi: "Muxitdinov S.T. +998331777723",
      yoshlar_yetakchisi: "Tadjiyev A.S. +998936285010",
      xotin_qizlar: "Ismoddinova G.G'. +998936041042",
      inspektor: "Shokirov Z.M. +998990856998",
      soliqchi: "Urazmatov D.S. +998937177292",
      ijtimoiy_xodim: "Xasanova M.O. +998998992669"
    }
  },
  {
    m: "Dorilfunun",
    members: {
      rais: "Ashurov X.S. +998944544411",
      hokim_yordamchisi: "Bakirov A.J. +998936002086",
      yoshlar_yetakchisi: "Uralov H.U. +998944246292",
      xotin_qizlar: "Abdurahmanova S.A. +998936150982",
      inspektor: "Urazaliyev S.S. +998943311993",
      soliqchi: "Karimov S.O. +998931150098",
      ijtimoiy_xodim: "Raimkulova I.Z. +998936043602"
    }
  },
  {
    m: "Lashkarak",
    members: {
      rais: "Mirzakarimov B.F. +998999720860",
      hokim_yordamchisi: "Roxatillayev S.F. +998936273815",
      yoshlar_yetakchisi: "Ergashev J.R. +998993950800",
      xotin_qizlar: "Abduraxmonova R.E. +998933930848",
      inspektor: "Qobilov S.B. +998944084422",
      soliqchi: "Xatamov I.I. +998941706666",
      ijtimoiy_xodim: "Xolmatova N.M. +998936005030"
    }
  },
  {
    m: "Samarchuq",
    members: {
      rais: "Qo'chqorov S.S. +998945187727",
      hokim_yordamchisi: "Go'rog'liyev B.S. +998949909601",
      yoshlar_yetakchisi: "Yuldashaliyev I.B. +998900938600",
      xotin_qizlar: "Mirzaliyeva N.I. +998944262216",
      inspektor: "Yarkulov S.E. +998941649922",
      soliqchi: "Sanaqulov U.T. +998909481212",
      ijtimoiy_xodim: "Isambayeva M.S. +998943603673"
    }
  },
  {
    m: "Xakkarman",
    members: {
      rais: "Azimjonov O.A. +998992615111",
      hokim_yordamchisi: "Siddiqov S.X. +998949444740",
      yoshlar_yetakchisi: "Xonimqulov S.E. +998936275727",
      xotin_qizlar: "Siddiqova M.S. +998936001968",
      inspektor: "Atabayev S.U. +998942168388",
      soliqchi: "Karimov S.O. +998931150098",
      ijtimoiy_xodim: "Tojiddinova N.M. +998944114227"
    }
  },
  {
    m: "Bobotog'",
    members: {
      rais: "Muxitdinov S.T. +998331777723",
      hokim_yordamchisi: "Abdurahatov S.A. +998994631289",
      yoshlar_yetakchisi: "Tadjiyev A.S. +998936285010",
      xotin_qizlar: "Ismoddinova G.G'. +998936041042",
      inspektor: "Shokirov Z.M. +998990856998",
      soliqchi: "Urazmatov D.S. +998937177292",
      ijtimoiy_xodim: "Xasanova M.O. +998998992669"
    }
  },
  {
    m: "Bog'i surh",
    members: {
      rais: "Arabova M.K. +998931673777",
      hokim_yordamchisi: "Xayrullayev D.U. +998930050851",
      yoshlar_yetakchisi: "Mamasoliyev M.B. +998991300096",
      xotin_qizlar: "Saydakulova Z.A. +998944246714",
      inspektor: "Maxamatov A.D. +998944030232",
      soliqchi: "Sanaqulov U.T. +998909481212",
      ijtimoiy_xodim: "Toshmetova O'.B. +998944122822"
    }
  },
  {
    m: "Do'stlik",
    members: {
      rais: "Rustamova R.S. +998943239503",
      hokim_yordamchisi: "Nishanova M.X. +998901747478",
      yoshlar_yetakchisi: "Sheraliyev D.Z. +998900084200",
      xotin_qizlar: "Tagayeva K.M. +998931894006",
      inspektor: "Kurbanov A.A. +998944998195",
      soliqchi: "Kosimov B.S. +998990020665",
      ijtimoiy_xodim: "Aliboyeva O.E. +998944064244"
    }
  },
  {
    m: "Go'zal",
    members: {
      rais: "Dushayeva X.M. +998770684004",
      hokim_yordamchisi: "Murodov D.M. +998933149000",
      yoshlar_yetakchisi: "Abduqaxxarov D.U. +998991713676",
      xotin_qizlar: "Jo'rayeva K.S. +998939992808",
      inspektor: "Shodiyev U.S. +998931895722",
      soliqchi: "Xatamov I.I. +998941706666",
      ijtimoiy_xodim: "Madasheva N.E. +998949262097"
    }
  },
  {
    m: "Grum",
    members: {
      rais: "Qarshiboyev S.A. +998900000000",
      hokim_yordamchisi: "Zakirova G.H. +998942186775",
      yoshlar_yetakchisi: "Yuldashaliyev I.B. +998900938600",
      xotin_qizlar: "Mirzaliyeva N.I. +998944262216",
      inspektor: "Yarkulov S.E. +998941649922",
      soliqchi: "Sanaqulov U.T. +998909481212",
      ijtimoiy_xodim: "Isambayeva M.S. +998943603673"
    }
  },
  {
    m: "Gulbog'",
    members: {
      rais: "Abdumannobov D.D. +998940146144",
      hokim_yordamchisi: "Akromjonov T.A. +998944041016",
      yoshlar_yetakchisi: "Sharipov S.S. +998944002626",
      xotin_qizlar: "Karimova M.N. +998931150098",
      inspektor: "Abdivaliyev S.S. +998944034242",
      soliqchi: "Sanaqulov U.T. +998909481212",
      ijtimoiy_xodim: "Nuritdinova M.A. +998944122822"
    }
  },
  {
    m: "Gulzor",
    members: {
      rais: "Axmedov I.B. +998943141144",
      hokim_yordamchisi: "Saydaxmedov B.G'. +998931725515",
      yoshlar_yetakchisi: "Xonimqulov S.E. +998936275727",
      xotin_qizlar: "Siddiqova M.S. +998936001968",
      inspektor: "Atabayev S.U. +998942168388",
      soliqchi: "Karimov S.O. +998931150098",
      ijtimoiy_xodim: "Tojiddinova N.M. +998944114227"
    }
  },
  {
    m: "Karvon",
    members: {
      rais: "Boymatjonov A.A. +998945554045",
      hokim_yordamchisi: "Sattarov B.X. +998943677464",
      yoshlar_yetakchisi: "Mamasoliyev M.B. +998991300096",
      xotin_qizlar: "Saydakulova Z.A. +998944246714",
      inspektor: "Maxamatov A.D. +998944030232",
      soliqchi: "Sanaqulov U.T. +998909481212",
      ijtimoiy_xodim: "Toshmetova O'.B. +998944122822"
    }
  },
  {
    m: "Kimyogar",
    members: {
      rais: "Mingboyev M.T. +998931690914",
      hokim_yordamchisi: "Roxatillayev S.F. +998936273815",
      yoshlar_yetakchisi: "Ergashev J.R. +998993950800",
      xotin_qizlar: "Abduraxmonova R.E. +998933930848",
      inspektor: "Qobilov S.B. +998944084422",
      soliqchi: "Xatamov I.I. +998941706666",
      ijtimoiy_xodim: "Xolmatova N.M. +998936005030"
    }
  },
  {
    m: "Ko'k terak",
    members: {
      rais: "Axmedov S.X. +998990017144",
      hokim_yordamchisi: "Mirmusayev S.A. +998940341000",
      yoshlar_yetakchisi: "Abduqaxxarov D.U. +998991713676",
      xotin_qizlar: "Jo'rayeva K.S. +998939992808",
      inspektor: "Shodiyev U.S. +998931895722",
      soliqchi: "Xatamov I.I. +998941706666",
      ijtimoiy_xodim: "Madasheva N.E. +998949262097"
    }
  },
  {
    m: "Maydon",
    members: {
      rais: "Mengliyev I.M. +998936075351",
      hokim_yordamchisi: "Haitkulova I.G. +998930809001",
      yoshlar_yetakchisi: "Matqosimov J.O. +998940383735",
      xotin_qizlar: "Akbarxonova I.T. +998943679772",
      inspektor: "Jumabaev R.O'. +998944867733",
      soliqchi: "Xatamov I.I. +998941706666",
      ijtimoiy_xodim: "Maraximova S.A. +998936668287"
    }
  },
  {
    m: "Mustaqillik",
    members: {
      rais: "Qurbonqulov U.S. +998931873673",
      hokim_yordamchisi: "Zakirov A.G. +998993666715",
      yoshlar_yetakchisi: "Tadjiyev A.S. +998936285010",
      xotin_qizlar: "Ismoddinova G.G'. +998936041042",
      inspektor: "Shokirov Z.M. +998990856998",
      soliqchi: "Urazmatov D.S. +998937177292",
      ijtimoiy_xodim: "Xasanova M.O. +998998992669"
    }
  },
  {
    m: "Namuna",
    members: {
      rais: "Abdumalikov S.M. +998932829657",
      hokim_yordamchisi: "Babaraximova M.S. +998949321055",
      yoshlar_yetakchisi: "Uralov H.U. +998944246292",
      xotin_qizlar: "Abdurahmanova S.A. +998936150982",
      inspektor: "Urazaliyev S.S. +998943311993",
      soliqchi: "Karimov S.O. +998931150098",
      ijtimoiy_xodim: "Raimkulova I.Z. +998936043602"
    }
  },
  {
    m: "Navbahor",
    members: {
      rais: "Saydraxmanov D.S. +998990996116",
      hokim_yordamchisi: "Hayitqulova R.A. +998944260725",
      yoshlar_yetakchisi: "Sheraliyev D.Z. +998900084200",
      xotin_qizlar: "Abduvahabova B.E. +99899081294",
      inspektor: "Masidiqov B.R. +998944168388",
      soliqchi: "Kasimov B.S. +998900424024",
      ijtimoiy_xodim: "Aliboyeva O.E. +998944064244"
    }
  },
  {
    m: "Nurchi",
    members: {
      rais: "Ashurboyev A.B. +998936662124",
      hokim_yordamchisi: "Kaykieva X.S. +998994004333",
      yoshlar_yetakchisi: "Uralov M.A. +998958661501",
      xotin_qizlar: "Kukanova I.B. +998978861225",
      inspektor: "Raimkulov A.A. +998949578090",
      soliqchi: "Xamraqulov A.S. +998946256575",
      ijtimoiy_xodim: "Nasrullayev A.A. +998942178788"
    }
  },
  {
    m: "Obliq",
    members: {
      rais: "Nazmiddinxonov Z.B. +998949323130",
      hokim_yordamchisi: "Mirmusayev S.A. +998940341000",
      yoshlar_yetakchisi: "Abduqaxxarov D.U. +998991713676",
      xotin_qizlar: "Jo'rayeva K.S. +998939992808",
      inspektor: "Shodiyev U.S. +998931895722",
      soliqchi: "Xatamov I.I. +998941706666",
      ijtimoiy_xodim: "Madasheva N.E. +998949262097"
    }
  },
  {
    m: "Obod",
    members: {
      rais: "Eshmuratov X.M. +998931723680",
      hokim_yordamchisi: "Nurmatov M.Z. +998937025251",
      yoshlar_yetakchisi: "Madaminov E.S. +998909719717",
      xotin_qizlar: "Bekova R.A. +998998807782",
      inspektor: "Sadikov S.A. +998944123264",
      soliqchi: "Kosimov B.S. +998990020665",
      ijtimoiy_xodim: "Madasheva N.E. +998949262097"
    }
  },
  {
    m: "Ozodlik",
    members: {
      rais: "Quvonov I.I. +998943632334",
      hokim_yordamchisi: "Abdurahatov S.A. +998994631289",
      yoshlar_yetakchisi: "Tadjiyev A.S. +998936285010",
      xotin_qizlar: "Ismoddinova G.G'. +998936041042",
      inspektor: "Shokirov Z.M. +998990856998",
      soliqchi: "Urazmatov D.S. +998937177292",
      ijtimoiy_xodim: "Xasanova M.O. +998998992669"
    }
  },
  {
    m: "Qorabog'",
    members: {
      rais: "Umirzakov A.A. +998949265401",
      hokim_yordamchisi: "Sattarov B.X. +998943677464",
      yoshlar_yetakchisi: "Mamasoliyev M.B. +998991300096",
      xotin_qizlar: "Saydakulova Z.A. +998944246714",
      inspektor: "Maxamatov A.D. +998944030232",
      soliqchi: "Sanaqulov U.T. +998909481212",
      ijtimoiy_xodim: "Toshmetova O'.B. +998944122822"
    }
  },
  {
    m: "Sog'lom",
    members: {
      rais: "Matxoliqov J.J. +998931738419",
      hokim_yordamchisi: "Roxatillayev S.F. +998936273815",
      yoshlar_yetakchisi: "Ergashev J.R. +998993950800",
      xotin_qizlar: "Abduraxmonova R.E. +998933930848",
      inspektor: "Qobilov S.B. +998944084422",
      soliqchi: "Xatamov I.I. +998941706666",
      ijtimoiy_xodim: "Xolmatova N.M. +998936005030"
    }
  },
  {
    m: "YABS",
    members: {
      rais: "Axmedov J.M. +998949253675",
      hokim_yordamchisi: "Mengliyev I.M. +998936075351",
      yoshlar_yetakchisi: "Matqosimov J.O. +998940383735",
      xotin_qizlar: "Akbarxonova I.T. +998943679772",
      inspektor: "Jumabaev R.O'. +998944867733",
      soliqchi: "Xatamov I.I. +998941706666",
      ijtimoiy_xodim: "Maraximova S.A. +998936668287"
    }
  },
  {
    m: "Yoshlik",
    members: {
      rais: "Chorshanbiyev Q.A. +998936004294",
      hokim_yordamchisi: "Eshmuratov X.M. +998931723680",
      yoshlar_yetakchisi: "Madaminov E.S. +998909719717",
      xotin_qizlar: "Bekova R.A. +998998807782",
      inspektor: "Sadikov S.A. +998944123264",
      soliqchi: "Kosimov B.S. +998990020665",
      ijtimoiy_xodim: "Madasheva N.E. +998949262097"
    }
  }
];

// --- FUNKSIYALAR ---

async function registerUser(ctx) {
    try {
        const data = JSON.parse(await fs.readFile(USERS_FILE, 'utf8'));
        const chatId = ctx.chat.id;
        const chatType = ctx.chat.type;
        
        // Guruh yoki shaxsiy ekanligini aniqlash
        const key = (chatType === "group" || chatType === "supergroup") ? "groups" : "private";
        
        // Faqat mavjud bo'lmasa qo'shish
        if (!data[key].includes(chatId)) {
            data[key].push(chatId);
            await fs.writeFile(USERS_FILE, JSON.stringify(data, null, 2));
            console.log(`Yangi foydalanuvchi qo'shildi: ${chatId} (${key})`);
        }
    } catch (error) {
        console.error("Foydalanuvchini ro'yxatga olishda xato:", error);
    }
}

// Chiroyli formatlash funksiyasi
function formatMahallaInfo(mahalla) {
    return `📍 <b>${mahalla.m} mahallasi mas'ullari:</b>\n\n` +
        `👤 <b>Rais:</b> ${mahalla.members.rais}\n` +
        `💼 <b>Hokim yordamchisi:</b> ${mahalla.members.hokim_yordamchisi}\n` +
        `👔 <b>Yoshlar yetakchisi:</b> ${mahalla.members.yoshlar_yetakchisi}\n` +
        `👩‍💼 <b>Xotin-qizlar faoli:</b> ${mahalla.members.xotin_qizlar}\n` +
        `👮 <b>Inspektor:</b> ${mahalla.members.inspektor}\n` +
        `💰 <b>Soliqchi:</b> ${mahalla.members.soliqchi}\n` +
        `🤝 <b>Ijtimoiy xodim:</b> ${mahalla.members.ijtimoiy_xodim}`;
}

// --- KEYBOARDLAR ---
const adminKb = new Keyboard()
    .text("📍 Mahallalar").row()
    .text("ℹ️ Ma'lumot").row()
    .text("📊 Statistika").text("📢 Xabar tarqatish").resized();

const userKb = new Keyboard()
    .text("📍 Mahallalar").row()
    .text("ℹ️ Ma'lumot").resized();

const backBtn = "⬅️ Orqaga";

// Mahallalar klaviaturasi
const makeMahallaKb = () => {
    const kb = new Keyboard();
    mahallaData.forEach((item, i) => {
        kb.text(item.m);
        if ((i + 1) % 2 === 0) kb.row();
    });
    return kb.row().text(backBtn).resized();
};

// --- XABAR TARQATISH UCHUN HOLAT ---
let broadcastingUser = null; // Xabar tarqatayotgan admin ID si

// --- ESHITUVCHILAR ---

bot.command("start", async (ctx) => {
    await registerUser(ctx);
    const kb = ctx.from.id === MAIN_ADMIN ? adminKb : userKb;
    await ctx.reply(
        "Assalomu alaykum! Angren shahri mahalla yettiligi ma'lumotlar botiga xush kelibsiz.",
        { reply_markup: kb }
    );
});

bot.command("cancel", async (ctx) => {
    if (broadcastingUser === ctx.from.id) {
        broadcastingUser = null;
        await ctx.reply("❌ Xabar tarqatish bekor qilindi.");
    }
});

bot.hears("📍 Mahallalar", async (ctx) => {
    await ctx.reply("Mahallani tanlang:", { reply_markup: makeMahallaKb() });
});

// Mahalla ma'lumotlarini ko'rsatish
bot.hears(mahallaData.map(m => m.m), async (ctx) => {  // To'g'ridan-to'g'ri hears bilan
    const mahalla = mahallaData.find(x => x.m === ctx.message.text);
    if (mahalla) {
        await ctx.reply(formatMahallaInfo(mahalla), { parse_mode: "HTML" });
    }
});

bot.hears("📊 Statistika", async (ctx) => {
    if (ctx.from.id !== MAIN_ADMIN) return;
    
    try {
        const data = JSON.parse(await fs.readFile(USERS_FILE, 'utf8'));
        const total = data.private.length + data.groups.length;
        await ctx.reply(
            `📊 <b>Statistika:</b>\n\n` +
            `👤 Shaxsiy: ${data.private.length}\n` +
            `👥 Guruhlar: ${data.groups.length}\n` +
            `🏁 Jami: ${total}`,
            { parse_mode: "HTML" }
        );
    } catch (error) {
        console.error("Statistika olishda xato:", error);
        await ctx.reply("❌ Xatolik yuz berdi.");
    }
});

bot.hears("📢 Xabar tarqatish", async (ctx) => {
    if (ctx.from.id !== MAIN_ADMIN) return;
    
    broadcastingUser = ctx.from.id;
    await ctx.reply(
        "📝 Xabaringizni yuboring (yoki bekor qilish uchun /cancel):\n\n" +
        "✅ Matn, rasm, video yoki boshqa turdagi xabarlarni yuborishingiz mumkin."
    );
});

// Xabar tarqatish - har qanday turdagi xabarni qabul qilish
bot.on("message", async (ctx) => {
    // Agar broadcasting holatda bo'lmasa, hech narsa qilma
    if (broadcastingUser !== ctx.from.id) return;
    
    // Bekor qilish komandasi /cancel bilan alohida ishlanadi
    if (ctx.message.text === "/cancel") return;
    
    try {
        const data = JSON.parse(await fs.readFile(USERS_FILE, 'utf8'));
        const users = [...data.private, ...data.groups];
        
        broadcastingUser = null; // Broadcast holatini to'xtatish
        
        const sentMsg = await ctx.reply(`🚀 Xabar tarqatilmoqda... (${users.length} ta oluvchi)`);
        
        let success = 0;
        let failed = 0;
        
        for (const userId of users) {
            try {
                // CopyMessage orqali xabarni nusxalash
                await bot.api.copyMessage(userId, ctx.chat.id, ctx.message.message_id);
                success++;
                
                // Telegram rate limitiga rioya qilish
                if (success % 20 === 0) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            } catch (error) {
                failed++;
                console.log(`Xatolik: ${userId} ga yuborilmadi - ${error.message}`);
            }
        }
        
        // Natijani yangilash
        await ctx.api.editMessageText(
            ctx.chat.id,
            sentMsg.message_id,
            `✅ Xabar tarqatish tugadi!\n\n` +
            `📊 Natijalar:\n` +
            `✅ Yetkazildi: ${success}\n` +
            `❌ Yetkazilmadi: ${failed}\n` +
            `👥 Jami: ${users.length}`
        );
        
    } catch (error) {
        console.error("Xabar tarqatishda xato:", error);
        broadcastingUser = null;
        await ctx.reply("❌ Xatolik yuz berdi. Qaytadan urinib ko'ring.");
    }
});

bot.hears(backBtn, async (ctx) => {
    const kb = ctx.from.id === MAIN_ADMIN ? adminKb : userKb;
    await ctx.reply("Asosiy menyu:", { reply_markup: kb });
});

bot.hears("ℹ️ Ma'lumot", async (ctx) => {
    await ctx.reply(
        "🤖 <b>Bot haqida:</b>\n\n" +
        "Bu bot Angren shahri mahalla yettiligi ma'lumotlarini taqdim etadi.\n\n" +
        "📌 <b>Buyruqlar:</b>\n" +
        "📍 Mahallalar - Mahalla ro'yxati\n" +
        "ℹ️ Ma'lumot - Bot haqida ma'lumot\n" +
        (ctx.from.id === MAIN_ADMIN ? "📊 Statistika - Bot statistikasi\n📢 Xabar tarqatish - Xabar tarqatish\n" : "") +
        "⬅️ Orqaga - Asosiy menyuga qaytish",
        { parse_mode: "HTML" }
    );
});

// Xatolarni ushlash
bot.catch((err) => {
    console.error("Bot xatosi:", err);
});

// Webhook va Server
app.use("/webhook", webhookCallback(bot, "express"));

app.listen(PORT, () => {
    console.log(`Bot ${PORT} portda ishga tushdi...`);
    console.log(`Webhook: /webhook`);
});
