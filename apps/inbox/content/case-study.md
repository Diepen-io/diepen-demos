---
title: Inbox autopilot
slug: inbox-autopilot
stage: Acquire
summary: Every message on email, Instagram, LinkedIn and your website chat gets an answer in your voice within a minute, and bookings land straight in your calendar.
metric:
  label: Reply time
  before: 9 hours
  after: 38 seconds
github: https://github.com/Diepen-io/diepen-demos/tree/main/apps/inbox
live: https://inbox.demo.diepen.ai
demo: true
---

This is a demo.
Ottervale Dental, its team and its customers are fictional, and both numbers come from the simulated night in the film.
The 9 hours is how long the night's messages would wait for the clinic to open at 08:00.

## The problem

You close at six, and the messages keep coming.
A price question on Instagram after dinner, a booking request by email, an office manager on LinkedIn asking about a deal for his team, a refund request in the website chat.
They sit in four different apps until you open them the next morning.
By then the person who wanted a price has often asked someone else.

## What the system does

The film follows one night at the clinic, from closing time to 08:00.

1. A message arrives on any of four channels: email, Instagram, LinkedIn or the website chat.
2. The assistant reads it against the clinic's services, prices, opening hours and policies, and replies in the clinic's voice. The Instagram message sent at 22:14:00 has its answer at 22:14:38.
3. It asks the questions the owner would ask: is it urgent, which mornings suit you, how many people would take part.
4. When someone wants a time, it checks the calendar, offers free slots and books the one they pick. Two bookings land overnight: a first visit and a call with the owner.
5. At 08:00 the owner opens one list with every conversation and its status: Answered, Booked or Needs a human. The refund request is on top, with the whole thread and the customer's number.

## What it hands to you

The assistant passes a conversation to the owner whenever the clinic's policy says so: a complaint, a refund, a question about pain or an accident, anything legal, and anything the clinic's own knowledge does not cover.
It tells the customer who will reply, marks the conversation Needs a human and stops answering in it.
It offers only slots that are free, books only a slot it offered, and quotes only the prices the clinic lists.

## The stack

- Next.js and TypeScript, hosted on Vercel.
- Claude Haiku 5.5 (`claude-haiku-5-5`) writes the replies, because a chat has to feel instant. Claude Sonnet 5.5 (`claude-sonnet-5-5`) drafts profiles for "Make it yours".
- A company voice profile holds the name, tone, words to use and avoid, services, prices and handover policies. Every reply is built from it.
- The channels and the calendar are simulations.

## How it becomes yours

In the live demo, open "Make it yours" and enter your website.
Claude drafts your profile: name, logo, colours, tone, services and prices, and you can edit every field.
The live demo then answers as your company while you play the customer on any channel.

A 14-day build swaps the simulations for your real accounts: your inbox, your Instagram and LinkedIn messages, your website chat and your calendar.
It runs inside the tools you already use and stays yours.
We agree the handover rules and one number before the build, usually reply time.
If that number does not move within 30 days, I keep working for free until it does.

Book the free 15-minute intro call and tell me where your messages pile up.
You get a straight answer on whether this is worth building for your business and roughly what it saves.
