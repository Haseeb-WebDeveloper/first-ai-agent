import { NextResponse } from "next/server";
import { transporter } from "@/lib/send-mail";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Create email content with all form data
    const emailContent = `... `;

    // Send email with HTML formatting for better readability
    await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to: process.env.TO_EMAIL,
      subject: `New Project Inquiry from ...`,
      text: emailContent,
      html: emailContent.replace(/\n/g, "<br>"),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}
