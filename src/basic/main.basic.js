let products;
let lastSelectedProductId;
let bonusPoints = 0;
let totalAmount = 0;
let itemCounts = 0;

let $productSelect;
let $addCartBtn;
let $cartDisplay;
let $cartSum;
let $stockInfo;

function main() {
  products = [
    { id: "p1", name: "상품1", val: 10000, q: 50 },
    { id: "p2", name: "상품2", val: 20000, q: 30 },
    { id: "p3", name: "상품3", val: 30000, q: 20 },
    { id: "p4", name: "상품4", val: 15000, q: 0 },
    { id: "p5", name: "상품5", val: 25000, q: 10 },
  ];

  const $root = document.getElementById("app");
  const $content = document.createElement("div");
  const $wrap = document.createElement("div");
  const $title = document.createElement("h1");

  $cartDisplay = document.createElement("div");
  $cartSum = document.createElement("div");
  $productSelect = document.createElement("select");
  $addCartBtn = document.createElement("button");
  $stockInfo = document.createElement("div");

  $cartDisplay.id = "cart-items";
  $cartSum.id = "cart-total";
  $productSelect.id = "product-select";
  $addCartBtn.id = "add-to-cart";
  $stockInfo.id = "stock-status";

  $content.className = "bg-gray-100 p-8";
  $wrap.className =
    "max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl p-8";
  $title.className = "text-2xl font-bold mb-4";
  $cartSum.className = "text-xl font-bold my-4";
  $productSelect.className = "border rounded p-2 mr-2";
  $addCartBtn.className = "bg-blue-500 text-white px-4 py-2 rounded";
  $stockInfo.className = "text-sm text-gray-500 mt-2";

  $title.textContent = "장바구니";
  $addCartBtn.textContent = "추가";

  updateProductSelectOptions();

  $wrap.appendChild($title);
  $wrap.appendChild($cartDisplay);
  $wrap.appendChild($cartSum);
  $wrap.appendChild($productSelect);
  $wrap.appendChild($addCartBtn);
  $wrap.appendChild($stockInfo);
  $content.appendChild($wrap);
  $root.appendChild($content);

  calcCart();

  setTimeout(() => {
    setInterval(() => {
      const luckyItem = products[Math.floor(Math.random() * products.length)];
      if (Math.random() < 0.3 && luckyItem.q > 0) {
        luckyItem.val = Math.round(luckyItem.val * 0.8);
        alert(`번개세일! ${luckyItem.name}이(가) 20% 할인 중입니다!`);
        updateProductSelectOptions();
      }
    }, 30000);
  }, Math.random() * 10000);

  setTimeout(() => {
    setInterval(() => {
      if (lastSelectedProductId) {
        const suggest = products.find(
          (item) => item.id !== lastSelectedProductId && item.q > 0,
        );
        if (suggest) {
          alert(
            `${suggest.name}은(는) 어떠세요? 지금 구매하시면 5% 추가 할인!`,
          );
          suggest.val = Math.round(suggest.val * 0.95);
          updateProductSelectOptions();
        }
      }
    }, 60000);
  }, Math.random() * 20000);
}

function updateProductSelectOptions() {
  $productSelect.innerHTML = "";
  products.forEach((product) => {
    const $option = document.createElement("option");
    $option.value = product.id;
    $option.textContent = `${product.name} - ${product.val}원`;
    if (product.q === 0) $option.disabled = true;
    $productSelect.appendChild($option);
  });
}

function calcCart() {
  totalAmount = 0;
  itemCounts = 0;

  const cartItems = $cartDisplay.children;

  let tempTotalAmount = 0;
  for (let i = 0; i < cartItems.length; i++) {
    let curProduct;
    for (let j = 0; j < products.length; j++) {
      if (products[j].id === cartItems[i].id) {
        curProduct = products[j];
        break;
      }
    }
    const quantity = parseInt(
      cartItems[i].querySelector("span").textContent.split("x ")[1],
      10,
    );
    const curProductAmount = curProduct.val * quantity;
    let discountRate = 0;
    itemCounts += quantity;
    tempTotalAmount += curProductAmount;
    if (quantity >= 10) {
      if (curProduct.id === "p1") discountRate = 0.1;
      else if (curProduct.id === "p2") discountRate = 0.15;
      else if (curProduct.id === "p3") discountRate = 0.2;
      else if (curProduct.id === "p4") discountRate = 0.05;
      else if (curProduct.id === "p5") discountRate = 0.25;
    }
    totalAmount += curProductAmount * (1 - discountRate);
  }

  let discountRate = 0;
  if (itemCounts >= 30) {
    const bulkDiscount = totalAmount * 0.25;
    const itemDiscount = tempTotalAmount - totalAmount;
    if (bulkDiscount > itemDiscount) {
      totalAmount = tempTotalAmount * (1 - 0.25);
      discountRate = 0.25;
    } else {
      discountRate = (tempTotalAmount - totalAmount) / tempTotalAmount;
    }
  } else {
    discountRate = (tempTotalAmount - totalAmount) / tempTotalAmount;
  }

  if (new Date().getDay() === 2) {
    totalAmount *= 1 - 0.1;
    discountRate = Math.max(discountRate, 0.1);
  }

  $cartSum.textContent = `총액: ${Math.round(totalAmount)}원`;

  if (discountRate > 0) {
    const span = document.createElement("span");
    span.className = "text-green-500 ml-2";
    span.textContent = `(${(discountRate * 100).toFixed(1)}% 할인 적용)`;
    $cartSum.appendChild(span);
  }

  updateStockInfo();
  renderBonusPoints();
}

