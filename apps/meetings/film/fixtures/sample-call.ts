/**
 * The sample discovery call between the seller and Tom Becker, a fictional landlord. Tokens such
 * as `{sellerOwner}` are filled from the active company profile. The film and the "Sample call"
 * tab in live mode both use it.
 */
export const sampleCall = [
  "[00:00] {sellerOwner}: Hi Tom, it's {sellerIntro}. Thanks for making the time. Can you hear me okay?",
  "[00:05] Tom Becker: Yes, loud and clear. Sorry, I'm parked outside one of the buildings, so if a door slams, that's why.",
  "[00:12] {sellerOwner}: No problem. I read your message. Tell me what you've got today.",
  "[00:17] Tom Becker: So, 14 apartments across three buildings. Two on Elm Street and one by the station. My wife Anna and I bought the first one in 2015 and it just kept growing.",
  "[00:31] {sellerOwner}: And you run all of them yourselves?",
  "[00:34] Tom Becker: All of it. Rent, repairs, viewings, the lot. That's why I wrote to you, really.",
  "[00:40] {sellerOwner}: How much of your week does it take?",
  "[00:44] Tom Becker: A normal week, about nine hours. Calls, texts, chasing the plumber, chasing rent. And that's next to my actual job.",
  "[00:56] {sellerOwner}: Does it come in bursts or is it spread out?",
  "[01:00] Tom Becker: Bursts. Last month a boiler went on a Sunday night and I was on the phone until midnight. The night calls are the worst part.",
  "[01:12] {sellerOwner}: When someone moves out, how long does the apartment stand empty?",
  "[01:17] Tom Becker: Last year it was 38 days on average. We had six move-outs. I only do viewings on Saturdays, so it drags.",
  "[01:28] {sellerOwner}: What's the average rent?",
  "[01:31] Tom Becker: Around 1,150 a month.",
  "[01:34] {sellerOwner}: So six move-outs at 38 days each. That's roughly 8,700 in rent you didn't collect last year.",
  "[01:42] Tom Becker: Ouch. Yeah, put like that.",
  "[01:46] {sellerOwner}: And the rent itself, does it come in on time?",
  "[01:49] Tom Becker: Mostly. Two tenants are late most months, and I end up chasing them on WhatsApp. Everything lives in one spreadsheet.",
  "[02:03] {sellerOwner}: Is there anything you'd want to keep doing yourself?",
  "[02:07] Tom Becker: Choosing the tenants. Anna and I like to meet them. Everything else I'd hand over tomorrow.",
  "[06:40] {sellerOwner}: Tell me about the buildings. Any big work coming up?",
  "[06:45] Tom Becker: The station building needs new windows in the next couple of years. The Elm Street ones are fine. The boilers are about ten years old.",
  "[11:20] {sellerOwner}: Who does your repairs today?",
  "[11:24] Tom Becker: One plumber I trust and a handyman. The plumber doesn't pick up on weekends, which is half the problem.",
  "[17:05] {sellerOwner}: Here's how we'd run it. Tenants call our line, day or night, and we send the repair. We do viewings within five days of a notice. You get one statement at the start of each month.",
  "[17:31] Tom Becker: And Anna and I would still pick the tenants?",
  "[17:34] {sellerOwner}: You'd meet the final two candidates and choose. We handle everything before and after that.",
  "[18:10] Tom Becker: What does that cost?",
  "[18:13] {sellerOwner}: {servicePriceLine} I'll put the details in writing.",
  "[24:30] Tom Becker: Can you put all of that in writing today? Anna will want to see it with our numbers.",
  "[24:38] {sellerOwner}: You'll have it this afternoon. When would you want to start?",
  "[24:42] Tom Becker: January would be ideal. The first of January, clean start.",
  "[27:15] {sellerOwner}: Then let's walk the three buildings together first. Does Friday at ten work?",
  "[27:20] Tom Becker: Friday at ten works. I'll ask Anna to come too. Send it to tom@becker-residential.example, that's the company, Becker Residential.",
  "[31:46] Tom Becker: This was useful. I hadn't seen how the empty days add up.",
  "[31:58] {sellerOwner}: Talk Friday then, Tom. Thanks.",
].join("\n");

/** Story time when the call ends, 32:10 after it started. Not a transcript line. */
export const sampleCallEndsAt = "2026-11-10T14:32:10";

/** Story time when the call starts. */
export const sampleCallStartsAt = "2026-11-10T14:00:00";
