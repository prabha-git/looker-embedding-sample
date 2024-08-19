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

async function createSignedUrl(targetUrl, isExplore = false) {
  try {
    const user = {
      external_user_id: '7777778',
      first_name: 'Prabha8',
      last_name: 'Embed8',
      session_length: 3600,
      force_logout_login: false,
      permissions: [
        'access_data',
        'see_looks',
        'see_user_dashboards',
        'explore',
        'embed_browse_spaces'
      ],
      models: ['sales','thelook_partner'],
      group_ids: [23],
      external_group_id: '23',
      user_attributes: { 'locale': 'en_US' },
      access_filters: {}
    };

    let modifiedUrl = targetUrl;
    if (!isExplore) {
      modifiedUrl += '?embed_domain=http://localhost:3000';
    } else {
      modifiedUrl += '?embed_domain=http://localhost:3000&toggle_me=false';
    }

    const embedUrl = await sdk.ok(sdk.create_sso_embed_url({
      target_url: modifiedUrl,
      ...user
    }));

    console.log('Full embed URL:', embedUrl.url);
    return embedUrl.url;
  } catch (error) {
    console.error('Error creating embed URL:', error);
    throw error;
  }
}

app.get('/auth/dashboard/:id', async (req, res) => {
  try {
    const dashboardId = req.params.id;
    const url = await createSignedUrl(`${process.env.LOOKERSDK_BASE_URL}/embed/dashboards/${dashboardId}`);
    res.json({ url });
  } catch (error) {
    console.error('Dashboard embed error:', error);
    res.status(500).json({ error: 'Failed to generate dashboard embed URL' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

app.get('/auth/explore', async (req, res) => {
  try {
    const url = await createSignedUrl(`${process.env.LOOKERSDK_BASE_URL}/embed/explore/sales/order_items`, true);
    res.json({ url });
  } catch (error) {
    console.error('Explore embed error:', error);
    res.status(500).json({ error: 'Failed to generate explore embed URL' });
  }
});