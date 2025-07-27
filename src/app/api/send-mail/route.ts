import { NextResponse } from "next/server";
import { transporter } from "@/lib/send-mail";

// Explicitly set runtime to nodejs
export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const { name, email, subject, message, category } = await req.json();

    console.log(name, email, subject, message, category);

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
    console.error("Error sending email:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
} 