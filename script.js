// Database State Keranjang Belanjaan
let cart = [];
const ownerWhatsApp = "6285133431132";

// DOM Elemen Picker
const cartCount = document.getElementById('cart-count');
const cartItemsContainer = document.getElementById('cart-items');
const cartTotal = document.getElementById('cart-total');
const addToCartButtons = document.querySelectorAll('.add-to-cart');
const checkoutBtn = document.getElementById('checkout-btn');

// Inisialisasi Event Klik Tambah Barang
if (addToCartButtons) {
    addToCartButtons.forEach(button => {
        button.addEventListener('click', () => {
            const id = button.getAttribute('data-id');
            const name = button.getAttribute('data-name');
            const price = parseInt(button.getAttribute('data-price'));

            const existingProduct = cart.find(item => item.id === id);

            if (existingProduct) {
                existingProduct.quantity += 1;
            } else {
                cart.push({ id, name, price, quantity: 1 });
            }

            renderCart();
            flashNavCart();
        });
    });
}

// Efek Kilat Kecil Pada Icon Navbar Saat Barang Ditambah
function flashNavCart() {
    const cartNav = document.querySelector('.cart-nav');
    if (cartNav) {
        cartNav.style.textShadow = "0 0 20px #00f0ff, 0 0 30px #00f0ff";
        setTimeout(() => {
            cartNav.style.textShadow = "0 0 10px #00f0ff";
        }, 300);
    }
}

