const fs = require('fs');
const { Client, LocalAuth } = require('whatsapp-web.js');

// Initialize the client with session persistence
const client = new Client({
    authStrategy: new LocalAuth({
        dataPath: './session_data', // Directory for session storage
    }),
});

client.on('qr', (qr) => {
    console.log('QR Code Received. Scan it with your WhatsApp app.');
    const qrcode = require('qrcode-terminal');
    qrcode.generate(qr, { small: true });
});

client.on('authenticated', () => {
    console.log('Authentication successful!');
});

client.on('ready', async () => {
    console.log('Client is ready! Searching for chat...');

    try {
        const chatName = 'BARABARD'; // Replace with the name of the chat you want to find
        const chats = await client.getChats();

        // Find the chat by name
        const targetChat = chats.find(chat => chat.name === chatName);

        if (!targetChat) {
            console.log(`Chat with name "${chatName}" not found.`);
            return;
        }

        console.log(`Chat "${chatName}" found. Fetching messages...`);

        // Fetch messages from the chat
        const messages = await targetChat.fetchMessages({ limit: 100 }); // Adjust limit as needed
        const today = new Date();

        // Filter messages from today
        const todayMessages = messages.filter(message => {
            const messageDate = new Date(message.timestamp * 1000); // Convert timestamp to milliseconds
            return (
                messageDate.toDateString() === today.toDateString() // Compare date strings
            );
        });

        if (todayMessages.length === 0) {
            console.log('No messages found for today.');
        } else {
            console.log(`Found ${todayMessages.length} messages from today.`);

            // Export messages to a file
            const messagesText = todayMessages
                .map(message => `[${new Date(message.timestamp * 1000).toLocaleTimeString()}] ${message.from}: ${message.body}`)
                .join('\n');

            fs.writeFileSync(`${chatName}_today_messages.txt`, messagesText);
            console.log(`Messages exported to "${chatName}_today_messages.txt".`);
        }
    } catch (error) {
        console.error('Error fetching chat messages:', error);
    }
});

client.on('disconnected', (reason) => {
    console.log('Client was logged out:', reason);
});

client.initialize();








const axios = require('axios');

// Set your OpenAI API key
const OPENAI_API_KEY = ''; // Replace with your OpenAI API key

// Function to send a question to ChatGPT
async function askChatGPT(question) {
    try {
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-3.5-turbo', // Specify the model (e.g., gpt-4 or gpt-3.5-turbo)
                messages: [
                    { role: 'system', content: 'You are a helpful assistant.' },
                    { role: 'user', content: question },
                ],
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${OPENAI_API_KEY}`,
                },
            }
        );

        // Extract the text response
        const answer = response.data.choices[0].message.content.trim();
        return answer;
    } catch (error) {
        console.error('Error communicating with OpenAI API:', error.response?.data || error.message);
        throw new Error('Failed to get a response from ChatGPT.');
    }
}

// Example usage
(async () => {
    const question = 'What is the capital of France?';
    const answer = await askChatGPT(question);
    console.log('Answer:', answer);
})();
