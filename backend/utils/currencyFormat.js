const USDollar = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
});

const realBr = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
});

const local = Intl.NumberFormat({
    style: 'currency',
});

export const toBrl = (price) => realBr.format(price);

export const toLocal = (price) => local.format(price);
