setTimeout(() => {
  const splash = document.getElementById("splash-screen");
  if (splash) splash.remove();
}, 4000);

document.addEventListener("DOMContentLoaded", () => {
  const productContainer = document.getElementById("product-container");
  const searchInput = document.getElementById("searchInput");
  const checkbox = document.getElementById("topup-checkbox");
  const section = document.getElementById("topup-section");

  let allProducts = [];

  // 初始載入時先顯示提示
  productContainer.innerHTML = "<p>商品資料即將載入...</p>";

  // 載入商品資料
  fetch("get_products.php")
    .then(res => res.json())
    .then(data => {
      allProducts = data;
      renderProducts(allProducts);
    })
    .catch(error => {
      console.error("錯誤：", error);
      productContainer.innerHTML = "<p>商品資料載入失敗，請稍後再試。</p>";
    });

  // 渲染商品的函數
  function renderProducts(products) {
    productContainer.innerHTML = "";

    products.forEach(product => {
      const card = document.createElement("div");
      card.className = "product-card";
      card.innerHTML = `
	  <div class="product-title">${product.name}</div>
	  <div class="product-price">NT$${product.price}</div>
	  <div class="product-info"><b>烘焙度：</b>${product.roast_level}</div>
	  <div class="product-info"><b>產地：</b>${product.origin}</div>
	  <div class="product-info"><b>品種：</b>${product.variety}</div>
	  <div class="product-info"><b>處理方式：</b>${product.process_method}</div>
	  <div class="product-info"><b>風味：</b>${product.flavor_notes}</div>

	  <div class="product-cart-control">
		<div class="qty-control">
		  <button class="qty-btn qty-decrease" data-id="${product.id}">−</button>
		  <span class="qty-value" id="qty-${product.id}">1</span>
		  <button class="qty-btn qty-increase" data-id="${product.id}">＋</button>
		</div>
		<button class="add-to-cart-btn" data-id="${product.id}" data-name="${product.name}" data-price="${product.price}">
		  🛒 加入購物車
		</button>
	  </div>
	`;
      productContainer.appendChild(card);
    });
  }

  document.getElementById("searchInput").addEventListener("input", filterProducts);
	document.getElementById("filterRoast").addEventListener("change", filterProducts);
	document.getElementById("filterOrigin").addEventListener("change", filterProducts);

	function filterProducts() {
	  const keyword = document.getElementById("searchInput").value.trim().toLowerCase();
	  const roast = document.getElementById("filterRoast").value;
	  const origin = document.getElementById("filterOrigin").value;

	  const filtered = allProducts.filter(p => {
		const matchKeyword =
		  p.name.toLowerCase().includes(keyword) ||
		  p.origin.toLowerCase().includes(keyword) ||
		  p.roast_level.toLowerCase().includes(keyword) ||
		  p.variety.toLowerCase().includes(keyword) ||
		  p.process_method.toLowerCase().includes(keyword) ||
		  p.flavor_notes.toLowerCase().includes(keyword);

		const matchRoast = roast === "" || p.roast_level === roast;
		const matchOrigin = origin === "" || p.origin.includes(origin);

		return matchKeyword && matchRoast && matchOrigin;
	  });

	  renderProducts(filtered);
	}

 document.addEventListener("click", (e) => {
  // 加入購物車
  if (e.target.classList.contains("add-to-cart-btn")) {
    const id = e.target.getAttribute("data-id");
    const name = e.target.getAttribute("data-name");
    const price = parseInt(e.target.getAttribute("data-price"));
    const qty = parseInt(document.getElementById(`qty-${id}`).textContent) || 1;

    const product = {id,name,price,quantity: qty,packaging: userSelectedPackaging };
    addToCart(product);
  }

  // 數量增加
  if (e.target.classList.contains("qty-increase")) {
    const id = e.target.getAttribute("data-id");
    const qtyEl = document.getElementById(`qty-${id}`);
    let qty = parseInt(qtyEl.textContent);
    qtyEl.textContent = qty + 1;
  }

  // 數量減少
  if (e.target.classList.contains("qty-decrease")) {
    const id = e.target.getAttribute("data-id");
    const qtyEl = document.getElementById(`qty-${id}`);
    let qty = parseInt(qtyEl.textContent);
    if (qty > 1) qtyEl.textContent = qty - 1;
  }
});

  // 顯示儲值區塊
  if (checkbox && section) {
    checkbox.addEventListener("change", () => {
      section.style.display = checkbox.checked ? "block" : "none";
    });
  }
});

// 🛒 購物車
let cart = JSON.parse(localStorage.getItem("cart")) || [];

function addToCart(product) {
  const index = cart.findIndex(item => item.id === product.id);
  if (index > -1) {
    cart[index].quantity += product.quantity;
  } else {
    cart.push(product);
  }
  localStorage.setItem("cart", JSON.stringify(cart));
  alert(`✅ 已將「${product.name}」加入購物車（共 ${product.quantity} 份）！`);
}


let selectedProduct = null; // 暫存使用者按下的商品

document.addEventListener("click", (e) => {
  if (e.target.classList.contains("add-to-cart-btn")) {
    const id = e.target.getAttribute("data-id");
    const name = e.target.getAttribute("data-name");
    const price = parseInt(e.target.getAttribute("data-price"));
    const qty = parseInt(document.getElementById(`qty-${id}`).textContent) || 1;

    // 存起來暫時等選完包裝再加入
    selectedProduct = { id, name, price, quantity: qty };

    // 打開彈窗
    document.getElementById("packagingModal").classList.remove("hidden");
  }
});

// 確認選擇包裝
document.getElementById("confirmPackaging").addEventListener("click", () => {
  const packaging = document.getElementById("packagingSelect").value;

  selectedProduct.packaging = packaging;
  addToCart(selectedProduct);

  // 關閉彈窗
  document.getElementById("packagingModal").classList.add("hidden");
});

// 取消選擇
document.getElementById("cancelPackaging").addEventListener("click", () => {
  selectedProduct = null;
  document.getElementById("packagingModal").classList.add("hidden");
});


document.addEventListener('DOMContentLoaded', () => {
  const consentEl = document.getElementById('cookie-consent');
  const acceptBtn = document.getElementById('accept-cookie-btn');

  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  }

  function setCookie(name, value, days) {
    const d = new Date();
    d.setTime(d.getTime() + days*24*60*60*1000);
    document.cookie = `${name}=${value};expires=${d.toUTCString()};path=/`;
  }

  if (getCookie('cookieConsent') === 'true') {
    consentEl.style.display = 'none';
  } else {
    consentEl.style.display = 'flex';
  }

  acceptBtn.addEventListener('click', () => {
    setCookie('cookieConsent', 'true', 365);
    consentEl.style.display = 'none';
  });
});
