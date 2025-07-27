import { tool } from 'ai';
import { z } from 'zod';

// Get the base URL for API calls
const getBaseUrl = () => {
    if (typeof window !== 'undefined') return ''; // browser should use relative url
    if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`; // SSR should use vercel url
    return `http://localhost:${process.env.PORT ?? 3000}`; // dev SSR should use localhost
};

export const sendMailTool = tool({
    description: `Tool for sending lead information to Haseeb when you have a potential client.
    Use this when someone shows serious project interest and provides their contact details.
    Include all the conversation context and project details they've shared.`,
    parameters: z.object({
        clientName: z.string().describe('The name of the potential client'),
        clientEmail: z.string().email().describe('The email address of the potential client'),
        projectType: z.string().describe('Type of project they need (e.g., portfolio website, e-commerce, etc.)'),
        projectDetails: z.string().describe('Detailed description of what they want, including any specific requirements mentioned'),
        budget: z.string().optional().describe('Their budget if mentioned'),
        timeline: z.string().optional().describe('Their timeline if mentioned'),
        additionalInfo: z.string().optional().describe('Any other relevant information from the conversation'),
    }),
    async execute({ clientName, clientEmail, projectType, projectDetails, budget, timeline, additionalInfo }) {
        try {
            console.log("\n=== Sending Email ===");
            console.log("From:", clientName, "(", clientEmail, ")");
            console.log("Project Type:", projectType);

            // Create comprehensive email content
            const subject = `New Lead: ${projectType} - ${clientName}`;
            let message = `New potential client from your AI assistant:\n\n`;
            message += `Client Details:\n`;
            message += `- Name: ${clientName}\n`;
            message += `- Email: ${clientEmail}\n`;
            message += `- Project Type: ${projectType}\n\n`;
            message += `Project Details:\n${projectDetails}\n\n`;
            
            if (budget) {
                message += `Budget: ${budget}\n`;
            }
            if (timeline) {
                message += `Timeline: ${timeline}\n`;
            }
            if (additionalInfo) {
                message += `\nAdditional Information:\n${additionalInfo}\n`;
            }
            
            message += `\nPlease reach out to them as soon as possible!`;

            const baseUrl = getBaseUrl();
            const response = await fetch(`${baseUrl}/api/send-mail`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: clientName,
                    email: clientEmail,
                    subject: subject,
                    message: message,
                    category: 'project',
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('API Response Error:', {
                    status: response.status,
                    statusText: response.statusText,
                    body: errorText
                });
                throw new Error(`Failed to send email (${response.status}): ${errorText}`);
            }

            console.log("Email sent successfully (send-mail");

            return `Perfect! I've sent your details to Haseeb. He'll reach out to you within 24 hours to discuss your ${projectType} project. Thanks ${clientName}!`;

        } catch (error) {
            console.error("\n=== Error Sending Email ===");
            console.error('Error details:', error);
            
            let userMessage = "I encountered an error while trying to send your information to Haseeb. ";
            
            if (error instanceof Error) {
                console.error('Error message:', error.message);
                
                // Provide more specific user feedback based on error type
                if (error.message.includes('Missing required environment variables')) {
                    userMessage += "The email service is not properly configured. Please contact the administrator.";
                } else if (error.message.includes('Failed to send email')) {
                    userMessage += "There was an issue with the email service. Please try again later or reach out through other contact methods.";
                } else {
                    userMessage += "Please try again later or reach out through other contact methods.";
                }
            } else {
                userMessage += "Please try again later or reach out through other contact methods.";
            }
            
            return userMessage;
        }
    }
}); 