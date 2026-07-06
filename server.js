const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const AMOCRM_DOMAIN = `https://${process.env.AMOCRM_SUBDOMAIN}.amocrm.ru`;
const TOKEN = process.env.AMOCRM_LONG_LIVED_TOKEN;

app.post('/api/lead', async (req, res) => {
    try {
        const { name, phone, email, message, region, product, price } = req.body;

        const customFields = [];
        if (phone) {
            customFields.push({ field_code: 'PHONE', values: [{ value: phone }] });
        }
        if (email) {
            customFields.push({ field_code: 'EMAIL', values: [{ value: email }] });
        }

        const complexPayload = [
            {
                name: `Buyurtma: ${product || 'Saytdan yangi lead'}`,
                price: parseInt(price) || 0,
                _embedded: {
                    contacts: [
                        {
                            first_name: name || 'Noma\'lum',
                            custom_fields_values: customFields.length > 0 ? customFields : undefined
                        }
                    ]
                }
            }
        ];

        // 1. Create Lead and Contact
        const leadResponse = await axios.post(`${AMOCRM_DOMAIN}/api/v4/leads/complex`, complexPayload, {
            headers: {
                'Authorization': `Bearer ${TOKEN}`,
                'Content-Type': 'application/json'
            }
        });

        // Get the created lead ID
        const createdLeadId = leadResponse.data[0]?.id;

        // 2. Add Note if message or region exists
        if (createdLeadId && (message || region)) {
            let noteText = '';
            if (region) noteText += `Hudud: ${region}\n`;
            if (message) noteText += `Xabar: ${message}\n`;

            const notePayload = [
                {
                    note_type: 'common',
                    params: {
                        text: noteText.trim()
                    }
                }
            ];

            await axios.post(`${AMOCRM_DOMAIN}/api/v4/leads/${createdLeadId}/notes`, notePayload, {
                headers: {
                    'Authorization': `Bearer ${TOKEN}`,
                    'Content-Type': 'application/json'
                }
            });
        }

        res.json({ success: true, message: 'Lead created successfully' });

    } catch (error) {
        console.error('amoCRM Error:', error.response ? JSON.stringify(error.response.data, null, 2) : error.message);
        res.status(500).json({ success: false, error: 'Failed to create lead' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
