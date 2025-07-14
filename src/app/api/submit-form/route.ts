import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { name, phone, classOption, preparingFor, email } = data;

    // Define the path to the submissions file
    const submissionsFilePath = path.join(process.cwd(), 'submissions.txt');

    // Format the data for saving
    const submissionEntry = `Timestamp: ${new Date().toISOString()}\n` +
                            `Name: ${name}\n` +
                            `Phone: ${phone}\n` +
                            `Class: ${classOption}\n` +
                            `Preparing For: ${preparingFor}\n` +
                            `Email: ${email}\n` +
                            `---\n`; // Separator for entries

    // Append the data to the file
    await fs.appendFile(submissionsFilePath, submissionEntry);

    return NextResponse.json({ message: 'Submission successful' }, { status: 200 });
  } catch (error) {
    console.error('Error saving submission:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
