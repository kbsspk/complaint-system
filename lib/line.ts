import axios from 'axios';

const LINE_CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN || '';
const LINE_GROUP_ID = process.env.LINE_GROUP_ID || '';

export async function sendLineNotification(message: string) {
    if (!LINE_CHANNEL_ACCESS_TOKEN || !LINE_GROUP_ID) {
        console.warn('LINE credentials not found. Skipping notification.');
        return;
    }

    try {
        await axios.post(
            'https://api.line.me/v2/bot/message/push',
            {
                to: LINE_GROUP_ID,
                messages: [
                    {
                        type: 'text',
                        text: message,
                    },
                ],
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
                },
            }
        );
        console.log('Line notification sent successfully');
    } catch (error: any) {
        console.error('Failed to send Line notification:', error.response?.data || error.message);
    }
}
