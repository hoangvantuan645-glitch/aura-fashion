/* =========================================================
   AURA Fashion - main.js
   Chức năng: lọc sản phẩm, giỏ hàng, kiểm tra form,
   đăng ký nhận tin, nút lên đầu trang, đánh dấu menu.
   ========================================================= */
document.addEventListener("DOMContentLoaded", function () {

  /* ---------- Tiện ích ---------- */
  const formatVND = (n) => n.toLocaleString("vi-VN") + "đ";

  const toastEl = document.getElementById("appToast");
  const toast = new bootstrap.Toast(toastEl, { delay: 2200 });
  function showToast(msg) {
    document.getElementById("toastMsg").textContent = msg;
    toast.show();
  }

  document.getElementById("year").textContent = new Date().getFullYear();

  /* ---------- Menu: đổ bóng khi cuộn + đánh dấu mục đang xem ---------- */
  const nav = document.getElementById("mainNav");
  // Bỏ qua liên kết "#" của nút mở menu thả xuống: đây không phải là một section hợp lệ.
  const navLinks = document.querySelectorAll("#navMenu .nav-link[href^='#']:not([href='#'])");
  const sections = Array.from(navLinks)
    .map((a) => document.querySelector(a.getAttribute("href")))
    .filter(Boolean);

  function onScroll() {
    nav.classList.toggle("scrolled", window.scrollY > 10);
    document.getElementById("toTop").classList.toggle("show", window.scrollY > 500);

    let current = sections[0];
    sections.forEach((sec) => {
      if (sec.getBoundingClientRect().top <= 120) current = sec;
    });
    navLinks.forEach((a) =>
      a.classList.toggle("active", current && a.getAttribute("href") === "#" + current.id)
    );
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Đóng menu mobile sau khi bấm liên kết
  const navMenu = document.getElementById("navMenu");
  navMenu.querySelectorAll("a.nav-link:not(.dropdown-toggle), a.dropdown-item").forEach((a) => {
    a.addEventListener("click", () => {
      if (navMenu.classList.contains("show")) bootstrap.Collapse.getOrCreateInstance(navMenu).hide();
    });
  });

  /* ---------- Lên đầu trang ---------- */
  document.getElementById("toTop").addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  /* ---------- Lọc sản phẩm Nam / Nữ ---------- */
  const filterBtns = document.querySelectorAll(".btn-filter");
  const productItems = document.querySelectorAll(".product-item");

  function applyFilter(type) {
    filterBtns.forEach((b) => b.classList.toggle("active", b.dataset.filter === type));
    productItems.forEach((item) => {
      const show = type === "all" || item.dataset.category === type;
      item.classList.toggle("is-hidden", !show);
    });
  }
  filterBtns.forEach((btn) => btn.addEventListener("click", () => applyFilter(btn.dataset.filter)));

  // Các liên kết ở menu, banner, danh mục, footer cũng lọc được
  document.querySelectorAll(".js-filter-link").forEach((link) => {
    link.addEventListener("click", () => applyFilter(link.dataset.filter));
  });

  /* ---------- Giỏ hàng ---------- */
  const cart = []; // [{id, name, price, img, qty}]
  const cartCount = document.getElementById("cartCount");
  const cartItemsEl = document.getElementById("cartItems");
  const cartEmpty = document.getElementById("cartEmpty");
  const cartTotal = document.getElementById("cartTotal");
  const checkoutBtn = document.getElementById("checkoutBtn");

  function renderCart() {
    cartItemsEl.innerHTML = "";
    let total = 0, count = 0;

    cart.forEach((item) => {
      total += item.price * item.qty;
      count += item.qty;

      const li = document.createElement("li");
      li.className = "cart-item";

      const img = document.createElement("img");
      img.src = item.img;
      img.alt = item.name;

      const info = document.createElement("div");
      info.className = "flex-grow-1";

      const name = document.createElement("div");
      name.className = "name";
      name.textContent = item.name;

      const price = document.createElement("div");
      price.className = "small text-muted mb-2";
      price.textContent = formatVND(item.price);

      const controls = document.createElement("div");
      controls.className = "d-flex align-items-center gap-2";
      controls.appendChild(makeBtn("−", "Giảm số lượng", () => changeQty(item.id, -1)));
      const qty = document.createElement("span");
      qty.textContent = item.qty;
      controls.appendChild(qty);
      controls.appendChild(makeBtn("+", "Tăng số lượng", () => changeQty(item.id, 1)));

      info.append(name, price, controls);

      const right = document.createElement("div");
      right.className = "text-end";
      const sub = document.createElement("div");
      sub.className = "fw-semibold";
      sub.textContent = formatVND(item.price * item.qty);
      const del = document.createElement("button");
      del.type = "button";
      del.className = "btn btn-link btn-sm text-danger p-0 mt-2";
      del.textContent = "Xoá";
      del.addEventListener("click", () => removeItem(item.id));
      right.append(sub, del);

      li.append(img, info, right);
      cartItemsEl.appendChild(li);
    });

    cartCount.textContent = count;
    cartTotal.textContent = formatVND(total);
    cartEmpty.classList.toggle("d-none", cart.length > 0);
    checkoutBtn.disabled = cart.length === 0;
  }

  function makeBtn(text, label, handler) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "btn btn-outline-secondary btn-sm qty-btn";
    b.textContent = text;
    b.setAttribute("aria-label", label);
    b.addEventListener("click", handler);
    return b;
  }

  function addToCart(product) {
    const found = cart.find((i) => i.id === product.id);
    if (found) found.qty += 1;
    else cart.push({ ...product, qty: 1 });
    renderCart();
    showToast("Đã thêm \"" + product.name + "\" vào giỏ hàng");
  }

  function changeQty(id, delta) {
    const item = cart.find((i) => i.id === id);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) removeItem(id);
    else renderCart();
  }

  function removeItem(id) {
    const idx = cart.findIndex((i) => i.id === id);
    if (idx > -1) cart.splice(idx, 1);
    renderCart();
  }

  document.querySelectorAll(".btn-add").forEach((btn) => {
    btn.addEventListener("click", () => {
      addToCart({
        id: btn.dataset.id,
        name: btn.dataset.name,
        price: Number(btn.dataset.price),
        img: btn.dataset.img,
      });
    });
  });

  checkoutBtn.addEventListener("click", () => {
    cart.length = 0;
    renderCart();
    bootstrap.Offcanvas.getOrCreateInstance(document.getElementById("cartPanel")).hide();
    showToast("Đặt hàng thành công. AURA sẽ gọi xác nhận trong ít phút.");
  });

  renderCart();

  /* ---------- Form liên hệ (Bootstrap validation) ---------- */
  const contactForm = document.getElementById("contactForm");
  const contactResult = document.getElementById("contactResult");

  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();
    contactResult.classList.add("d-none");
    if (!contactForm.checkValidity()) {
      contactForm.classList.add("was-validated");
      return;
    }
    contactForm.reset();
    contactForm.classList.remove("was-validated");
    contactResult.classList.remove("d-none");
  });

  /* ---------- Đăng ký nhận tin ---------- */
  const nlForm = document.getElementById("newsletterForm");
  const nlEmail = document.getElementById("nlEmail");
  const nlMsg = document.getElementById("nlMsg");
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  nlForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const value = nlEmail.value.trim();
    if (!emailRegex.test(value)) {
      nlMsg.className = "small mt-2 err";
      nlMsg.textContent = "Email chưa hợp lệ. Ví dụ: ten@gmail.com";
      nlEmail.focus();
      return;
    }
    nlMsg.className = "small mt-2 ok";
    nlMsg.textContent = "Đăng ký thành công. Cảm ơn bạn!";
    nlForm.reset();
  });
});
