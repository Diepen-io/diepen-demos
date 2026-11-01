---
title: Document chaser
slug: document-chaser
stage: Convert
summary: Your clients upload through one link, every file is checked and filed in Drive within seconds, and follow-ups that name exactly what is missing go out on schedule.
metric:
  label: Hours a month spent chasing documents
  before: 12 hours
  after: 1 hour
github: https://github.com/Diepen-io/diepen-demos/tree/main/apps/documents
live: https://documents.demo.diepen.ai
demo: true
---

This is a demo.
Ledgerwick Tax & Accounting, its client Daniel Okafor and every document in the film are fictional.
The numbers are an example calculation for a fictional firm: 40 tax returns a month, 3 chases each at 6 minutes, against 1.5 minutes per return to read the summary.

## The problem

Every tax season you write the same email forty times.
You ask a client for six documents and get four.
One is last year's bank statement, one form has no signature, and you only find out when you open each file.
Then you write again, and again three days later.

## What the system does

The film follows one client, Daniel Okafor, and his 2025 tax return.

1. The firm sends one request: one email, one link, six documents.
2. On the upload page he signs the engagement letter and adds four files from his phone.
3. Each file is read as it arrives: document type, person, year, pages, signature and the key figures.
4. Problems show up on arrival: the bank statement covers 2024, and the home office form is missing his employer's signature.
5. Every file lands in Daniel's Drive folder, named and sorted. Problem files go to "Needs attention".
6. The firm reads one summary: "3 of 6 checked. 2 problems, 1 missing."
7. Daniel gets a follow-up naming the three open documents and why. Three days later a second reminder goes out by itself.
8. That evening he sends the last three. All pass, and the checklist reads 6 of 6.

## What it hands to you

Claude reports what it reads, and fixed rules decide whether a file passes.
A wrong year, a different person, a missing signature or the wrong document always counts as a problem.
The follow-up and reminder emails are fixed templates with your firm's details and the open items.
After two reminders it stops writing to the client and gives you a task: call Daniel, 3 documents still open.
The tax work itself stays with the firm.

## The stack

- Next.js and TypeScript, hosted on Vercel.
- Claude Sonnet 5.5 (`claude-sonnet-5-5`) checks every document, because a check has to be right.
- OCR sits behind one port: Claude reads the PDF or photo directly by default, and one setting switches to Google Document AI.
- A company voice profile shapes the summaries and the emails.
- Email, the upload page and Drive are simulations, and three days pass in seconds on a simulated clock.

## How it becomes yours

In the live demo you play Daniel.
Upload a sample or your own PDF or photo, and Claude checks it on the spot.
The demo keeps no copy.
With "Make it yours", the emails, upload page and Drive folder carry your firm's name, logo, colours and voice.

A 14-day build swaps the simulations for your real accounts: your document list, your email, your Google Drive, and reminders that run on real days.
It runs inside the tools you already use and stays yours.
We agree one number before the build, usually hours spent chasing.
If that number does not move within 30 days, I keep working for free until it does.

Book the free 15-minute intro call and tell me which documents you chase every month.
You get a straight answer on whether this is worth building for your firm and roughly what it saves.
