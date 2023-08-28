export const check = (req, res) => {
    try {
        res.status(200).send(
            '<h1>Health check: PASS! GitHub Action online!</h1>',
        );
    } catch (e) {
        res.status(400).send(e);
    }
};
