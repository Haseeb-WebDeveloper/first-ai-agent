import { NextResponse } from "next/server";
import { transporter } from "@/lib/send-mail";

// Explicitly set runtime to nodejs
export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const { name, email, subject, message, category } = await req.json();

    console.log("=== Send Mail API Called ===");
    console.log("Request data:", { name, email, subject, category });
    
    // Validate required environment variables
    const requiredEnvVars = {
      BREVO_USER: process.env.BREVO_USER,
      BREVO_PASSWORD: process.env.BREVO_PASSWORD,
      FROM_EMAIL: process.env.FROM_EMAIL,
      TO_EMAIL: process.env.TO_EMAIL
    };
    
    const missingVars = Object.entries(requiredEnvVars)
      .filter(([key, value]) => !value)
      .map(([key]) => key);
    
    if (missingVars.length > 0) {
      console.error("Missing environment variables:", missingVars);
      return NextResponse.json(
        { error: `Missing required environment variables: ${missingVars.join(', ')}` },
        { status: 500 }
      );
    }

    // Create a formatted email body
    const emailContent = `
    New Contact from AI Assistant
    
    Category: ${category}
    Name: ${name}
    Email: ${email}
    
    Subject: ${subject}
    
    Message:
    ${message}
    
    This email was automatically sent by your AI Assistant.
    `;

    // Send the email
    await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to: process.env.TO_EMAIL,
      subject: `[AI Assistant] ${category.toUpperCase()}: ${subject}`,
      text: emailContent,
      html: emailContent.replace(/\n/g, "<br>"),
    });

    console.log("Email sent successfully");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("=== Email Send Error ===");
    console.error("Error details:", error);
    
    let errorMessage = "Failed to send email";
    
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
      errorMessage = `Email send failed: ${error.message}`;
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}