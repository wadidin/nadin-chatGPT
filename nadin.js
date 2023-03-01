//add dependencies
const { 
    default: makeWASocket, 
    DisconnectReason, 
    useSingleFileAuthState 
} = require("@adiwajshing/baileys");
const { Boom } = require("@hapi/boom");
const { state, saveState } = useSingleFileAuthState("./login.json");

//chatGPT
const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
    apiKey: "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",
});
const openai = new OpenAIApi(configuration);

//openAI function chatGPT
async function generateResponse(text) {
    const response = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: text,
        temperature: 0.3,
        max_tokens: 2000,
        top_p: 1.0,
        frequency_penalty: 0.0,
        presence_penalty: 0.0,
    });
    return response.data.choices[0].text;
}

//main function nadin WABot
async function connectToWhatsApp()
{
    //terminal function
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true,
        defaultQueryTimeoutMs: undefined
    });

    //connection function
    sock.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === "close") {
            const shouldReconnect = (lastDisconnect.error = Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log("Koneksi terputus, karena ", lastDisconnect.error, ", silahkan hubungkan kembali...", shouldReconnect);
            if (shouldReconnect) {
                connectToWhatsApp();
            }
        }
        else if (connection === "open") {
            console.log("Koneksi terhubung...")
        }
    });
    sock.ev.on("creds.update", saveState);
    
    //function look message
    sock.ev.on("messages.upsert", async ({ messages, type }) => {
        console.log("Tipe Pesan : ", type);
        console.log(messages);
        if (type === "notify" && !messages[0].key.fromMe) {
            try {
                //sender number
                const senderNumber = messages[0].key.remoteJid;
                let incomingMessages = messages[0].message.conversation;
                if(incomingMessages === "") {
                    incomingMessages = messages[0].message.extendedTextMessage.text;
                }
                incomingMessages = incomingMessages.toLowerCase();

                //get messege info from group or not
                //messege mention for you
                const isMessagefromGroup = senderNumber.includes("@g.us");
                const isMessageMentionBot = incomingMessages.includes("@62881080013222");

                //show sender number and message
                console.log("Nomor Pengirim : ", senderNumber);
                console.log("Isi Pesan : ", incomingMessages);

                //get status messege info from group or not
                //status messege mention for you
                console.log("Apakah pesan dari group? ", isMessagefromGroup);
                console.log("Apakah pesan menyebut bot? ", isMessageMentionBot);

                //answer question
                if (!isMessagefromGroup) {
                    if (incomingMessages.includes('siapa') && incomingMessages.includes('kamu')) {
                        await sock.sendMessage(
                            senderNumber,
                            { text: "aku nadin, bot tercantik sejagat maya :)" },
                            { quoted: messages[0] },
                            2000
                        );
                    } else if (incomingMessages.includes('halo') || incomingMessages.includes('hallo') && incomingMessages.includes('nadin')) {
                        await sock.sendMessage(
                            senderNumber,
                            { text: "halo juga, ada yang bisa aku bantu?" },
                            { quoted: messages[0] },
                            2000
                        );
                    } else {
                        async function main() {
                            const result = await generateResponse(incomingMessages);
                            console.log(result);
                            await sock.sendMessage(
                                senderNumber,
                                { text: result + "\n\n" },
                                { quoted: messages[0] },
                                2000
                            );
                        }
                        main();
                    }
                }

                //question via group
                if (isMessageFromGroup && isMessageMentionBot) {
                    //if you answer who and you
                    if (incomingMessages.includes('siapa') && incomingMessages.includes('kamu')) {
                        await sock.sendMessage(
                            senderNumber,
                            { text: "aku nadin, bot tercantik sejagat maya :)" },
                            { quoted: messages[0] },
                            2000
                        );
                    } else if (incomingMessages.includes('halo') || incomingMessages.includes('hallo') && incomingMessages.includes('nadin')) {
                        await sock.sendMessage(
                            senderNumber,
                            { text: "halo juga, ada yang bisa aku bantu?" },
                            { quoted: messages[0] },
                            2000
                        );
                    } else {
                        async function main() {
                            const result = await generateResponse(incomingMessages);
                            console.log(result);
                            await sock.sendMessage(
                                senderNumber,
                                { text: result + "\n\n" },
                                { quoted: messages[0] },
                                2000
                            );
                        }
                        main();
                    }
                }
              
            } catch (error) {
                console.log(error);
            }
        }
    });
}

connectToWhatsApp().catch((err) => {
    console.log("Ada Error : " + err);
});
