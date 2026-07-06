const axios = require('axios');

module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method Not Allowed' });
        return;
    }

    try {
        const AMOCRM_DOMAIN = `https://${process.env.AMOCRM_SUBDOMAIN}.amocrm.ru`;
        const TOKEN = process.env.AMOCRM_LONG_LIVED_TOKEN;

        const { name, phone, region, product, price } = req.body;

        const customFields = [];
        if (phone) {
            customFields.push({ field_code: 'PHONE', values: [{ value: phone }] });
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

        const createdLeadId = leadResponse.data[0]?.id;

        // 2. Add Note if region exists
        if (createdLeadId && region) {
            let noteText = `Hudud: ${region}\n`;

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

        res.status(200).json({ success: true, message: 'Lead created successfully' });

    } catch (error) {
        console.error('amoCRM Error:', error.response ? JSON.stringify(error.response.data, null, 2) : error.message);
        res.status(500).json({ success: false, error: 'Failed to create lead' });
    }
};
