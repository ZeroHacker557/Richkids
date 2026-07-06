const axios = require('axios');

async function test() {
    try {
        console.log("Sending request to http://localhost:3000/api/lead...");
        const res = await axios.post('http://localhost:3000/api/lead', {
            name: "Test User",
            phone: "+998901234567",
            region: "Toshkent shahri",
            product: "Sepuvchi o'rdakcha 5 in 1",
            price: 245000
        });
        console.log("Success:", res.data);
    } catch (e) {
        console.error("Error:", e.response ? e.response.data : e.message);
    }
}

test();
