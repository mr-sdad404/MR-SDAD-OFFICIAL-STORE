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
        gambar: "promo.jpg",
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
    }
    // Anda bisa menambah objek { ... } ketiga atau keempat di sini jika punya info produk lain
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
            
