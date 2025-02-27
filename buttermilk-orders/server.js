const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const XLSX = require("xlsx");
const cors = require("cors");

const app = express();
app.use(bodyParser.json());
app.use(cors()); // Allow frontend requests

// ✅ Fix: Default Route
app.get("/", (req, res) => {
    res.send("Server is running! Use /save-order to submit data.");
});

// ✅ Save Order Data to Excel
app.post("/save-order", (req, res) => {
    const { customerName, corianderQty, cuminQty, totalAmount } = req.body;

    // Load existing data or create a new sheet
    let workbook;
    let worksheet;
    const filePath = "orders.xlsx";

    if (fs.existsSync(filePath)) {
        workbook = XLSX.readFile(filePath);
        worksheet = workbook.Sheets[workbook.SheetNames[0]];
    } else {
        workbook = XLSX.utils.book_new();
        worksheet = XLSX.utils.json_to_sheet([]);
        XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");
    }

    // Convert worksheet to JSON and append new order
    const orders = XLSX.utils.sheet_to_json(worksheet);
    orders.push({ Name: customerName, Coriander: corianderQty, Cumin: cuminQty, Total: totalAmount });

    // Write back to Excel
    const updatedSheet = XLSX.utils.json_to_sheet(orders);
    workbook.Sheets[workbook.SheetNames[0]] = updatedSheet;
    XLSX.writeFile(workbook, filePath);

    res.json({ message: "Order saved successfully!" });
});

// ✅ Redirect to UPI Payment
app.get("/pay", (req, res) => {
    const { amount } = req.query;
    if (!amount || amount <= 0) {
        return res.status(400).json({ error: "Invalid payment amount" });
    }

    const upiID = "7024876268@paytm"; // Change to your UPI ID
    const paymentURL = `upi://pay?pa=${upiID}&pn=Sip n Savor Milk&mc=&tid=&tr=&tn=ButterMilk Order&am=${amount}&cu=INR`;

    res.redirect(paymentURL);
});

// ✅ Start Server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
