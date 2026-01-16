import Groq from "groq-sdk";

let groq = null;

function getGroqClient() {
    if (!groq) {
        if (!process.env.GROQ_API_KEY) {
            throw new Error("GROQ_API_KEY is not set in environment variables");
        }
        groq = new Groq({
            apiKey: process.env.GROQ_API_KEY,
        });
    }
    return groq;
}


export async function getLLMResponse(prompt) {
    const client = getGroqClient();
    const completion = await client.chat.completions.create({
        model: "llama-3.1-8b-instant", // Updated to current model
        messages: [{ role: "user", content: prompt }],
        temperature: 0.4,
    });

    return completion.choices[0].message.content;
}
