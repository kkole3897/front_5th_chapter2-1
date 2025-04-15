import {
  getInitialProducts,
  formatProductOptionContent,
  hasStock,
  generateStockAlertMessage,
  isProductQuantityMoreOrEqual,
  findProductById,
  MESSAGES,
} from "@/entities/product";
import {
  pickRandomDiscountProduct,
  applyDiscount,
  alertRandomDiscount,
  generateRandomDiscountStartDelay,
  RANDOM_DISCOUNT_INTERVAL,
  RANDOM_DISCOUNT_RATE,
  pickSuggestedDiscountProduct,
  alertSuggestedDiscount,
  generateSuggestedDiscountStartDelay,
  SUGGESTED_DISCOUNT_INTERVAL,
  SUGGESTED_DISCOUNT_RATE,
  getDiscountRatePerProductInCart,
  isBulkDiscountAvailable,
  BULK_DISCOUNT_RATE,
} from "@/features/discount";

let products;
let lastSelectedProductId;
let bonusPoints = 0;
let totalAmount = 0;
let itemCounts = 0;

let $productSelect;
let $addCartBtn;
let $cartDisplay;
let $cartSumDisplay;
let $stockInfoDisplay;

function main() {
  products = getInitialProducts();

  const $root = document.getElementById("app");
  const $content = document.createElement("div");
  const $wrap = document.createElement("div");
  const $title = document.createElement("h1");

  $cartDisplay = document.createElement("div");
  $cartSumDisplay = document.createElement("div");
  $productSelect = document.createElement("select");
  $addCartBtn = document.createElement("button");
  $stockInfoDisplay = document.createElement("div");

  $cartDisplay.id = "cart-items";
  $cartSumDisplay.id = "cart-total";
  $productSelect.id = "product-select";
  $addCartBtn.id = "add-to-cart";
  $stockInfoDisplay.id = "stock-status";

  $content.className = "bg-gray-100 p-8";
  $wrap.className =
    "max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl p-8";
  $title.className = "text-2xl font-bold mb-4";
  $cartSumDisplay.className = "text-xl font-bold my-4";
  $productSelect.className = "border rounded p-2 mr-2";
  $addCartBtn.className = "bg-blue-500 text-white px-4 py-2 rounded";
  $stockInfoDisplay.className = "text-sm text-gray-500 mt-2";

  $title.textContent = "장바구니";
  $addCartBtn.textContent = "추가";

  updateProductSelectOptions();

  $wrap.appendChild($title);
  $wrap.appendChild($cartDisplay);
  $wrap.appendChild($cartSumDisplay);
  $wrap.appendChild($productSelect);
  $wrap.appendChild($addCartBtn);
  $wrap.appendChild($stockInfoDisplay);
  $content.appendChild($wrap);
  $root.appendChild($content);

  calcCart();

  setTimeout(() => {
    setInterval(() => {
      const luckyProduct = pickRandomDiscountProduct(products);
      if (luckyProduct) {
        applyDiscount(luckyProduct, RANDOM_DISCOUNT_RATE);
        alertRandomDiscount(luckyProduct);
        updateProductSelectOptions();
      }
    }, RANDOM_DISCOUNT_INTERVAL);
  }, generateRandomDiscountStartDelay());

  setTimeout(() => {
    setInterval(() => {
      if (lastSelectedProductId) {
        const suggest = pickSuggestedDiscountProduct(
          products,
          lastSelectedProductId,
        );
        if (suggest) {
          alertSuggestedDiscount(suggest);
          applyDiscount(suggest, SUGGESTED_DISCOUNT_RATE);
          updateProductSelectOptions();
        }
      }
    }, SUGGESTED_DISCOUNT_INTERVAL);
  }, generateSuggestedDiscountStartDelay());
}

function updateProductSelectOptions() {
  $productSelect.innerHTML = "";
  products.forEach((product) => {
    const $option = document.createElement("option");
    $option.value = product.id;
    $option.textContent = formatProductOptionContent(product);
    if (!hasStock(product)) $option.disabled = true;
    $productSelect.appendChild($option);
  });
}

