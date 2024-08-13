require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { LookerNodeSDK } = require('@looker/sdk-node');

const app = express();
const port = 3001;

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

const sdk = LookerNodeSDK.init40();

async function createSignedUrl(targetUrl) {
  try {
    const user = {
      external_user_id: '7777777',
      first_name: 'Prabha7',
      last_name: 'Embed7',
      session_length: 3600,
      force_logout_login: true,
      permissions: [
        'access_data',
        'see_looks',
        'see_user_dashboards',
        'explore'
      ],
      models: ['sales'],
      group_ids: [23],
      external_group_id: '23',
      user_attributes: { 'locale': 'en_US' },
      access_filters: {}
    };

    const embedUrl = await sdk.ok(sdk.create_sso_embed_url({
      target_url: targetUrl,
      embed_domain: "http://localhost:3000",
      ...user
    }));

    console.log('Full embed URL:', embedUrl.url);
    return embedUrl.url;
  } catch (error) {
    console.error('Error creating embed URL:', error);
    throw error;
  }
}

app.get('/auth/dashboard', async (req, res) => {
  try {
    const url = await createSignedUrl(`${process.env.LOOKERSDK_BASE_URL}/embed/dashboards/332`);
    res.json({ url });
  } catch (error) {
    console.error('Dashboard embed error:', error);
    res.status(500).json({ error: 'Failed to generate dashboard embed URL' });
  }
});

app.get('/auth/explore', async (req, res) => {
  try {
    const url = await createSignedUrl(`${process.env.LOOKERSDK_BASE_URL}/embed/explore/sales/order_items`);
    res.json({ url });
  } catch (error) {
    console.error('Explore embed error:', error);
    res.status(500).json({ error: 'Failed to generate explore embed URL' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});