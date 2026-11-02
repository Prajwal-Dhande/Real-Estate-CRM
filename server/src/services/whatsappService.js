const axios = require('axios');

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

/**
 * Send an outgoing text message via WhatsApp Business Cloud API
 */
async function sendTextMessage(toPhone, messageBody) {
  const cleanPhone = toPhone.replace(/[^\d]/g, '');

  // If live credentials are not set, run in simulated mode
  if (!WHATSAPP_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
    console.log(`[WhatsApp API Simulation] -> To: +${cleanPhone}`);
    console.log(`[WhatsApp API Simulation] Content:\n${messageBody}\n`);
    return {
      success: true,
      simulated: true,
      messageId: `wamid.simulated.${Date.now()}`
    };
  }

  try {
    const url = `https://graph.facebook.com/v18.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`;
    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: cleanPhone,
      type: 'text',
      text: {
        preview_url: false,
        body: messageBody
      }
    };

    const response = await axios.post(url, payload, {
      headers: {
        'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    console.log(`[WhatsApp API] Successfully sent message to +${cleanPhone}:`, response.data);
    return {
      success: true,
      simulated: false,
      data: response.data
    };
  } catch (err) {
    const errMsg = err.response ? JSON.stringify(err.response.data) : err.message;
    console.error(`[WhatsApp API Error] Failed to send message to +${cleanPhone}:`, errMsg);
    return {
      success: false,
      error: errMsg
    };
  }
}

/**
 * Compose automated professional real estate acknowledgement message
 */
function composeAutoReply({ leadName, desiredBhk, preferredLocality, budgetMax, matchedCount = 2, agentName }) {
  const greeting = leadName && leadName !== 'WhatsApp Lead' ? `Hello ${leadName}!` : 'Hello!';
  const locality = preferredLocality || 'Nagpur';
  const assignedAgent = agentName || 'our territory broker';

  return (
    `*${greeting}* 👋\n\n` +
    `Thank you for reaching out to *EstateIQ Nagpur*.\n\n` +
    `We have registered your requirement:\n` +
    `• Configuration: *${desiredBhk} BHK*\n` +
    `• Desired Locality: *${locality}*\n` +
    `• Budget: *Up to ₹${budgetMax} Lakhs*\n\n` +
    `🤖 *AI Property Match*: Our valuation engine has matched *${matchedCount} verified residential units* in ${locality}.\n\n` +
    `Your assigned territory specialist (*${assignedAgent}*) has been notified and will share curated brochures and schedule a walkthrough shortly.\n\n` +
    `_EstateIQ Nagpur Brokerage Telemetry_`
  );
}

module.exports = {
  sendTextMessage,
  composeAutoReply
};
