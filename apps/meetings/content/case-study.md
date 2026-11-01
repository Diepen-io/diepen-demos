---
title: Call to close
slug: call-to-close
stage: Convert
summary: When a sales call ends, the summary, CRM record, proposal at your price, follow-up email and next meeting are drafted, and you send the proposal minutes after you hang up.
metric:
  label: Call end to proposal sent
  before: 2 days
  after: 4 minutes
github: https://github.com/Diepen-io/diepen-demos/tree/main/apps/meetings
live: https://meetings.demo.diepen.ai
demo: true
---

This is a demo.
Brickfern Property Management, its owner Jonas Albers and the landlord Tom Becker are fictional.
The 4 minutes is the simulated timeline: the call ends at 14:32 and the email goes out at 14:36.
The 2 days is this scenario's manual routine: notes typed up that evening, proposal sent on Thursday.

## The problem

The call went well, and he asked for it in writing today.
Then the next call starts, the notes stay in a notebook, and the CRM still says "Discovery".
The proposal goes out two days later.

## What the system does

1. The system takes the transcript of a sales call, recorded in the browser or pasted in.
2. When the call ends, Claude reads every turn.
3. A summary comes first, then the prospect's numbers and their pain points.
4. A CRM record lands at the top of your pipeline with the stage and the next step.
5. A proposal follows, with the prospect's situation in the scope and your listed price.
6. A follow-up email with the proposal attached is drafted in the owner's name.
7. The next meeting the call agreed on goes into the calendar.
8. You read it all and press send, and the CRM stage moves to "Proposal sent".

## What it hands to you

Every output is a draft until you press send.
The price comes from your own price list: after Claude answers, the system writes in your listed price, and a company with no priced service gets "Price on request".
The meeting length comes from your profile too.
Your list of things the company never promises goes into every prompt, so for Brickfern the proposal names no rent level, no letting date and no legal advice.

## The stack

- Next.js and TypeScript, hosted on Vercel.
- Claude Sonnet 5.5 (`claude-sonnet-5-5`) writes all six outputs in one structured call, so the email, proposal and CRM agree on price and meeting.
- In live mode the browser's own speech recognition records the call, or you paste a transcript.
- A company voice profile holds the tone, words to use and avoid, sign-off, services, prices and policies.
- The CRM, email and calendar are simulations.

## How it becomes yours

In the live demo, record a short role-play call, paste the transcript of a real one, or load the sample call.
Open "Make it yours" and enter your website: the proposal then uses your services and prices, and the email your tone and sign-off.

A 14-day build swaps the simulations for your real accounts: transcripts from your meeting tool, your CRM, your email, your calendar and your proposal template.
It runs inside the tools you already use and stays yours.
We agree one number before the build, usually the time from call end to proposal sent.
If that number does not move within 30 days, I keep working for free until it does.

Book the free 15-minute intro call and tell me what happens after your sales calls today.
You get a straight answer on whether this is worth building for your business and roughly what it saves.