// Render Ulang Tampilan Interface List Keranjang
function renderCart() {
    const totalQty = cart.reduce((acc, item) => acc + item.quantity, 0);
    if (cartCount) cartCount.textContent = totalQty;

    if (cartItemsContainer) cartItemsContainer.innerHTML = '';

    if (cart.length === 0) {
        if (cartItemsContainer) cartItemsContainer.innerHTML = `<li class="empty-msg">Belum ada modul item terpasang di sistem keranjang.</li>`;
        if (cartTotal) cartTotal.textContent = "Rp 0";
        updateFrontDisplays(); 
        return;
    }

    let calculatedTotal = 0;

    cart.forEach(item => {
        const subTotal = item.price * item.quantity;
        calculatedTotal += subTotal;

        const li = document.createElement('li');
        li.style.display = "flex";
        li.style.justifyContent = "space-between";
        li.style.alignItems = "center";
        li.style.marginBottom = "10px";
        li.style.width = "100%";

        li.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px;">
                <button class="decrease-item-btn" onclick="decreaseItem('${item.id}')" style="padding: 2px 7px; font-size: 11px; background: #ff0055; color: #fff; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; box-shadow: 0 0 5px #ff0055;">-</button>
                <span class="neon-text-blue">[x${item.quantity}]</span> 
                <span style="font-size: 14px; color: #fff;">${item.name}</span>
            </div>
            <div>
                <span style="font-size: 14px; color: #fff;">Rp ${subTotal.toLocaleString('id-ID')}</span>
            </div>
        `;
        if (cartItemsContainer) cartItemsContainer.appendChild(li);
    });

    if (cartTotal) cartTotal.textContent = `Rp ${calculatedTotal.toLocaleString('id-ID')}`;
    updateFrontDisplays(); 
}

// Fungsi Hapus Barang Total dari Keranjang
window.removeItem = function(id) {
    cart = cart.filter(item => item.id !== id);
    renderCart();
};

// Fungsi Mengurangi Jumlah Barang dari Keranjang Dalam Panel Sidebar Navigasi
window.decreaseItem = function(id) {
    const product = cart.find(item => item.id === id);
    if (product) {
        if (product.quantity > 1) {
            product.quantity -= 1;
        } else {
            cart = cart.filter(item => item.id !== id);
        }
    }
    renderCart();
};

// Fungsi Mengurangi Produk Langsung dari Tombol Minus Halaman Utama
window.decreaseFrontProduct = function(id) {
    const product = cart.find(item => item.id === id);
    if (product) {
        if (product.quantity > 1) {
            product.quantity -= 1;
        } else {
            cart = cart.filter(item => item.id !== id);
        }
    }
    renderCart();
};

// Sinkronisasi Pembaruan Angka Display Indikator Kuantitas Kolam Produk Utama Halaman Depan
function updateFrontDisplays() {
    for (let i = 1; i <= 3; i++) {
        const display = document.getElementById(`qty-display-${i}`);
        if (display) display.textContent = "0";
    }
    cart.forEach(item => {
        const display = document.getElementById(`qty-display-${item.id}`);
        if (display) display.textContent = item.quantity;
    });
}

// Global tracking total belanjaan untuk modal QRIS
let currentCalculatedTotal = 0;

// Tombol Integrasi Pembayaran QRIS & Pengiriman Bukti ke WhatsApp
if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
        if (cart.length === 0) {
            alert("SYSTEM ERROR: Keranjang pesanan Anda kosong, pilih product yang ingin anda beli lebih dulu klik (+)!");
            return;
        }

        // Hitung total tagihan akhir
        currentCalculatedTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        
        // Munculkan angka nominal ke dalam kotak modal pop-up QRIS
        const modalTotalDisplay = document.getElementById('modal-grand-total');
        if (modalTotalDisplay) modalTotalDisplay.textContent = `Rp ${currentCalculatedTotal.toLocaleString('id-ID')}`;

        // Buka Pop-Up Tampilan QRIS di Layar Website
        const qrisModal = document.getElementById('qris-modal');
        if (qrisModal) {
            qrisModal.style.display = "flex";
            document.body.style.overflow = "auto"; // di ubah jadi (auto), agar bisa scroll.
        }
    });
}

// Fungsi Menutup Kotak Pop-Up QRIS
window.closeQrisModal = function() {
    const qrisModal = document.getElementById('qris-modal');
    if (qrisModal) {
        qrisModal.style.display = "none";
        document.body.style.overflow = "auto"; // Aktifkan kembali scroll utama
    }
};

// Eksekusi Tombol Final WhatsApp di Dalam Modal QRIS
const finalWaBtn = document.getElementById('final-whatsapp-btn');
if (finalWaBtn) {
    finalWaBtn.addEventListener('click', () => {
        // Mengambil teks catatan yang diketik oleh pelanggan di halaman web
        const customerNote = document.getElementById('customer-note').value.trim();
        const noteText = customerNote ? `${customerNote}` : `Tidak ada catatan tambahan`;

        // Bangun struktur text invoice rapi untuk WhatsApp
        let message = `*MR-SDAD STORE - NEW ORDER REQUEST (PAID VIA QRIS)*\n`;
        message += `=============================\n\n`;
        
        cart.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            message += `${index + 1}. *${item.name}*\n`;
            message += `    Qty: ${item.quantity}x\n`;
            message += `    Subtotal: Rp ${itemTotal.toLocaleString('id-ID')}\n\n`;
        });

        message += `=============================\n`;
        message += `*TOTAL PEMBAYARAN VIA QRIS:* Rp ${currentCalculatedTotal.toLocaleString('id-ID')}\n`;
        message += `*STATUS TRANSAKSI:* ⏳ Menunggu Validasi Bukti SS\n`;
        message += `*CATATAN PESANAN:* _${noteText}_\n\n`; // MENAMPILKAN CATATAN PELANGGAN DI SINI
        message += `=============================\n\n`;
        message += `Berikut saya lampirkan tangkapan layar (Screenshot) bukti pembayaran QRIS saya yang sah untuk divalidasi oleh sistem Node Owner. Mohon segera diproses, terima kasih!`;

        // Encode text agar aman dibaca URL browser
        const encodedMessage = encodeURIComponent(message);
        
        // Format pemanggilan URL WhatsApp
        const waURL = `https://wa.me/${ownerWhatsApp}?text=${encodedMessage}`;
        
       // Alihkan pengguna ke tab WhatsApp baru
        window.open(waURL, '_blank');
        
        // Otomatis tutup modal dan bersihkan form keranjang serta catatan setelah checkout
        closeQrisModal();
        document.getElementById('customer-note').value = ''; // Mengosongkan form catatan kembali
        cart = [];
        renderCart();
    });
}

