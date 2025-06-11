// === Deals99 JavaScript (Improved & Modular) ===

// --- Utility Functions ---
function getLS(key) {
  return JSON.parse(localStorage.getItem(key)) || [];
}
function setLS(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// --- Cart & Wishlist Badge ---
function updateCartIcon() {
  const cartIcon = document.querySelector(".fa-shopping-cart");
  if (cartIcon) {
    let badge = cartIcon.parentElement.querySelector(".cart-badge");
    if (!badge) {
      badge = document.createElement("span");
      badge.className = "cart-badge";
      cartIcon.parentElement.appendChild(badge);
    }
    const cart = getLS("cart");
    badge.textContent = cart.length;
    badge.style.position = "absolute";
    badge.style.top = "0";
    badge.style.right = "-8px";
    badge.style.background = "#27ae60";
    badge.style.color = "#fff";
    badge.style.borderRadius = "50%";
    badge.style.padding = "2px 6px";
    badge.style.fontSize = "12px";
    badge.style.zIndex = "2";
  }
}
function updateWishlistIcon() {
  const heartIcon = document.querySelector(".fa-heart");
  if (heartIcon) {
    let badge = heartIcon.parentElement.querySelector(".wishlist-badge");
    if (!badge) {
      badge = document.createElement("span");
      badge.className = "wishlist-badge";
      heartIcon.parentElement.appendChild(badge);
    }
    const wishlist = getLS("wishlist");
    badge.textContent = wishlist.length;
    badge.style.position = "absolute";
    badge.style.top = "0";
    badge.style.right = "-8px";
    badge.style.background = "#e74c3c";
    badge.style.color = "#fff";
    badge.style.borderRadius = "50%";
    badge.style.padding = "2px 6px";
    badge.style.fontSize = "12px";
    badge.style.zIndex = "2";
  }
}

// --- Wishlist Functions ---
function addToWishlist(itemName) {
  const wishlist = getLS("wishlist");
  if (!wishlist.includes(itemName)) {
    wishlist.push(itemName);
    setLS("wishlist", wishlist);
    updateWishlistIcon();
    alert(`💖 "${itemName}" added to wishlist!`);
  } else {
    alert(`"${itemName}" is already in your wishlist.`);
  }
}
function removeFromWishlist(itemName) {
  let wishlist = getLS("wishlist");
  wishlist = wishlist.filter(name => name !== itemName);
  setLS("wishlist", wishlist);
  updateWishlistIcon();
}
function renderWishlist() {
  let wishlist = getLS("wishlist");
  const allProducts = [
    ...getLS("liveProducts"),
    ...getLS("arrivals"),
    ...getLS("today99deals"),
    ...getLS("deal99Products")
  ];
  const seen = new Set();
  const products = allProducts.filter(p => {
    if (seen.has(p.name)) return false;
    seen.add(p.name);
    return true;
  });
  let html = `<div id="wishlistModal" class="wishlist-modal" style="position:fixed;top:10%;left:50%;transform:translateX(-50%);background:#fff;z-index:9999;padding:20px;border-radius:8px;box-shadow:0 2px 16px #0002;max-width:400px;width:95vw;">
    <h3>My Wishlist</h3>
    <button onclick="document.getElementById('wishlistModal').remove()" style="float:right;">&times;</button>
    <ul style="margin-top:20px;list-style:none;padding:0;">`;
  if (wishlist.length === 0) {
    html += `<li style="color:#888;">Your wishlist is empty.</li>`;
  } else {
    wishlist.forEach(itemName => {
      const found = products.find(a => a.name === itemName);
      html += `<li style="display:flex;align-items:center;margin-bottom:10px;">
        <img src="${found && found.img ? (Array.isArray(found.img) ? found.img[0] : found.img) : 'https://cdn-icons-png.flaticon.com/512/2905/2905673.png'}" alt="${itemName}" style="width:32px;height:32px;border-radius:5px;margin-right:10px;">
        <span style="flex:1;"><strong>${found ? found.name : itemName}</strong>${found && found.price ? " - ₹" + found.price : ""}</span>
        <button onclick="removeFromWishlist('${itemName}');renderWishlist();" style="margin-left:10px;background:#e63946;color:#fff;border:none;border-radius:4px;padding:4px 10px;cursor:pointer;">Remove</button>
      </li>`;
    });
  }
  html += `</ul></div>`;
  const oldModal = document.getElementById("wishlistModal");
  if (oldModal) oldModal.remove();
  document.body.insertAdjacentHTML("beforeend", html);
}

// --- Cart Functions ---
function addToCart(productName) {
  let cart = getLS("cart");
  cart.push(productName);
  setLS("cart", cart);
  updateCartIcon();
  alert(`🛒 "${productName}" added to cart!`);
}
function buyNow(productName) {
  addToCart(productName);
  window.location.href = "cart.html";
}
function clearCart() {
  localStorage.removeItem("cart");
  updateCartIcon();
  alert("🗑️ Cart cleared!");
  if (window.location.pathname.includes("cart.html")) location.reload();
}
function removeItem(index) {
  const cartItems = getLS("cart");
  cartItems.splice(index, 1);
  setLS("cart", cartItems);
  updateCartIcon();
  showCartCountInTitle();
  if (window.location.pathname.includes("cart.html")) location.reload();
}
function getCartTotal() {
  const cartItems = getLS("cart");
  const allProducts = [
    ...getLS("liveProducts"),
    ...getLS("arrivals"),
    ...getLS("today99deals"),
    ...getLS("deal99Products")
  ];
  let total = 0;
  cartItems.forEach(itemName => {
    const found = allProducts.find(a => a.name === itemName);
    if (found) total += Number(found.price || found.discounted || 0);
  });
  return total;
}
function showCartCountInTitle() {
  const cart = getLS("cart");
  document.title = cart.length > 0 ? `(${cart.length}) Deals99` : "Deals99";
}

// --- New Arrivals (Drafts) Functions ---
function saveNewArrival(name, price, img) {
  const arrivals = getLS("arrivals");
  arrivals.push({ name, price, img });
  setLS("arrivals", arrivals);
}
function loadNewArrivals() {
  const arrivals = getLS("arrivals");
  const grid = document.querySelector(".arrival-grid");
  if (grid) {
    grid.innerHTML = "";
    arrivals.forEach(item => {
      const card = document.createElement("div");
      card.className = "arrival-card";
      card.innerHTML = `
        <img src="${item.img ? (Array.isArray(item.img) ? item.img[0] : item.img) : 'https://cdn-icons-png.flaticon.com/512/2905/2905673.png'}" alt="${item.name}"/>
        <h3>${item.name}</h3>
        <p class="price">₹${item.price}</p>
      `;
      grid.appendChild(card);
    });
  }
}
function clearArrivals() {
  localStorage.removeItem("arrivals");
  loadNewArrivals();
  renderAdminArrivals();
  alert("🗑️ All new arrivals cleared!");
}
function removeArrival(idx) {
  let arrivals = getLS("arrivals");
  arrivals.splice(idx, 1);
  setLS("arrivals", arrivals);
  renderAdminArrivals(document.getElementById("adminSearch")?.value || "");
  loadNewArrivals();
}

// --- Improved: Render admin arrivals list with remove/edit/image ---
function renderAdminArrivals(filter = "") {
  const adminArrivals = document.getElementById("adminArrivals");
  if (!adminArrivals) return;
  let arrivals = getLS("arrivals");
  if (filter) {
    arrivals = arrivals.filter(item => item.name.toLowerCase().includes(filter.toLowerCase()));
  }
  adminArrivals.innerHTML = "";
  if (arrivals.length === 0) {
    adminArrivals.innerHTML = "<p>No arrivals found.</p>";
    return;
  }
  arrivals.forEach((item, idx) => {
    const div = document.createElement("div");
    div.className = "admin-arrival-row";
    div.style.display = "flex";
    div.style.alignItems = "center";
    div.style.gap = "12px";
    div.style.marginBottom = "10px";
    div.innerHTML = `
      <img src="${item.img ? (Array.isArray(item.img) ? item.img[0] : item.img) : 'https://cdn-icons-png.flaticon.com/512/2905/2905673.png'}" alt="${item.name}" style="width:40px;height:40px;border-radius:6px;object-fit:cover;">
      <span><strong>${item.name}</strong> - ₹${item.price}</span>
      <button data-idx="${idx}" class="edit-arrival-btn">Edit</button>
      <button data-idx="${idx}" class="remove-arrival-btn">Remove</button>
    `;
    adminArrivals.appendChild(div);
  });
  adminArrivals.querySelectorAll(".remove-arrival-btn").forEach(btn => {
    btn.addEventListener("click", function() {
      removeArrival(Number(this.dataset.idx));
    });
  });
  adminArrivals.querySelectorAll(".edit-arrival-btn").forEach(btn => {
    btn.addEventListener("click", function() {
      editArrival(Number(this.dataset.idx));
    });
  });
}
function editArrival(idx) {
  const arrivals = getLS("arrivals");
  const item = arrivals[idx];
  if (!item) return;
  const newName = prompt("Edit product name:", item.name);
  if (newName === null) return;
  const newPrice = prompt("Edit product price:", item.price);
  if (newPrice === null) return;
  const newImg = prompt("Edit image URL:", Array.isArray(item.img) ? item.img[0] : (item.img || ""));
  if (!newName.trim() || isNaN(Number(newPrice)) || Number(newPrice) <= 0) {
    alert("Invalid input.");
    return;
  }
  arrivals[idx] = { ...item, name: newName.trim(), price: Number(newPrice), img: newImg.trim() };
  setLS("arrivals", arrivals);
  loadNewArrivals();
  renderAdminArrivals(document.getElementById("adminSearch")?.value || "");
  alert("✅ Arrival updated!");
}

// --- Export/Import Products ---
const exportBtn = document.getElementById("exportArrivalsBtn");
if (exportBtn) {
  exportBtn.addEventListener("click", function() {
    const arrivals = getLS("arrivals");
    const blob = new Blob([JSON.stringify(arrivals, null, 2)], {type: "application/json"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "products.json";
    a.click();
    URL.revokeObjectURL(url);
  });
}
const importBtn = document.getElementById("importArrivalsBtn");
const importFile = document.getElementById("importArrivalsFile");
if (importBtn && importFile) {
  importBtn.addEventListener("click", () => importFile.click());
  importFile.addEventListener("change", function() {
    const file = this.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        const data = JSON.parse(e.target.result);
        if (Array.isArray(data)) {
          setLS("arrivals", data);
          renderAdminArrivals(document.getElementById("adminSearch")?.value || "");
          loadNewArrivals();
          alert("Products imported successfully!");
        } else {
          alert("Invalid file format.");
        }
      } catch {
        alert("Invalid JSON file.");
      }
    };
    reader.readAsText(file);
  });
}

// --- Product Search ---
const adminSearch = document.getElementById("adminSearch");
if (adminSearch) {
  adminSearch.addEventListener("input", function() {
    renderAdminArrivals(this.value);
  });
}

// --- Order Management ---
function saveOrder(order) {
  const orders = getLS("orders");
  orders.push(order);
  setLS("orders", orders);
}
function renderAdminOrders() {
  const adminOrders = document.getElementById("adminOrders");
  if (!adminOrders) return;
  const orders = getLS("orders");
  if (orders.length === 0) {
    adminOrders.innerHTML = "<p>No orders yet.</p>";
    return;
  }
  adminOrders.innerHTML = "";
  orders.forEach((order, idx) => {
    const status = order.status || "Pending";
    const statusColor =
      status === "Delivered" ? "#27ae60" :
      status === "Shipped" ? "#f1c40f" : "#e67e22";
    const date = order.date ? new Date(order.date).toLocaleString() : "";
    const div = document.createElement("div");
    div.className = "admin-order-row";
    div.style.background = "#f8f8f8";
    div.style.marginBottom = "14px";
    div.style.padding = "12px";
    div.style.borderRadius = "8px";
    div.style.boxShadow = "0 1px 6px #0001";
    div.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <strong>Order #${idx + 1}</strong>
        <span style="font-size:0.95em;color:#888;">${date}</span>
      </div>
      <div style="margin:7px 0 0 0;">
        <b>Name:</b> ${order.name}<br>
        <b>Email:</b> ${order.email}<br>
        <b>Address:</b> ${order.address}<br>
        <b>Items:</b> ${order.items.map(i => i.name + " (₹" + i.price + ")").join(", ")}<br>
        <b>Total:</b> ₹${order.total}<br>
        <b>Status:</b> <span id="orderStatus${idx}" style="color:${statusColor};font-weight:bold;">${status}</span>
      </div>
      <div style="margin-top:10px;">
        <button onclick="updateOrderStatus(${idx}, 'Shipped')" style="margin-right:7px;">Mark Shipped</button>
        <button onclick="updateOrderStatus(${idx}, 'Delivered')" style="margin-right:7px;">Mark Delivered</button>
        <button onclick="removeOrder(${idx})" style="float:right;background:#e74c3c;color:#fff;">Remove</button>
      </div>
    `;
    adminOrders.appendChild(div);
  });
}
function removeOrder(idx) {
  const orders = getLS("orders");
  orders.splice(idx, 1);
  setLS("orders", orders);
  renderAdminOrders();
}
function updateOrderStatus(idx, status) {
  const orders = getLS("orders");
  if (orders[idx]) {
    orders[idx].status = status;
    setLS("orders", orders);
    renderAdminOrders();
  }
}

// --- Smooth scroll to section by ID ---
function scrollToSection(sectionId) {
  const el = document.getElementById(sectionId);
  if (el) {
    el.scrollIntoView({ behavior: "smooth" });
  }
}

// --- Today99 Deals on Home Page ---
function renderToday99Deals() {
  const today99Offers = getLS("today99offers");
  const container = document.getElementById("today99DealsSection");
  if (!container) return;
  container.innerHTML = "";
  if (today99Offers.length === 0) {
    container.innerHTML = "<p style='color:#888;'>No ₹99 deals available today.</p>";
    return;
  }
  today99Offers.forEach(item => {
    let imgHtml = "";
    if (Array.isArray(item.img) && item.img.length > 0) {
      imgHtml = `<img src="${item.img[0]}" alt="${item.name}" style="width:100%;max-width:120px;height:120px;object-fit:cover;border-radius:8px;">`;
    } else {
      imgHtml = `<img src="${item.img || 'https://cdn-icons-png.flaticon.com/512/2905/2905673.png'}" alt="${item.name}" style="width:100%;max-width:120px;height:120px;object-fit:cover;border-radius:8px;">`;
    }
    container.innerHTML += `
      <div class="today99-card" style="display:inline-block;vertical-align:top;margin:10px;padding:12px;background:#fff;border-radius:10px;box-shadow:0 2px 8px #0001;width:160px;text-align:center;">
        ${imgHtml}
        <h4 style="margin:10px 0 5px 0;font-size:1.1em;">${item.name}</h4>
        <div style="color:#888;font-size:0.95em;"><s>₹${item.mrp}</s> <b style="color:#ff3e6c;">₹${item.discounted}</b></div>
        <div style="font-size:0.9em;color:#457b9d;">${item.category || ""}${item.subcategory ? " / " + item.subcategory : ""}</div>
        <button onclick="addToCart('${item.name}')" style="margin-top:8px;background:#457b9d;color:#fff;border:none;padding:6px 14px;border-radius:5px;cursor:pointer;">Add to Cart</button>
      </div>
    `;
  });
}

// --- Special Offers Management (Code/Discount) ---
function saveSpecialOffer(code, discount) {
  const offers = getLS("specialOffers");
  offers.push({ code, discount });
  setLS("specialOffers", offers);
}
function renderSpecialOffers() {
  const offersContainer = document.getElementById("specialOffersList");
  if (!offersContainer) return;
  const offers = getLS("specialOffers");
  offersContainer.innerHTML = "";
  if (offers.length === 0) {
    offersContainer.innerHTML = "<p>No special offers found.</p>";
    return;
  }
  offers.forEach((offer, idx) => {
    const div = document.createElement("div");
    div.className = "special-offer-row";
    div.style.display = "flex";
    div.style.justifyContent = "space-between";
    div.style.alignItems = "center";
    div.style.padding = "10px";
    div.style.borderBottom = "1px solid #ddd";
    div.innerHTML = `
      <span><strong>Code:</strong> ${offer.code} | <strong>Discount:</strong> ${offer.discount}%</span>
      <button onclick="removeSpecialOffer(${idx})" style="background:#e74c3c;color:#fff;border:none;padding:5px 10px;border-radius:4px;">Remove</button>
    `;
    offersContainer.appendChild(div);
  });
}
function removeSpecialOffer(idx) {
  let offers = getLS("specialOffers");
  offers.splice(idx, 1);
  setLS("specialOffers", offers);
  renderSpecialOffers();
}

// --- Add or Update Special Offer (Improved & Robust) ---
const addOrUpdateBtn = document.getElementById("addOrUpdateSpecialOfferBtn");
if (addOrUpdateBtn) {
  addOrUpdateBtn.onclick = function () {
    const codeInput = document.getElementById("specialOfferCode");
    const discountInput = document.getElementById("specialOfferDiscount");
    if (!codeInput || !discountInput) {
      alert("Special offer form not found.");
      return;
    }
    const code = codeInput.value.trim();
    const discount = discountInput.value.trim();
    if (!code || !discount || isNaN(discount) || Number(discount) <= 0) {
      alert("Please enter a valid code and discount!");
      return;
    }
    let offers = getLS("specialOffers");
    const existingIdx = offers.findIndex(offer => offer.code === code);
    if (existingIdx !== -1) {
      offers[existingIdx].discount = Number(discount);
      alert("Special offer updated!");
    } else {
      offers.push({ code, discount: Number(discount) });
      alert("Special offer added!");
    }
    setLS("specialOffers", offers);
    if (typeof renderSpecialOffers === "function") renderSpecialOffers();
    codeInput.value = "";
    discountInput.value = "";
  };
}

// --- Apply Special Offer ---
function applySpecialOffer() {
  const code = document.getElementById("applySpecialOfferCode").value.trim();
  const offers = getLS("specialOffers");
  const offer = offers.find(offer => offer.code === code);
  if (offer) {
    const cartTotal = getCartTotal();
    const discountAmount = (cartTotal * offer.discount) / 100;
    const newTotal = cartTotal - discountAmount;
    alert(`Special offer applied! You saved ₹${discountAmount.toFixed(2)}.`);
    // Here you can also update the order summary or total amount displayed
  } else {
    alert("Invalid or expired special offer code.");
  }
}

// --- Subcategory Navigation ---
function openSubcategoryPage(subcat) {
  window.location.href = `subcategory.html?subcat=${encodeURIComponent(subcat)}`;
}

// --- DOMContentLoaded: Main UI logic ---
document.addEventListener("DOMContentLoaded", function () {
  updateCartIcon();
  updateWishlistIcon();
  loadNewArrivals();
  showCartCountInTitle();
  if (document.getElementById("adminArrivals")) renderAdminArrivals();
  if (document.getElementById("adminOrders")) renderAdminOrders();
  if (document.getElementById("today99DealsSection")) renderToday99Deals();

  // Wishlist icon click opens wishlist modal
  const heartIcon = document.querySelector(".fa-heart");
  if (heartIcon) {
    heartIcon.parentElement.style.position = "relative";
    heartIcon.style.cursor = "pointer";
    heartIcon.addEventListener("click", renderWishlist);
  }

  // Add "Add to Wishlist" buttons to all product cards (example for new arrivals)
  setTimeout(() => {
    document.querySelectorAll(".arrival-card, .electronic-card, .gift-card, .deal-card").forEach(card => {
      if (!card.querySelector(".add-wishlist-btn")) {
        const h3 = card.querySelector("h3");
        if (h3) {
          const btn = document.createElement("button");
          btn.textContent = "Add to Wishlist";
          btn.className = "add-wishlist-btn";
          btn.style.marginLeft = "10px";
          btn.onclick = function(e) {
            e.stopPropagation();
            addToWishlist(h3.textContent);
          };
          card.appendChild(btn);
        }
      }
    });
  }, 500);

  // Image preview for admin product upload (single image fallback)
  const imgInput = document.getElementById("adminProductImg");
  if (imgInput) {
    imgInput.addEventListener("input", function() {
      let preview = document.getElementById("adminImgPreview");
      if (!preview) {
        preview = document.createElement("img");
        preview.id = "adminImgPreview";
        preview.style.maxWidth = "80px";
        preview.style.margin = "10px 0";
        imgInput.parentElement.appendChild(preview);
      }
      preview.src = imgInput.value || "https://cdn-icons-png.flaticon.com/512/2905/2905673.png";
      preview.alt = "Product Preview";
    });
  }

  // Newsletter form
  const newsletterForm = document.getElementById("newsletterForm");
  if (newsletterForm) {
    newsletterForm.onsubmit = function(e) {
      e.preventDefault();
      const email = document.getElementById("newsletterEmail").value.trim();
      if (!email.match(/^[^@]+@[^@]+\.[^@]+$/)) {
        document.getElementById("newsletterMsg").textContent = "Please enter a valid email.";
        return;
      }
      document.getElementById("newsletterMsg").textContent = "Thank you for subscribing!";
      document.getElementById("newsletterEmail").value = "";
    };
  }

  // Remove any lingering wishlist modal on page load
  const oldWishlistModal = document.getElementById("wishlistModal");
  if (oldWishlistModal) oldWishlistModal.remove();
});

// --- Expose for inline event handlers ---
window.addToCart = addToCart;
window.buyNow = buyNow;
window.removeOrder = removeOrder;
window.updateOrderStatus = updateOrderStatus;
window.removeItem = removeItem;
window.removeFromWishlist = removeFromWishlist;
window.renderWishlist = renderWishlist;
window.editArrival = editArrival;
window.renderAdminArrivals = renderAdminArrivals;
window.openSubcategoryPage = openSubcategoryPage;