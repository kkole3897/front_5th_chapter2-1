import { useState } from "react";

import {
  type Product,
  getInitialProducts,
  findProductById,
  MESSAGES,
  formatProductOptionContent,
  hasStock,
  isProductQuantityMoreOrEqual,
  generateStockAlertMessage,
} from "@/entities/product";
import { calcBonusPoints } from "@/entities/bonus-point";
import {
  type CartItem,
  generateCartItemText,
  getCartItemByProductId,
  createCartItem,
} from "@/features/manage-cart";
import {
  getDiscountRatePerProductInCart,
  isBulkDiscountAvailable,
  BULK_DISCOUNT_RATE,
  getDiscountRateByDayOfWeek,
} from "@/features/discount";

const calcCart = (products: Product[], cart: CartItem[]) => {
  let totalAmount = 0;
  let itemCounts = 0;
  let totalAmountWithoutDiscount = 0;

  for (let i = 0; i < cart.length; i++) {
    const cartItem = cart[i];
    const product = findProductById(products, cartItem.productId)!;

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

export default function AdvancedApp() {
  const [products, setProducts] = useState(() => getInitialProducts());
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState(products[0].id);
  const [lastSelectedProductId, setLastSelectedProductId] = useState<
    null | Product["id"]
  >(null);

  const [totalAmount, discountRate] = calcCart(products, cart);
  const bonusPoints = calcBonusPoints(totalAmount);

  const handleCartItemQuantityChange = (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    const { target } = event;
    const { productId, change } = (target as HTMLButtonElement).dataset;

    const foundProduct = findProductById(products, productId!)!;
    const cartItem = getCartItemByProductId(cart, productId!)!;

    const quantityToChange = parseInt(change!, 10);
    const currentQuantity = cartItem.quantity;

    const newQuantity = currentQuantity + quantityToChange;

    if (
      newQuantity > 0 &&
      newQuantity <= foundProduct.quantity + currentQuantity
    ) {
      // 상품 재고 업데이트
      const newFoundProduct = {
        ...foundProduct,
        quantyty: foundProduct.quantity - quantityToChange,
      };
      const newProducts = products.map((product) => {
        if (product.id === newFoundProduct.id) {
          return newFoundProduct;
        }

        return product;
      });
      setProducts(newProducts);

      // 장바구니 아이템 수량 업데이트
      const newCartItem = {
        ...cartItem,
        quantity: newQuantity,
      };
      const newCart = cart.map((item) => {
        if (item.id === newCartItem.id) {
          return newCartItem;
        }

        return item;
      });
      setCart(newCart);
    } else if (newQuantity <= 0) {
      const newFoundProduct = {
        ...foundProduct,
        quantity: foundProduct.quantity - quantityToChange,
      };
      const newProducts = products.map((product) => {
        if (product.id === newFoundProduct.id) {
          return newFoundProduct;
        }

        return product;
      });
      setProducts(newProducts);

      const newCart = cart.filter((item) => item.id !== cartItem.id);
      setCart(newCart);
    } else {
      alert(MESSAGES.outOfStock);
    }
  };

  const handleChangeProductSelect = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const { target } = event;
    const { value } = target;

    setSelectedProductId(value);
  };

  const handleRemoveCartItem = (event: React.MouseEvent<HTMLButtonElement>) => {
    const { target } = event;
    const { productId } = (target as HTMLButtonElement).dataset;

    const cartItem = getCartItemByProductId(cart, productId!)!;
    const foundProduct = findProductById(products, productId!)!;

    const quantityToRemove = cartItem.quantity;

    // 상품 재고 업데이트
    const newFoundProduct = {
      ...foundProduct,
      quantity: foundProduct.quantity + quantityToRemove,
    };
    const newProducts = products.map((product) => {
      if (product.id === newFoundProduct.id) {
        return newFoundProduct;
      }

      return product;
    });
    setProducts(newProducts);

    // 장바구니 아이템 삭제
    const newCart = cart.filter((item) => item.id !== cartItem.id);
    setCart(newCart);
  };

  const handleAddToCart = () => {
    const productToAdd = findProductById(products, selectedProductId);

    if (productToAdd && hasStock(productToAdd)) {
      const cartItem = getCartItemByProductId(cart, productToAdd.id);
      if (cartItem) {
        const newQuantity = cartItem.quantity + 1;
        if (isProductQuantityMoreOrEqual(productToAdd, newQuantity)) {
          const newCartItem = {
            ...cartItem,
            quantity: newQuantity,
          };
          const newCart = cart.map((cartItem) => {
            if (cartItem.id === newCartItem.id) {
              return newCartItem;
            }

            return cartItem;
          });
          setCart(newCart);

          const newProduct = {
            ...productToAdd,
            quantity: productToAdd.quantity - 1,
          };
          const newProducts = products.map((product) => {
            if (product.id === newProduct.id) {
              return newProduct;
            }

            return product;
          });
          setProducts(newProducts);
        } else {
          alert(MESSAGES.outOfStock);
        }
      } else {
        const newCartItem = createCartItem(productToAdd.id, 1);
        const newCart = [...cart, newCartItem];
        setCart(newCart);

        const newProduct = {
          ...productToAdd,
          quantity: productToAdd.quantity - 1,
        };
        const newProducts = products.map((product) => {
          if (product.id === newProduct.id) {
            return newProduct;
          }

          return product;
        });
        setProducts(newProducts);
      }
      setLastSelectedProductId(selectedProductId);
    }
  };

  return (
    <div className="bg-gray-100 p-8">
      <h1 className="mb-4 text-2xl font-bold">장바구니</h1>
      <div id="cart-items" className="my-4 text-xl font-bold">
        {cart.map((cartItem) => {
          const product = findProductById(products, cartItem.productId)!;

          return (
            <div
              key={cartItem.id}
              className="mb-2 flex items-center justify-between"
            >
              <span>{generateCartItemText(product, cartItem.quantity)}</span>
              <div>
                <button
                  className="quantity-change mr-1 rounded bg-blue-500 px-2 py-1 text-white"
                  data-product-id={cartItem.productId}
                  data-change="-1"
                  onClick={handleCartItemQuantityChange}
                >
                  -
                </button>
                <button
                  className="quantity-change mr-1 rounded bg-blue-500 px-2 py-1 text-white"
                  data-product-id={cartItem.productId}
                  data-change="1"
                  onClick={handleCartItemQuantityChange}
                >
                  +
                </button>
                <button
                  className="remove-item rounded bg-red-500 px-2 py-1 text-white"
                  data-product-id={cartItem.productId}
                  onClick={handleRemoveCartItem}
                >
                  삭제
                </button>
              </div>
            </div>
          );
        })}
      </div>
      <div id="cart-total" className="my-4 text-xl font-bold">
        총액: {totalAmount}원
        {discountRate > 0 && (
          <span className="ml-2 text-green-500">
            {(discountRate * 100).toFixed(1)}% 할인 적용
          </span>
        )}
        <span id="loyalty-points" className="ml-2 text-blue-500">
          (포인트: {bonusPoints})
        </span>
      </div>
      <select
        id="product-select"
        className="mr-2 rounded border p-2"
        onChange={handleChangeProductSelect}
      >
        {products.map((product) => (
          <option
            key={product.id}
            value={product.id}
            disabled={!hasStock(product)}
          >
            {formatProductOptionContent(product)}
          </option>
        ))}
      </select>
      <button
        id="add-to-cart"
        className="rounded bg-blue-500 px-4 py-2 text-white"
        onClick={handleAddToCart}
      >
        추가
      </button>
      <div id="stock-status" className="mt-2 text-sm text-gray-500">
        {products.map((product) => generateStockAlertMessage(product))}
      </div>
    </div>
  );
}
