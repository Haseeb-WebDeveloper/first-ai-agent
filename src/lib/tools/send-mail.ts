import { tool } from 'ai';
import { z } from 'zod';

// Get the base URL for API calls
const getBaseUrl = () => {
    if (typeof window !== 'undefined') return ''; // browser should use relative url
    if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`; // SSR should use vercel url
    return `http://localhost:${process.env.PORT ?? 3000}`; // dev SSR should use localhost
};

export const sendMailTool = tool({
    description: `Tool for sending emails with user information to Haseeb.
    Send mail with max information possiable. Underdstand the user mestion details.
    If user not provide the information (name, email etc), ask user for the information.
    If user provide the information, send the mail to Haseeb.`,
    parameters: z.object({
        name: z.string().describe('The name of the person reaching out'),
        email: z.string().email().describe('The email address of the person reaching out'),
        subject: z.string().describe('Brief subject line describing the purpose of contact'),
        message: z.string().describe('Detailed message about what the person wants to discuss'),
        category: z.enum(['project', 'job', 'consulting', 'technical', 'other'])
            .describe('The category of the inquiry'),
    }),
    async execute({ name, email, subject, message, category }) {
        try {
            console.log("\n=== Sending Email ===");
            console.log("From:", name, "(", email, ")");
            console.log("Category:", category);

            const baseUrl = getBaseUrl();
            const response = await fetch(`${baseUrl}/api/send-mail`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name,
                    email,
                    subject,
                    message,
                    category,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to send email');
            }

            return "I've forwarded your information to Haseeb. He will review it and get back to you soon.";

        } catch (error) {
            console.error("\n=== Error Sending Email ===");
            console.error(error);
            return "I encountered an error while trying to send your information to Haseeb. " +
                   "Please try again later or reach out through other contact methods.";
        }
    }
}); 