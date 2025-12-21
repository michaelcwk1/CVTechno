
 // api/_store.js
export const store = new Map();

export function getOrder(orderId) {
  return store.get(orderId);
}

export function setOrder(orderId, orderData) {
  store.set(orderId, {
    ...orderData,
    updatedAt: Date.now()
  });
}

export function orderExists(orderId) {
  return store.has(orderId);
}

setInterval(() => {
  const now = Date.now();
  const ttl = 24 * 60 * 60 * 1000;

  for (const [orderId, order] of store.entries()) {
    if (order.status !== 'success' && (now - order.createdAt) > ttl) {
      console.log(`🗑️ Removing expired order: ${orderId}`);
      store.delete(orderId);
    }
  }
}, 60 * 60 * 1000);