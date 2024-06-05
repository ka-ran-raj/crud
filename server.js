const express = require("express");
const path = require("path");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());  
app.use(express.urlencoded({ extended: false }));

mongoose.connect("mongodb://localhost:27017/VisitorsGatePassManagementSystem", { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("Database connected Successfully");
    })
    .catch(err => {
        console.log("Database connection error:", err);
    });

const GatepassSchema = new mongoose.Schema({
    passNumber: String, 
    visitorName: String,
    visitPurpose: String,
    entryTime: String, 
    exitTime: String 
});

const Gatepass = mongoose.model('gatepass', GatepassSchema);

app.use(express.static(path.join(__dirname, 'public')));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

app.post('/register', (req, res) => {
    const { passNumber, visitorName, visitPurpose, entryTime, exitTime } = req.body;
    
    const newGatepass = new Gatepass({ passNumber, visitorName, visitPurpose, entryTime, exitTime });

    newGatepass.save()
        .then(() => {
            console.log("Gatepass registered successfully");
            res.status(200).json({ message: 'Gatepass registered successfully' });
        })
        .catch(error => {
            console.error("Error registering gatepass:", error);
            res.status(500).json({ message: 'An error occurred' });
        });
});

app.post('/update', async (req, res) => {
    const { passNumber, newVisitorName, newVisitPurpose, newEntryTime, newExitTime } = req.body;
    try {
        const gatepass = await Gatepass.findOne({ passNumber }).exec();
        if (gatepass) {
            gatepass.visitorName = newVisitorName;
            gatepass.visitPurpose = newVisitPurpose;
            gatepass.entryTime = newEntryTime; 
            gatepass.exitTime = newExitTime; 
            await gatepass.save();
            console.log("Gatepass updated successfully");
            res.status(200).json({ message: 'Gatepass updated successfully' });
        } else {
            console.log("Gatepass not found");
            res.status(404).json({ message: 'Gatepass not found' });
        }
    } catch (error) {
        console.error("Error updating gatepass:", error);
        res.status(500).json({ message: 'An error occurred' });
    }
});

app.post('/delete', async (req, res) => {
    const { passNumber } = req.body;
    try {
        const gatepass = await Gatepass.findOne({ passNumber }).exec();
        if (gatepass) {
            await Gatepass.deleteOne({ passNumber });
            console.log("Gatepass deleted successfully");
            res.status(200).json({ message: 'Gatepass deleted successfully' });
        } else {
            console.log("Gatepass not found");
            res.status(404).json({ message: 'Gatepass not found' });
        }
    } catch (error) {
        console.error("Error deleting gatepass:", error);
        res.status(500).json({ message: 'An error occurred' });
    }
});

app.get('/view', async (req, res) => {
    try {
        const gatepasses = await Gatepass.find().exec();
        res.status(200).json(gatepasses);
    } catch (error) {
        console.error("Error fetching gatepasses:", error);
        res.status(500).json({ message: 'An error occurred' });
    }
});

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Server is running on Port: ${PORT}`);
});
