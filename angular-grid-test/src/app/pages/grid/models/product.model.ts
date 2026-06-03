interface Product {
  sku: string,
  name: string,
  description: string,
  style: {
    code: string,
    value: string,
  },
}

export type { Product };