// Fungsi Sinkronisasi Pengendali Pemutar Audio Musik Anda
function controlMusic() {
  var music = document.getElementById("bgMusic");
  var btn = document.getElementById("musicBtn");
  if (!music || !btn) return;

  if (music.paused) {
    music.play().then(() => {
      btn.innerHTML = "<span style='font-size: 16px; margin-bottom: 2px;'>⏸️</span><span id='btnText'>Mute</span>";
      btn.style.background = "#ff0055";
      btn.style.borderColor = "#ff0055";
      btn.style.boxShadow = "0px 0px 10px #ff0055";
      btn.style.color = "#ffffff";
    }).catch(error => {
      console.log("Pemutaran musik diblokir oleh browser:", error);
    });
  } else {
    music.pause();
    btn.innerHTML = "<span style='font-size: 16px; margin-bottom: 2px;'>🎵</span><span id='btnText'>Play</span>";
    btn.style.background = "#232329";
    btn.style.borderColor = "#00f0ff";
    btn.style.boxShadow = "0px 0px 10px #00f0ff";
    btn.style.color = "#00f0ff";
  }
}
window.controlMusic = controlMusic;

// Logika Utama Sinkronisasi Menu Sidebar
document.addEventListener("DOMContentLoaded", () => {
    const openSidebarBtn = document.getElementById('open-sidebar-btn');
    const closeSidebarBtn = document.getElementById('close-sidebar-btn');
    const cyberSidebar = document.getElementById('cyber-sidebar');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    const sidebarLinks = document.querySelectorAll('.sidebar-link');

    if (openSidebarBtn && cyberSidebar && sidebarOverlay) {
        openSidebarBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            cyberSidebar.classList.add('active');
            sidebarOverlay.classList.add('active');
        });
    }

    if (closeSidebarBtn && cyberSidebar && sidebarOverlay) {
        closeSidebarBtn.addEventListener('click', () => {
            cyberSidebar.classList.remove('active');
            sidebarOverlay.classList.remove('active');
        });
    }

    if (sidebarOverlay && cyberSidebar) {
        sidebarOverlay.addEventListener('click', () => {
            cyberSidebar.classList.remove('active');
            sidebarOverlay.classList.remove('active');
        });
    }

    if (sidebarLinks && cyberSidebar && sidebarOverlay) {
        sidebarLinks.forEach(link => {
            link.addEventListener('click', () => {
                cyberSidebar.classList.remove('active');
                sidebarOverlay.classList.remove('active');
            });
        });
    }
});

// =========================================================================
// DATABASE & LOGIKA PENGACAK IKLAN BERGANTIAN OTOMATIS (BARU)
// =========================================================================

