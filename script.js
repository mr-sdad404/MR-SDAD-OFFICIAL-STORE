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

// Tombol Integrasi Checkout Otomatis Mengirim List Pesanan ke WA Owner
if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
        if (cart.length === 0) {
            alert("SYSTEM ERROR: Keranjang pesanan Anda kosong, pilih product yang ingin anda beli lebih dulu klik (+)!");
            return;
        }

        let message = `*MR-SDAD STORE - NEW ORDER REQUEST*\n`;
        message += `==============================\n\n`;
        
        let grandTotal = 0;
        cart.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            grandTotal += itemTotal;
            message += `${index + 1}. *${item.name}*\n`;
            message += `    Qty: ${item.quantity}x\n`;
            message += `    Subtotal: Rp ${itemTotal.toLocaleString('id-ID')}\n\n`;
        });

        message += `==============================\n`;
        message += `*TOTAL TAGIHAN:* Rp ${grandTotal.toLocaleString('id-ID')}\n\n`;
        message += `Mohon instruksi selanjutnya untuk sistem pembayaran & pengiriman Node.`;

        const encodedMessage = encodeURIComponent(message);
        const waURL = `https://wa.me/${ownerWhatsApp}?text=${encodedMessage}`;
        window.open(waURL, '_blank');
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
