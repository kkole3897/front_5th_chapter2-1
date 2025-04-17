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
import { createVNode } from "@/shared/lib/v-dom";
import store from "@/shared/store";

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
  const { products, cart } = store.getState();

  const [totalAmount, discountRate] = calcCart(products, cart);
  const bonusPoints = calcBonusPoints(totalAmount);

  const handleQuantityChange = (event) => {
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
      const newCart = cart.filter(
        (cartItem) => cartItem.productId !== productId,
      );
      store.setState({ cart: newCart });
    } else {
      alert(MESSAGES.outOfStock);
    }
  };

  const handleRemoveItem = (event) => {
    const { products, cart } = store.getState();

    const { target } = event;
    const { productId } = target.dataset;

    const cartItem = getCartItemByProductId(cart, productId);
    const foundProduct = products.find((product) => product.id === productId);

    const quantityToRemove = cartItem.quantity;
    foundProduct.quantity += quantityToRemove;

    const newCart = cart.filter((cartItem) => cartItem.productId !== productId);
    store.setState({ cart: newCart });
  };

  const handleChangeProductSelect = (event) => {
    store.setState({ lastSelectedProductId: event.target.value });
  };

  const handleAddToCart = () => {
    const $select = document.getElementById("product-select");
    const selectedProductId = $select.value;

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
  };

  return createVNode(
    "div",
    {
      className: "bg-gray-100 p8",
    },
    [
      createVNode(
        "div",
        {
          className:
            "max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl p-8",
        },
        [
          createVNode("h1", { className: "text-2xl font-bold mb-4" }, [
            "장바구니",
          ]),
          createVNode("div", { id: "cart-items" }, [
            cart.map((cartItem) => {
              const product = findProductById(products, cartItem.productId);

              return createVNode(
                "div",
                {
                  id: cartItem.productId,
                  className: "flex justify-between items-center mb-2",
                },
                [
                  createVNode("span", undefined, [
                    generateCartItemText(product, cartItem.quantity),
                  ]),
                  createVNode("div", undefined, [
                    createVNode(
                      "button",
                      {
                        className:
                          "quantity-change bg-blue-500 text-white px-2 py-1 rounded mr-1",
                        "data-product-id": cartItem.productId,
                        "data-change": "-1",
                        onClick: handleQuantityChange,
                      },
                      ["-"],
                    ),
                    createVNode(
                      "button",
                      {
                        className:
                          "quantity-change bg-blue-500 text-white px-2 py-1 rounded mr-1",
                        "data-product-id": cartItem.productId,
                        "data-change": "1",
                        onClick: handleQuantityChange,
                      },
                      ["+"],
                    ),
                    createVNode(
                      "button",
                      {
                        className:
                          "remove-item bg-red-500 text-white px-2 py-1 rounded",
                        "data-product-id": cartItem.productId,
                        onClick: handleRemoveItem,
                      },
                      ["삭제"],
                    ),
                  ]),
                ],
              );
            }),
          ]),
          createVNode(
            "div",
            {
              id: "cart-total",
              className: "text-xl font-bold my-4",
            },
            [
              `총액: ${totalAmount}원`,
              discountRate > 0
                ? createVNode("span", { className: "text-green-500 ml-2" }, [
                    `(${(discountRate * 100).toFixed(1)}% 할인 적용)`,
                  ])
                : null,
              createVNode(
                "span",
                { id: "loyalty-points", className: "text-blue-500 ml-2" },
                [`(포인트: ${bonusPoints})`],
              ),
            ],
          ),
          createVNode(
            "select",
            {
              id: "product-select",
              className: "border rounded p-2 mr-2",
              onChange: handleChangeProductSelect,
            },
            [
              products.map((product) =>
                createVNode(
                  "option",
                  {
                    value: product.id,
                    ...(!hasStock(product) && { disabled: !hasStock(product) }),
                  },
                  [formatProductOptionContent(product)],
                ),
              ),
            ],
          ),
          createVNode(
            "button",
            {
              id: "add-to-cart",
              className: "bg-blue-500 text-white px-4 py-2 rounded",
              onClick: handleAddToCart,
            },
            ["추가"],
          ),
          createVNode(
            "div",
            { id: "stock-status", className: "text-sm text-gray-500 mt-2" },
            [products.map((product) => generateStockAlertMessage(product))],
          ),
        ],
      ),
    ],
  );
};

export default App;