// Tempat Anda memasukkan daftar teks iklan yang berbeda-beda sesuka hati Anda
const daftarIklanSdad = [
    {
        versi: "MR-SDAD BROADCAST SYSTEM v6.2.5",
        gambar: "website.png",
        linkWA: "https://wa.me/6285133431132",
        htmlTeks: `
            <strong style="color: #ffff00; display: block; margin-bottom: 8px; text-align: center; font-family: 'Orbitron', sans-serif;">🔥 JASA IKLAN🔥</strong>
            • 📢 OPEN JASA IKLAN ALL SERVICE!<br>
            • 🎉 KALIAN BISA PASANG IKLAN/PROMOSI STORE & PRODUCT KALIAN DI SINI!<br>
            • 💯 IKLAN ANDA SELALU DITAMPILKAN SETIAP PENGUNJUNG MEMBUKA TAUTAN WEB!<br>
            • ✅ DILENGKAPI TOMBOL OTOMATIS KE KONTAK WA/LINK GROUP JB KALIAN!<br>
            • 🛍️ BIAYA PEMASANGAN IKLAN SANGAT BERSAHABAT MULAI Rp 50.000/bln!<br>
            • 👇🏻 INFO LEBIH JELAS, KLIK TOMBOL DI BAWAH!.
        `
    },
    {
        versi: "MR-SDAD FLASH SALE NODE v2.1.5",
        gambar: "promo.png", // Menggunakan gambar kedua untuk iklan kedua
        linkWA: "https://wa.me/6285133431132", // Bisa dimasukkan link grup JB WhatsApp Anda
        htmlTeks: `
            <strong style="color: #ff00ff; display: block; margin-bottom: 8px; text-align: center; font-family: 'Orbitron', sans-serif;">⚡ DISKON EVENT SPECIAL ⚡</strong>
            • 🤖 DISKON SEWA BOT: Dapatkan potongan harga khusus untuk paket Permanen!<br>
            • 🌐 JASA WEBSITE PRO: Konsultasikan website impian Anda dengan harga promo.<br>
            • 📦 CPANEL READY: Paket hosting unlimited super cepat harga miring hari ini.<br>
            • 🔥 Stok terbatas! Klik tombol di bawah untuk join group info/klaim promo Anda sekarang sebelum kehabisan!.
        `
    },
    {
        versi: "RUANG PROMOSI (KOSONG) NODE v2.1.5",
        gambar: "promo.png", // Menggunakan gambar kedua untuk iklan kedua
        linkWA: "https://wa.me/6285133431132", // Bisa dimasukkan link grup JB WhatsApp Anda
        htmlTeks: `
            <strong style="color: #ff00ff; display: block; margin-bottom: 8px; text-align: center; font-family: 'Orbitron', sans-serif;">⚡ RUANG PROMOSI KOSONG ⚡</strong>
            • 📢 RUANG PROMOSI INI (KOSONG)<br>
            • 🌐 BAGI ANDA YANG INGIN MENGGUNAKAN LAYANAN PROMOSI BISA HUBUNGI / KLIK TOMBOL DI BAWAH INI 👇🏻<br>
            • 📦 CPANEL READY:<br>
            • 🔥 Stok terbatas! Klik tombol di bawah untuk join group info/klaim promo Anda sekarang sebelum kehabisan!.
        `
    }
];

window.closePromoModal = function() {
    const promoModal = document.getElementById('promo-modal');
    if (promoModal) {
        promoModal.style.display = "none";
        document.body.style.overflow = "auto"; 
    }
};

// Logika Otomatis Mengocok Iklan saat Halaman Dimuat Pertama Kali
document.addEventListener("DOMContentLoaded", () => {
    const promoModal = document.getElementById('promo-modal');
    
    if (promoModal) {
        // Rumus matematika acak untuk memilih salah satu data dari daftarIklanSdad
        const indeksAcak = Math.floor(Math.random() * daftarIklanSdad.length);
        const iklanTerpilih = daftarIklanSdad[indeksAcak];

        // Menyuntikkan data iklan terpilih secara real-time ke dalam komponen HTML
        document.getElementById('promo-version-text').textContent = iklanTerpilih.versi;
        document.getElementById('promo-image-node').src = iklanTerpilih.gambar;
        document.getElementById('promo-text-container').innerHTML = iklanTerpilih.htmlTeks;
        document.getElementById('promo-action-link').href = iklanTerpilih.linkWA;

        // Kunci layar belakang selama iklan pop-up tampil
        document.body.style.overflow = "hidden"; 
    }
});
            
