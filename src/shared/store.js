import { createStore } from "@/shared/lib/store";

const store = createStore({
  products: [],
  lastSelectedProductId: null,
  cart: [],
});

export default store;