function renderBonusPoints() {
  bonusPoints = Math.floor(totalAmount / 1000);
  let $loyaltyPoints = document.getElementById("loyalty-points");
  if (!$loyaltyPoints) {
    $loyaltyPoints = document.createElement("span");
    $loyaltyPoints.id = "loyalty-points";
    $loyaltyPoints.className = "text-blue-500 ml-2";
    $cartSum.appendChild($loyaltyPoints);
  }
  $loyaltyPoints.textContent = `(포인트: ${bonusPoints})`;
}

function updateStockInfo() {
  let infoMsg = "";
  products.forEach((product) => {
    if (product.q < 5) {
      infoMsg += `${product.name}: ${product.q > 0 ? `재고 부족 (${product.q}개 남음)` : "품절"}`;
    }
  });
  $stockInfo.textContent = infoMsg;
}

main();

$addCartBtn.addEventListener("click", () => {
  const selectedProductId = $productSelect.value;
  const productToAdd = products.find((p) => p.id === selectedProductId);
  if (productToAdd && productToAdd.q > 0) {
    const $cartItem = document.getElementById(productToAdd.id);
    if ($cartItem) {
      const newQuantity =
        parseInt(
          $cartItem.querySelector("span").textContent.split("x ")[1],
          10,
        ) + 1;
      if (newQuantity <= productToAdd.q) {
        $cartItem.querySelector("span").textContent =
          `${productToAdd.name} - ${productToAdd.val}원 x ${newQuantity}`;
        productToAdd.q -= 1;
      } else {
        alert("재고가 부족합니다.");
      }
    } else {
      const $newCartItem = document.createElement("div");
      $newCartItem.id = productToAdd.id;
      $newCartItem.className = "flex justify-between items-center mb-2";
      $newCartItem.innerHTML = `
        <span>${productToAdd.name} - ${productToAdd.val}원 x 1</span>
        <div>
          <button class="quantity-change bg-blue-500 text-white px-2 py-1 rounded mr-1" data-product-id="${productToAdd.id}" data-change="-1">-</button>
          <button class="quantity-change bg-blue-500 text-white px-2 py-1 rounded mr-1" data-product-id="${productToAdd.id}" data-change="1">+</button>
          <button class="remove-item bg-red-500 text-white px-2 py-1 rounded" data-product-id="${productToAdd.id}">삭제</button>
        </div>
      `;
      $cartDisplay.appendChild($newCartItem);
      productToAdd.q -= 1;
    }
    calcCart();
    lastSelectedProductId = selectedProductId;
  }
});

$cartDisplay.addEventListener("click", (event) => {
  const { target } = event;

  if (
    target.classList.contains("quantity-change") ||
    target.classList.contains("remove-item")
  ) {
    const { productId } = target.dataset;
    const $targetProduct = document.getElementById(productId);
    const foundProduct = products.find((product) => product.id === productId);

    if (target.classList.contains("quantity-change")) {
      const quantityToChange = parseInt(target.dataset.change, 10);
      const newQuantity =
        parseInt(
          $targetProduct.querySelector("span").textContent.split("x ")[1],
          10,
        ) + quantityToChange;

      if (
        newQuantity > 0 &&
        newQuantity <=
          foundProduct.q +
            parseInt(
              $targetProduct.querySelector("span").textContent.split("x ")[1],
              10,
            )
      ) {
        $targetProduct.querySelector("span").textContent =
          `${$targetProduct.querySelector("span").textContent.split("x ")[0]}x ${newQuantity}`;
        foundProduct.q -= quantityToChange;
      } else if (newQuantity <= 0) {
        $targetProduct.remove();
        foundProduct.q -= quantityToChange;
      } else {
        alert("재고가 부족합니다.");
      }
    } else if (target.classList.contains("remove-item")) {
      const quantityToRemove = parseInt(
        $targetProduct.querySelector("span").textContent.split("x ")[1],
        10,
      );
      foundProduct.q += quantityToRemove;
      $targetProduct.remove();
    }

    calcCart();
  }
});