// Database Konten Deskripsi Produk untuk Pop-up Dinamis
const dbDeskripsiProduk = {
    "1": {
        title: "JASA SEWA MR-SDADBOT MD",
        img: "sewabot.jpg",
        priceStr: "Mulai Rp 5.000",
        priceNum: 5000,
        desc: `<strong>🤖 FITUR UTAMA:</strong><br>• <span style="color:#ff00ff;">700+ Fitur Premium</span><br>• <span style="color:#00ffff;">Sistem Perlindungan Grup</span><br>• <span style="color:#00ffcc;">Aktif 24 Jam</span><br>• <span style="color:#ffff00;">Pembaruan Berkala</span><br><br><strong>💰 AKSES PREMIUM:</strong><br>🗓️ 7 HARI ➜ Rp 10.000<br>🗓️ 30 HARI ➜ Rp 20.000<br>👑 PERMANEN ➜ Rp 60.000<br><br><small style="color:#ff3333;">⚠️ Jangan menunggu harga naik baru membeli. Akses permanen tidak selalu tersedia.</small>`
    },
    "2": {
        title: "JASA PEMBUATAN WEBSITE PRO",
        img: "website.png",
        priceStr: "Mulai Rp 50.000",
        priceNum: 50000,
        desc: `Buat website profesional, modern, responsif, dan sesuai kebutuhan Anda bersama MR-SDAD!<br><br><strong>✨ FITUR UTAMA LAYANAN:</strong><br>• Bisa Request Desain sesuka kamu!<br>• Mulai Rp 50 Ribu saja loh!<br>• Sudah mendapatkan Website Siap Landing.<br><br><strong>🎯 COCOK UNTUK KATEGORI:</strong><br>Toko Online, Company Profile, Landing Page, Portofolio.`
    },
    "3": {
        title: "CPANEL & RESPANEL SERVER",
        img: "panel.png",
        priceStr: "Mulai Rp 2.000",
        priceNum: 2000,
        desc: `Kelola hosting dan server dengan lebih mudah, praktis, dan fleksibel bersama MR-SDAD PANEL!<br><br><strong>💜 LAYANAN RESPANEL:</strong><br>• Masa Aktif 14 Hari ➜ Rp 10.000<br>• Perpanjang 30 Hari ➜ Rp 10.000<br><br><strong>💻 LAYANAN CPANEL:</strong><br>• Kapasitas 1GB – 10GB ➜ Rp 2.000 sd Rp 6.000<br>• Kapasitas Unlimited ➜ Rp 8.000<br><br><small style="color:#ff3333;">⚠️ Masa aktif Cpanel: 20 Hari<br>🛡️ Garansi bebas replace: 14 Hari</small>`
    },
        "4": {
        title: "NOKOS — NOMOR KOSONG",
        img: "nokos.png",
        priceStr: "Mulai Rp 1.000",
        priceNum: 1000,
        desc: `<strong>✨ KEUNGGULAN UTAMA:</strong><br>• Tersedia untuk <span style="color:#00ffff;">WhatsApp, Telegram, DANA, GoPay, Google</span>, dan platform lainnya!<br>• <span style="color:#00ffcc;">Proses instan dan cepat</span><br>• <span style="color:#ff00ff;">Privasi dan keamanan terjamin</span><br><br><strong>💰 DAFTAR HARGA:</strong><br>⚡ Harga mulai ➜ Rp 1.000 saja!<br><br><small style="color:#ffff00;">🚀 Dapatkan NOKOS sesuai kebutuhanmu hanya di MR-SDAD STORE!</small>`
   }
};

// Menyimpan ID produk yang sedang aktif dibuka oleh pembeli
let activeProductIdInModal = null;

// Fungsi Membuka Jendela Deskripsi Pop-up Detail
window.openProductDetail = function(id) {
    activeProductIdInModal = id;
    const data = dbDeskripsiProduk[id];
    if (!data) return;

    // Masukkan data ke komponen modal pop-up
    document.getElementById('modal-p-img').src = data.img;
    document.getElementById('modal-p-title').textContent = data.title;
    document.getElementById('modal-p-price').textContent = data.priceStr;
    document.getElementById('modal-p-desc').innerHTML = data.desc;

    // Perbarui fungsi klik tombol plus/minus di dalam modal agar mengacu pada data yang benar
    document.getElementById('modal-plus-btn').onclick = () => tambahItemDariModal(id, data.title, data.priceNum);
    document.getElementById('modal-minus-btn').onclick = () => kurangItemDariModal(id);

    // Sinkronkan angka kuantitas awal di modal
    const itemDiKeranjang = cart.find(item => item.id === id);
    document.getElementById('modal-p-qty').textContent = itemDiKeranjang ? itemDiKeranjang.quantity : "0";

    document.getElementById('product-detail-modal').style.display = "flex";
    document.body.style.overflow = "hidden"; // Kunci layar belakang
};

window.closeProductDetail = function() {
    document.getElementById('product-detail-modal').style.display = "none";
    document.body.style.overflow = "auto";
    activeProductIdInModal = null;
};

function tambahItemDariModal(id, name, price) {
    const existing = cart.find(item => item.id === id);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ id, name, price, quantity: 1 });
    }
    renderCart();
    flashNavCart();
    // Sinkronkan angka live di modal
    document.getElementById('modal-p-qty').textContent = cart.find(item => item.id === id).quantity;
}

