// api/_store.js
export const store = new Map();

// Helper functions
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

// Optional: Cleanup old orders setiap jam
// (order yang sudah 24 jam dan statusnya bukan 'success' dihapus)
setInterval(() => {
  const now = Date.now();
  const ttl = 24 * 60 * 60 * 1000; // 24 jam

  for (const [orderId, order] of store.entries()) {
    if (order.status !== 'success' && (now - order.createdAt) > ttl) {
      console.log(`🗑️ Removing expired order: ${orderId}`);
      store.delete(orderId);
    }
  }
}, 60 * 60 * 1000); // Run setiap 1 jam