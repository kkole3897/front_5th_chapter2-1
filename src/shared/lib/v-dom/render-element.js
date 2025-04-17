import { createElement } from "./create-element";
import { setupEventListeners } from "./event-manager";
import { normalizeVNode } from "./normalize-v-node";
import { updateElement } from "./update-element";

const OldNodeMap = new WeakMap();

export const renderElement = (vNode, container) => {
  const oldNode = OldNodeMap.get(container);
  const newNode = normalizeVNode(vNode);

  if (!oldNode) {
    container.appendChild(createElement(newNode));
  } else {
    updateElement(container, newNode, oldNode);
  }

  OldNodeMap.set(container, newNode);
  setupEventListeners(container);
};