function kurangItemDariModal(id) {
    const existing = cart.find(item => item.id === id);
    if (existing) {
        if (existing.quantity > 1) {
            existing.quantity -= 1;
            document.getElementById('modal-p-qty').textContent = existing.quantity;
        } else {
            cart = cart.filter(item => item.id !== id);
            document.getElementById('modal-p-qty').textContent = "0";
        }
    }
    renderCart();
}

// Fungsi Update Indikator Angka di Halaman Depan & Modal
function updateFrontDisplays() {
    for (let i = 1; i <= 3; i++) {
        const fQty = document.getElementById(`front-qty-${i}`);
        if (fQty) fQty.style.display = "none";
    }
    cart.forEach(item => {
        const fQty = document.getElementById(`front-qty-${item.id}`);
        if (fQty) {
            fQty.textContent = `[x${item.quantity}]`;
            fQty.style.display = "inline";
        }
        // Jika modal sedang terbuka, ikut sinkronkan angkanya
        if (activeProductIdInModal === item.id) {
            document.getElementById('modal-p-qty').textContent = item.quantity;
        }
    });
}

// =========================================================================
// SINKRONISASI FITUR SAKELAR MODE TERANG / GELAP DENGAN MEMORI LOCALSTORAGE
// =========================================================================
window.toggleThemeSystem = function() {
    const body = document.body;
    const btn = document.getElementById('theme-toggle-btn');
    
    if (!btn) return;

    // Lakukan cek balik perpindahan kelas tema pada tag body
    if (body.classList.contains('light-theme')) {
        body.classList.remove('light-theme');
        btn.innerHTML = "🌙 DARK MODE";
        btn.style.borderColor = "var(--cyber-blue)";
        btn.style.color = "var(--cyber-blue)";
        localStorage.setItem('mrSdadTheme', 'dark'); // Simpan status pilihan gelap ke memori
    } else {
        body.classList.add('light-theme');
        btn.innerHTML = "☀️ LIGHT MODE";
        btn.style.borderColor = "var(--cyber-pink)";
        btn.style.color = "var(--cyber-pink)";
        localStorage.setItem('mrSdadTheme', 'light'); // Simpan status pilihan terang ke memori
    }
};

// Cek otomatis memori browser pelanggan saat pertama kali halaman selesai dimuat
document.addEventListener("DOMContentLoaded", () => {
    const temaTersimpan = localStorage.getItem('mrSdadTheme');
    const body = document.body;
    const btn = document.getElementById('theme-toggle-btn');

    if (temaTersimpan === 'light') {
        body.classList.add('light-theme');
        if (btn) {
            btn.innerHTML = "☀️ LIGHT MODE";
            btn.style.borderColor = "var(--cyber-pink)";
            btn.style.color = "var(--cyber-pink)";
        }
    }
});
    
const peerConfig = { iceServers: [{ urls: "stun:://google.com" }] };
let peerConn;
let dataChannel;
let isOwnerMode = false;

// 1. Fungsi Buka-Tutup Jendela Chat Pelanggan
function toggleLiveChat() {
    const chatWidget = document.getElementById('liveChatWidget');
    if (chatWidget.style.display === 'none' || chatWidget.style.display === '') {
        chatWidget.style.display = 'flex';
        // Pelanggan menginisialisasi koneksi saat membuka chat pertama kali
        if (!peerConn && !isOwnerMode) {
            initCustomerConnection();
        }
    } else {
        chatWidget.style.display = 'none';
    }
}

// 2. Alur Sisi Pelanggan (Membuat Offer)
function initCustomerConnection() {
    peerConn = new RTCPeerConnection(peerConfig);
    dataChannel = peerConn.createDataChannel("chat");
    setupDataChannelEvents(dataChannel);

    peerConn.onicecandidate = e => {
        if (!e.candidate) {
            const customerOffer = btoa(JSON.stringify(peerConn.localDescription));
            displaySystemMessage(`<strong>Kode Sesi Anda:</strong><br><code style="background:#202642; padding:2px 5px; border-radius:3px; font-size:10px; word-break:break-all; display:block; margin:5px 0;">${customerOffer}</code>Salin dan kirim kode ini ke Owner agar obrolan tersambung langsung.`);
        }
    };

    peerConn.createOffer().then(offer => peerConn.setLocalDescription(offer));
}