function calcCart() {
  totalAmount = 0;
  itemCounts = 0;

  const $cartItems = $cartDisplay.children;

  let tempTotalAmount = 0;
  for (let i = 0; i < $cartItems.length; i++) {
    const curProduct = findProductById(products, $cartItems[i].id);
    const quantity = parseInt(
      $cartItems[i].querySelector("span").textContent.split("x ")[1],
      10,
    );

    const curProductAmount = curProduct.price * quantity;

    itemCounts += quantity;
    tempTotalAmount += curProductAmount;

    const discountRate = getDiscountRatePerProductInCart(curProduct, quantity);
    totalAmount += curProductAmount * (1 - discountRate);
  }

  let discountRate = 0;
  if (isBulkDiscountAvailable(itemCounts)) {
    // TODO: 카트 상품 수량 기준 할인 적용 리팩토링
    const bulkDiscount = totalAmount * BULK_DISCOUNT_RATE;
    const itemDiscount = tempTotalAmount - totalAmount;
    if (bulkDiscount > itemDiscount) {
      totalAmount = tempTotalAmount * (1 - BULK_DISCOUNT_RATE);
      discountRate = BULK_DISCOUNT_RATE;
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

  $cartSumDisplay.textContent = `총액: ${Math.round(totalAmount)}원`;

  if (discountRate > 0) {
    const span = document.createElement("span");
    span.className = "text-green-500 ml-2";
    span.textContent = `(${(discountRate * 100).toFixed(1)}% 할인 적용)`;
    $cartSumDisplay.appendChild(span);
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
    $cartSumDisplay.appendChild($loyaltyPoints);
  }
  $loyaltyPoints.textContent = `(포인트: ${bonusPoints})`;
}

function updateStockInfo() {
  let infoMsg = "";
  products.forEach((product) => {
    infoMsg += generateStockAlertMessage(product);
  });
  $stockInfoDisplay.textContent = infoMsg;
}

main();

$addCartBtn.addEventListener("click", () => {
  const selectedProductId = $productSelect.value;
  const productToAdd = products.find(
    (product) => product.id === selectedProductId,
  );
  if (productToAdd && hasStock(productToAdd)) {
    const $cartItem = document.getElementById(productToAdd.id);
    if ($cartItem) {
      const newQuantity =
        parseInt(
          $cartItem.querySelector("span").textContent.split("x ")[1],
          10,
        ) + 1;
      if (isProductQuantityMoreOrEqual(productToAdd, newQuantity)) {
        $cartItem.querySelector("span").textContent =
          `${productToAdd.name} - ${productToAdd.price}원 x ${newQuantity}`;
        productToAdd.quantity -= 1;
      } else {
        alert(MESSAGES.outOfStock);
      }
    } else {
      const $newCartItem = document.createElement("div");
      $newCartItem.id = productToAdd.id;
      $newCartItem.className = "flex justify-between items-center mb-2";
      $newCartItem.innerHTML = `
        <span>${productToAdd.name} - ${productToAdd.price}원 x 1</span>
        <div>
          <button class="quantity-change bg-blue-500 text-white px-2 py-1 rounded mr-1" data-product-id="${productToAdd.id}" data-change="-1">-</button>
          <button class="quantity-change bg-blue-500 text-white px-2 py-1 rounded mr-1" data-product-id="${productToAdd.id}" data-change="1">+</button>
          <button class="remove-item bg-red-500 text-white px-2 py-1 rounded" data-product-id="${productToAdd.id}">삭제</button>
        </div>
      `;
      $cartDisplay.appendChild($newCartItem);
      productToAdd.quantity -= 1;
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
      const currentQuantity = parseInt(
        $targetProduct.querySelector("span").textContent.split("x ")[1],
        10,
      );

      const newQuantity = currentQuantity + quantityToChange;

      if (
        newQuantity > 0 &&
        newQuantity <= foundProduct.quantity + currentQuantity
      ) {
        $targetProduct.querySelector("span").textContent =
          `${$targetProduct.querySelector("span").textContent.split("x ")[0]}x ${newQuantity}`;
        foundProduct.quantity -= quantityToChange;
      } else if (newQuantity <= 0) {
        $targetProduct.remove();
        foundProduct.quantity -= quantityToChange;
      } else {
        alert(MESSAGES.outOfStock);
      }
    } else if (target.classList.contains("remove-item")) {
      const quantityToRemove = parseInt(
        $targetProduct.querySelector("span").textContent.split("x ")[1],
        10,
      );
      foundProduct.quantity += quantityToRemove;
      $targetProduct.remove();
    }

    calcCart();
  }
});
