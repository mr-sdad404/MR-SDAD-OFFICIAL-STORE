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
addToCartButtons.forEach(button => {
    button.addEventListener('click', () => {
        const id = button.getAttribute('data-id');
        const name = button.getAttribute('data-name');
        const price = parseInt(button.getAttribute('data-price'));

        // Cari tahu apakah barang sudah masuk sistem log keranjang
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
    // Hitung total kuantitas item
    const totalQty = cart.reduce((acc, item) => acc + item.quantity, 0);
    if (cartCount) cartCount.textContent = totalQty;

    // Kosongkan list bawaan
    if (cartItemsContainer) cartItemsContainer.innerHTML = '';

    if (cart.length === 0) {
        if (cartItemsContainer) cartItemsContainer.innerHTML = `<li class="empty-msg">Belum ada modul item terpasang di sistem keranjang.</li>`;
        if (cartTotal) cartTotal.textContent = "Rp 0";
        return;
    }

    let calculatedTotal = 0;

    cart.forEach(item => {
        const subTotal = item.price * item.quantity;
        calculatedTotal += subTotal;

        const li = document.createElement('li');
        li.innerHTML = `
            <div>
                <span class="neon-text-blue">[x${item.quantity}]</span> ${item.name}
            </div>
            <div>
                <span>Rp ${subTotal.toLocaleString('id-ID')}</span>
                <button class="remove-item-btn" onclick="removeItem('${item.id}')">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </div>
        `;
        if (cartItemsContainer) cartItemsContainer.appendChild(li);
    });

    if (cartTotal) cartTotal.textContent = `Rp ${calculatedTotal.toLocaleString('id-ID')}`;
}

// Fungsi Hapus Barang
window.removeItem = function(id) {
    cart = cart.filter(item => item.id !== id);
    renderCart();
};

// Tombol Integrasi Checkout Otomatis Mengirim List Pesanan ke WA Owner
if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
        if (cart.length === 0) {
            alert("SYSTEM ERROR: Keranjang pesanan Anda kosong!");
            return;
        }

        // Bangun struktur text invoice rapi untuk WhatsApp
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

        // Encode text agar aman dibaca URL browser
        const encodedMessage = encodeURIComponent(message);
        
        // PERBAIKAN UTAMA: Format pemanggilan variabel URL WhatsApp yang benar
        const waURL = `https://wa.me/{ownerWhatsApp}?text=${encodedMessage}`;

        // Alihkan pengguna ke tab WhatsApp baru
        window.open(waURL, '_blank');
    });
}

function toggleMusic() {
  var music = document.getElementById("bgMusic");
  var btn = document.getElementById("musicBtn");
  if (music.paused) {
    music.play();
    btn.innerHTML = "⏸️ Pause";
    btn.style.background = "#ff1744";
  } else {
    music.pause();
    btn.innerHTML = "🎵 Play";
    btn.style.background = "#00e676";
  }
}
