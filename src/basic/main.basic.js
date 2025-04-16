import { App } from "@/app";
import { getInitialProducts } from "@/entities/product";
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
} from "@/features/discount";
import eventManager from "@/shared/event-manager";
import store from "@/shared/store";

const render = () => {
  const $root = document.getElementById("app");
  $root.innerHTML = App();

  eventManager.registerEvents();
};

function main() {
  const initalProducts = getInitialProducts();

  store.setState({ products: getInitialProducts() });
  store.setState({ lastSelectedProductId: initalProducts[0].id });

  store.subscribe(render);

  render();
  eventManager.registerEvents();

  setTimeout(() => {
    setInterval(() => {
      const { products } = store.getState();
      const luckyProduct = pickRandomDiscountProduct(products);
      if (luckyProduct) {
        applyDiscount(luckyProduct, RANDOM_DISCOUNT_RATE);
        alertRandomDiscount(luckyProduct);
        store.setState({ products });
      }
    }, RANDOM_DISCOUNT_INTERVAL);
  }, generateRandomDiscountStartDelay());

  setTimeout(() => {
    setInterval(() => {
      const { lastSelectedProductId, products } = store.getState();
      if (lastSelectedProductId) {
        const suggest = pickSuggestedDiscountProduct(
          products,
          lastSelectedProductId,
        );
        if (suggest) {
          alertSuggestedDiscount(suggest);
          applyDiscount(suggest, SUGGESTED_DISCOUNT_RATE);
          store.setState({ products });
        }
      }
    }, SUGGESTED_DISCOUNT_INTERVAL);
  }, generateSuggestedDiscountStartDelay());
}

main();