// 3. Alur Sisi Owner (Menerima Offer Pelanggan & Mengembalikan Jawaban)
function openOwnerPanel() {
    document.getElementById('ownerConnectPanel').style.display = 'flex';
}

function closeOwnerPanel() {
    document.getElementById('ownerConnectPanel').style.display = 'none';
}

function connectToCustomer() {
    const inputToken = document.getElementById('ownerSessionInput').value.trim();
    if (!inputToken) return;

    isOwnerMode = true;
    peerConn = new RTCPeerConnection(peerConfig);

    // Owner mendengarkan channel yang dibuat oleh pelanggan
    peerConn.ondatachannel = e => {
        dataChannel = e.channel;
        setupDataChannelEvents(dataChannel);
    };

    try {
        const decodedOffer = JSON.parse(atob(inputToken));
        
        // Cek jika token tersebut adalah tawaran awal dari pelanggan
        if (decodedOffer.type === "offer") {
            peerConn.setRemoteDescription(new RTCSessionDescription(decodedOffer))
                .then(() => peerConn.createAnswer())
                .then(answer => peerConn.setLocalDescription(answer))
                .then(() => {
                    peerConn.onicecandidate = e => {
                        if (!e.candidate) {
                            const ownerAnswer = btoa(JSON.stringify(peerConn.localDescription));
                            // Tampilkan kode jawaban untuk dikirim balik jika diperlukan otomatisasi manual
                            alert("Koneksi diproses! Kirim balik kode konfirmasi ini ke pelanggan jika obrolan belum masuk.");
                            console.log("Owner Answer:", ownerAnswer);
                        }
                    };
                    closeOwnerPanel();
                    // Buka widget chat di layar Owner agar bisa mengetik
                    document.getElementById('liveChatWidget').style.display = 'flex';
                    displaySystemMessage("Menghubungkan ke pelanggan...");
                });
        } else if (decodedOffer.type === "answer") {
            // Sisi pelanggan menerima jawaban dari Owner jika koneksi tertunda
            peerConn.setRemoteDescription(new RTCSessionDescription(decodedOffer));
            closeOwnerPanel();
        }
    } catch (err) {
        alert("Kode sesi tidak valid atau rusak!");
    }
}

// 4. Pengaturan Pengiriman & Penerimaan Teks Terpadu
function setupDataChannelEvents(channel) {
    channel.onopen = () => displaySystemMessage("🎉 Koneksi Terhubung Langsung!");
    channel.onclose = () => displaySystemMessage("⚠️ Koneksi terputus.");
    channel.onmessage = e => appendMessage(e.data, "msg-incoming");
}

function sendChatMessage() {
    const inputEl = document.getElementById('chatInputMessage');
    const msgText = inputEl.value.trim();
    if (msgText === '') return;

    appendMessage(msgText, "msg-outgoing");
    
    if (dataChannel && dataChannel.readyState === "open") {
        dataChannel.send(msgText);
    }
    inputEl.value = '';
}

function appendMessage(text, className) {
    const chatBody = document.getElementById('chatBoxBody');
    const msgEl = document.createElement('div');
    msgEl.className = `message ${className}`;
    msgEl.innerText = text;
    chatBody.appendChild(msgEl);
    chatBody.scrollTop = chatBody.scrollHeight;
}

function displaySystemMessage(htmlText) {
    const chatBody = document.getElementById('chatBoxBody');
    const infoEl = document.createElement('div');
    infoEl.className = "message msg-incoming";
    infoEl.style.background = "#2a1b40";
    infoEl.innerHTML = htmlText;
    chatBody.appendChild(infoEl);
    chatBody.scrollTop = chatBody.scrollHeight;
}

function handleChatKeyPress(event) {
    if (event.key === 'Enter') {
        sendChatMessage();
    }
        }
        
