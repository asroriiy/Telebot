<!DOCTYPE html>
<html lang="uz">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mahalla Yoshlar Portali</title>
    <style>
        :root { --primary: #2c3e50; --accent: #3498db; --success: #27ae60; --bg: #f4f7f6; --white: #ffffff; }
        body { font-family: sans-serif; background: var(--bg); margin: 0; display: flex; flex-direction: column; align-items: center; }
        header { background: var(--primary); color: white; width: 100%; padding: 10px 5%; display: flex; justify-content: space-between; align-items: center; box-sizing: border-box; cursor: pointer; }
        .container { width: 90%; max-width: 500px; background: white; margin: 20px; padding: 20px; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
        .menu-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        button { padding: 12px; border: none; border-radius: 5px; background: var(--accent); color: white; font-weight: bold; cursor: pointer; }
        input, select, textarea { width: 100%; padding: 10px; margin: 5px 0 15px; border: 1px solid #ccc; border-radius: 5px; box-sizing: border-box; }
        .hidden { display: none; }
        .murojaat-btn { background: var(--success); grid-column: span 2; }
    </style>
</head>
<body>
<header>
    <div onclick="showMenu('main')">Mahalla Portali</div>
    <div id="header-user-name" onclick="handleProfileClick()">Kirish</div>
</header>
<div class="container">
    <div id="main-menu" class="menu-grid">
        <button onclick="alert('Mahallalar ro\'yxati yaqinda!')">Mahallalar</button>
        <button onclick="alert('Portal haqida ma\'lumot')">Ma'lumot</button>
        <button class="murojaat-btn" onclick="checkLimitAndShowMurojaat()">✍️ Murojaat yo'llash</button>
    </div>

    <div id="login-menu" class="hidden">
        <input type="tel" id="login-phone" placeholder="Telefon (998...)">
        <input type="password" id="login-pass" placeholder="Parol">
        <button onclick="login()" style="width:100%">Kirish</button>
        <p onclick="showMenu('register')" style="text-align:center; color:blue; cursor:pointer">Ro'yxatdan o'tish</p>
    </div>

    <div id="register-menu" class="hidden">
        <p style="font-size: 0.8rem; color: #666;">Kod botga yuborilishi uchun botga /start bosing.</p>
        <input type="tel" id="reg-phone" placeholder="998901234567">
        <button id="send-otp-btn" onclick="sendOTP()" style="width:100%">Kod yuborish</button>
        <div id="otp-section" class="hidden">
            <input type="number" id="reg-otp" placeholder="Kod">
            <input type="text" id="reg-name" placeholder="F.I.SH">
            <input type="password" id="reg-pass" placeholder="Yangi parol">
            <button onclick="verifyAndRegister()" style="width:100%; background:var(--success)">Tasdiqlash</button>
        </div>
    </div>

    <div id="murojaat-menu" class="hidden">
        <form id="complaintForm">
            <select name="mahalla" id="user-mahalla" required>
                <option value="">Mahallani tanlang</option>
                <option value="Navro'z">Navro'z</option>
                <option value="Istiqlol">Istiqlol</option>
            </select>
            <textarea name="text" placeholder="Murojaat matni..." rows="4" required></textarea>
            <input type="file" name="evidence" accept="image/*,video/*">
            <button type="submit" style="width:100%; background:var(--success)">Yuborish</button>
        </form>
    </div>

    <div id="profile-panel" class="hidden">
        <h3 id="panel-name"></h3>
        <button onclick="logout()" style="width:100%; background:red">Chiqish</button>
    </div>
</div>

<script>
    let currentUser = JSON.parse(localStorage.getItem('portalUser'));
    const menus = ['main-menu','login-menu','register-menu','murojaat-menu','profile-panel'];

    function showMenu(id) {
        menus.forEach(m => document.getElementById(m).classList.add('hidden'));
        const target = id.includes('-') ? id : id + '-menu';
        document.getElementById(target).classList.remove('hidden');
    } 

    function handleProfileClick() { 
        if(currentUser) {
            document.getElementById('panel-name').innerText = currentUser.fullname;
            showMenu('profile-panel');
        } else {
            showMenu('login');
        }
    }

    function checkLimitAndShowMurojaat() {
        if(!currentUser) return showMenu('login');
        showMenu('murojaat');
    }

    async function sendOTP() {
        const phone = document.getElementById('reg-phone').value;
        const res = await fetch('/api/send-otp', { 
            method:'POST', 
            headers:{'Content-Type':'application/json'}, 
            body:JSON.stringify({phone}) 
        });
        const data = await res.json();
        if(res.ok) { 
            document.getElementById('otp-section').classList.remove('hidden'); 
            alert("Kod botingizga yuborildi!"); 
        } else {
            alert(data.msg || "Xatolik yuz berdi");
        }
    }

    async function verifyAndRegister() {
        const payload = { 
            phone: document.getElementById('reg-phone').value, 
            otp: document.getElementById('reg-otp').value, 
            fullname: document.getElementById('reg-name').value, 
            password: document.getElementById('reg-pass').value 
        };
        const res = await fetch('/api/register', { 
            method:'POST', 
            headers:{'Content-Type':'application/json'}, 
            body:JSON.stringify(payload) 
        });
        if(res.ok) {
            const data = await res.json();
            localStorage.setItem('portalUser', JSON.stringify(data.user));
            location.reload();
        } else {
            alert("Xato yoki kod noto'g'ri!");
        }
    }

    async function login() {
        const phone = document.getElementById('login-phone').value;
        const pass = document.getElementById('login-pass').value;
        const res = await fetch('/api/login', { 
            method:'POST', 
            headers:{'Content-Type':'application/json'}, 
            body:JSON.stringify({phone, pass}) 
        });
        const data = await res.json();
        if(data.success) { 
            localStorage.setItem('portalUser', JSON.stringify(data.user)); 
            location.reload(); 
        } else {
            alert("Telefon yoki parol xato!");
        }
    }

    // Form submission logic
    document.getElementById('complaintForm').onsubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        formData.append('fullname', currentUser.fullname);
        formData.append('phone', currentUser.phone);

        const res = await fetch('/api/murojaat', { method: 'POST', body: formData });
        if(res.ok) {
            alert("Murojaat yuborildi!");
            showMenu('main');
            e.target.reset();
        } else {
            alert("Yuborishda xatolik");
        }
    };

    function logout() { localStorage.removeItem('portalUser'); location.reload(); }
    document.getElementById('header-user-name').innerText = currentUser ? currentUser.fullname : "Kirish";
</script>
</body>
</html>
