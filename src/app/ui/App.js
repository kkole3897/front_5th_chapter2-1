import { calcBonusPoints } from "@/entities/bonus-point";
import {
  formatProductOptionContent,
  hasStock,
  generateStockAlertMessage,
  findProductById,
  isProductQuantityMoreOrEqual,
  MESSAGES,
} from "@/entities/product";
import {
  getDiscountRatePerProductInCart,
  isBulkDiscountAvailable,
  BULK_DISCOUNT_RATE,
  getDiscountRateByDayOfWeek,
} from "@/features/discount";
import {
  getCartItemByProductId,
  createCartItem,
  generateCartItemText,
} from "@/features/manage-cart";
import eventManager from "@/shared/event-manager";
import store from "@/shared/store";

eventManager.addEvent("click", "#add-to-cart", () => {
  const { products, cart } = store.getState();

  const $productSelect = document.getElementById("product-select");
  const selectedProductId = $productSelect.value;

  console.log(selectedProductId);

  const productToAdd = findProductById(products, selectedProductId);
  if (productToAdd && hasStock(productToAdd)) {
    const cartItem = getCartItemByProductId(cart, productToAdd.id);
    if (cartItem) {
      const newQuantity = cartItem.quantity + 1;
      if (isProductQuantityMoreOrEqual(productToAdd, newQuantity)) {
        cartItem.quantity = newQuantity;
        productToAdd.quantity -= 1;
      } else {
        alert(MESSAGES.outOfStock);
      }
    } else {
      const newCartItem = createCartItem(productToAdd.id, 1);
      store.setState({ cart: [...cart, newCartItem] });
      productToAdd.quantity -= 1;
    }
    store.setState({ lastSelectedProductId: selectedProductId });
  }
});

eventManager.addEvent("click", ".quantity-change", (event) => {
  const { products, cart } = store.getState();

  const { target } = event;
  const { productId } = target.dataset;

  const foundProduct = products.find((product) => product.id === productId);
  const cartItem = getCartItemByProductId(cart, productId);

  const quantityToChange = parseInt(target.dataset.change, 10);
  const currentQuantity = cartItem.quantity;

  const newQuantity = currentQuantity + quantityToChange;

  if (
    newQuantity > 0 &&
    newQuantity <= foundProduct.quantity + currentQuantity
  ) {
    foundProduct.quantity -= quantityToChange;
    cartItem.quantity = newQuantity;
    store.setState({ cart });
  } else if (newQuantity <= 0) {
    foundProduct.quantity -= quantityToChange;
    const newCart = cart.filter((cartItem) => cartItem.productId !== productId);
    store.setState({ cart: newCart });
  } else {
    alert(MESSAGES.outOfStock);
  }
});

eventManager.addEvent("click", ".remove-item", (event) => {
  const { products, cart } = store.getState();

  const { target } = event;
  const { productId } = target.dataset;

  const cartItem = getCartItemByProductId(cart, productId);
  const foundProduct = products.find((product) => product.id === productId);

  const quantityToRemove = cartItem.quantity;
  foundProduct.quantity += quantityToRemove;

  const newCart = cart.filter((cartItem) => cartItem.productId !== productId);
  store.setState({ cart: newCart });
});

const calcCart = (products, cart) => {
  let totalAmount = 0;
  let itemCounts = 0;
  let totalAmountWithoutDiscount = 0;

  for (let i = 0; i < cart.length; i++) {
    const cartItem = cart[i];
    const product = findProductById(products, cartItem.productId);

    itemCounts += cartItem.quantity;

    const curProductAmount = product.price * cartItem.quantity;
    totalAmountWithoutDiscount += curProductAmount;

    const discountRate = getDiscountRatePerProductInCart(
      product,
      cartItem.quantity,
    );
    totalAmount += curProductAmount * (1 - discountRate);
  }

  let discountRate = 0;
  if (isBulkDiscountAvailable(itemCounts)) {
    const bulkDiscount = totalAmount * BULK_DISCOUNT_RATE;
    const itemDiscount = totalAmountWithoutDiscount - totalAmount;
    if (bulkDiscount > itemDiscount) {
      totalAmount = totalAmountWithoutDiscount * (1 - BULK_DISCOUNT_RATE);
      discountRate = BULK_DISCOUNT_RATE;
    } else {
      discountRate =
        (totalAmountWithoutDiscount - totalAmount) / totalAmountWithoutDiscount;
    }
  } else {
    discountRate =
      (totalAmountWithoutDiscount - totalAmount) / totalAmountWithoutDiscount;
  }

  const dayOfWeekDiscountRate = getDiscountRateByDayOfWeek();
  totalAmount *= 1 - dayOfWeekDiscountRate;
  discountRate = Math.max(discountRate, dayOfWeekDiscountRate);

  return [Math.round(totalAmount), discountRate];
};

const App = () => {
  const { products, cart, lastSelectedProductId } = store.getState();

  const [totalAmount, discountRate] = calcCart(products, cart);
  const bonusPoints = calcBonusPoints(totalAmount);

  return `
    <div class="bg-gray-100 p-8">
      <div class="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl p-8">
        <h1 class="text-2xl font-bold mb-4">장바구니</h1>
        <div id="cart-items">
          ${cart
            .map((cartItem) => {
              const product = findProductById(products, cartItem.productId);

              return `
              <div id="${cartItem.productId}" class="flex justify-between items-center mb-2">
                <span>${generateCartItemText(product, cartItem.quantity)}</span>
                <div>
                  <button class="quantity-change bg-blue-500 text-white px-2 py-1 rounded mr-1" data-product-id="${cartItem.productId}" data-change="-1">-</button>
                  <button class="quantity-change bg-blue-500 text-white px-2 py-1 rounded mr-1" data-product-id="${cartItem.productId}" data-change="1">+</button>
                  <button class="remove-item bg-red-500 text-white px-2 py-1 rounded" data-product-id="${cartItem.productId}">삭제</button>
                </div>
              </div>
            `;
            })
            .join("")}
        </div>
        <div id="cart-total" class="text-xl font-bold my-4">
          총액: ${totalAmount}원${discountRate > 0 ? `<span class="text-green-500 ml-2">(${(discountRate * 100).toFixed(1)}% 할인 적용)</span>` : ""}<span id="loyalty-points" class="text-blue-500 ml-2">(포인트: ${bonusPoints})</span>
        </div>
        <select id="product-select" class="border rounded p-2 mr-2">
          ${products
            .map((product) => {
              return `
                <option value="${product.id}" ${!hasStock(product) ? "disabled" : ""} ${product.id === lastSelectedProductId ? "selected" : ""}>${formatProductOptionContent(
                  product,
                )}</option>
              `;
            })
            .join("")}
        </select>
        <button id="add-to-cart" class="bg-blue-500 text-white px-4 py-2 rounded">추가</button>
        <div id="stock-status" class="text-sm text-gray-500 mt-2">
          ${products
            .map((product) => {
              return generateStockAlertMessage(product);
            })
            .join("")}
        </div>
      </div>
    </div>
  `;
};

export default App;
