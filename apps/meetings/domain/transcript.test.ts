import { describe, expect, it } from "vitest";
import { checkTranscript, parseTranscript } from "./transcript";

const messages = {
  tooShort: "Add a bit more of the call. It needs at least 20 words.",
  tooLong: "That is over 30,000 characters. Trim it to the part of the call that matters.",
  tooManyTurns: "That is over 400 turns. Trim it to the part of the call that matters.",
};

/** A one-turn transcript of exactly `length` characters that ends in a letter, so trimming keeps its length. */
function transcriptOfLength(length: number): string {
  return `Anna: ${"lorem ".repeat(6000)}`.slice(0, length - 1) + "x";
}

function words(count: number): string {
  return Array.from({ length: count }, (_, index) => `word${index + 1}`).join(" ");
}

function issueMessages(text: string): string[] {
  return checkTranscript(text).map((issue) => issue.message);
}

// U2
describe("parseTranscript @meetings.live-paste", () => {
  it("reads a line without a timestamp", () => {
    expect(parseTranscript("Anna Becker: We have three buildings.")).toEqual([
      { speaker: "Anna Becker", text: "We have three buildings." },
    ]);
  });

  it("reads mm:ss and [h:mm:ss] timestamps", () => {
    const turns = parseTranscript("00:17 Tom Becker: Fourteen apartments.\n[1:02:03] Anna Becker: Thanks, bye.");
    expect(turns).toMatchObject([
      { atSeconds: 17, speaker: "Tom Becker", text: "Fourteen apartments." },
      { atSeconds: 3723, speaker: "Anna Becker", text: "Thanks, bye." },
    ]);
  });

  it("reads [mm:ss] timestamps", () => {
    expect(parseTranscript("[01:34] Jonas Albers: Roughly 8,700 in rent.")).toMatchObject([
      { atSeconds: 94, speaker: "Jonas Albers", text: "Roughly 8,700 in rent." },
    ]);
  });

  it("joins a line without a speaker label to the previous turn", () => {
    const turns = parseTranscript("Tom Becker: The boiler went on a Sunday.\nI was on the phone until midnight.");
    expect(turns).toHaveLength(1);
    expect(turns[0]?.speaker).toBe("Tom Becker");
    expect(turns[0]?.text).toContain("The boiler went on a Sunday.");
    expect(turns[0]?.text).toContain("I was on the phone until midnight.");
  });

  it("gives text before the first label the speaker Speaker", () => {
    const turns = parseTranscript("Recording started late.\nTom Becker: Hello?");
    expect(turns).toMatchObject([
      { speaker: "Speaker", text: "Recording started late." },
      { speaker: "Tom Becker", text: "Hello?" },
    ]);
  });
});

// U3
describe("checkTranscript @meetings.live-paste", () => {
  it("accepts exactly 30,000 characters and rejects 30,001", () => {
    expect(transcriptOfLength(30_000)).toHaveLength(30_000);
    expect(checkTranscript(transcriptOfLength(30_000))).toEqual([]);
    expect(issueMessages(transcriptOfLength(30_001))).toContain(messages.tooLong);
  });

  it("rejects 19 words and accepts 20", () => {
    expect(issueMessages(words(19))).toContain(messages.tooShort);
    expect(checkTranscript(words(20))).toEqual([]);
  });

  it("accepts 400 turns and rejects 401", () => {
    const turns = (count: number) => Array.from({ length: count }, (_, index) => `Tom: line ${index + 1}`).join("\n");
    expect(checkTranscript(turns(400))).toEqual([]);
    expect(issueMessages(turns(401))).toContain(messages.tooManyTurns);
  });
});
