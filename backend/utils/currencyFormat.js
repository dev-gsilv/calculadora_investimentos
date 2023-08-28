let USDollar = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

let realBr = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

let local = Intl.NumberFormat({
  style: "currency",
});

export const toBrl = (price) => {
  return realBr.format(price);
};

export const toLocal = (price) => {
  return local.format(price);
};
