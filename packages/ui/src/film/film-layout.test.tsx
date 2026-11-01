import { describe, expect, it } from "vitest";
import { gridColumns, resolveLayout } from "./film-layout";

const lanes = ["call", "ai", "crm", "proposal", "calendar"].map((id) => ({ id, label: id, role: id }));

describe("resolveLayout", () => {
  it("gives every lane an equal column without a layout", () => {
    const columns = resolveLayout(lanes);
    expect(columns.map((column) => column.lanes.map((lane) => lane.id))).toEqual([["call"], ["ai"], ["crm"], ["proposal"], ["calendar"]]);
    expect(gridColumns(columns)).toBe("minmax(0,1fr) minmax(0,1fr) minmax(0,1fr) minmax(0,1fr) minmax(0,1fr)");
  });

  it("stacks lanes in one column and keeps the widths", () => {
    const columns = resolveLayout(lanes, {
      columns: [{ lanes: ["call"], width: "1.3fr" }, { lanes: ["ai"] }, { lanes: ["proposal"] }, { lanes: ["crm", "calendar"], width: "380px" }],
    });
    expect(columns.map((column) => column.lanes.map((lane) => lane.id))).toEqual([["call"], ["ai"], ["proposal"], ["crm", "calendar"]]);
    expect(gridColumns(columns)).toBe("minmax(0,1.3fr) minmax(0,1fr) minmax(0,1fr) 380px");
  });

  it("adds lanes the layout leaves out", () => {
    const columns = resolveLayout(lanes, { columns: [{ lanes: ["crm", "calendar"] }] });
    expect(columns.at(-1)?.lanes[0]?.id).toBe("proposal");
  });

  it("rejects an unknown or repeated lane", () => {
    expect(() => resolveLayout(lanes, { columns: [{ lanes: ["owner"] }] })).toThrow(/unknown lane "owner"/);
    expect(() => resolveLayout(lanes, { columns: [{ lanes: ["ai"] }, { lanes: ["ai"] }] })).toThrow(/twice/);
  });
});
