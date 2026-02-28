import fetch from "node-fetch";

async function run() {
    const res = await fetch("http://localhost:5005/api/products");
    const products = await res.json();
    if(products.length > 0) {
        const product = products[0];
        const size = product.sizes && product.sizes.length > 0 ? product.sizes[0].size : null;
        if(size) {
            console.log(`Triggering update on ${product._id} for size ${size}`);
            const updateRes = await fetch(`http://localhost:5005/api/products/${product._id}/size`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ size: size, stockStatus: "outOfStock" })
            });
            console.log("Update status:", updateRes.status);
            console.log(await updateRes.text());
        }
    } else {
        console.log("No products found.");
    }
}
run();
