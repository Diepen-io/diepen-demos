import type { FilmLane } from "./film-lane";

/**
 * The desktop arrangement of lanes. Each column holds one lane, or several stacked top to bottom
 * that share its height. Without a layout every lane gets its own equal column.
 */
export type FilmLayout = {
  columns: { lanes: string[]; /** A grid track size such as "1.4fr" or "420px". */ width?: string }[];
};

export type ResolvedColumn = { lanes: FilmLane[]; width: string };

/** Matches every column to its lanes. Lanes the layout leaves out get a column of their own at the end. */
export function resolveLayout(lanes: FilmLane[], layout?: FilmLayout): ResolvedColumn[] {
  const byId = new Map(lanes.map((lane) => [lane.id, lane]));
  const placed = new Set<string>();
  const columns: ResolvedColumn[] = [];
  for (const column of layout?.columns ?? []) {
    const columnLanes = column.lanes.map((id) => {
      const lane = byId.get(id);
      if (!lane) throw new Error(`Film layout names unknown lane "${id}"`);
      if (placed.has(id)) throw new Error(`Film layout places lane "${id}" twice`);
      placed.add(id);
      return lane;
    });
    if (columnLanes.length > 0) columns.push({ lanes: columnLanes, width: column.width ?? "1fr" });
  }
  for (const lane of lanes) {
    if (!placed.has(lane.id)) columns.push({ lanes: [lane], width: "1fr" });
  }
  return columns;
}

/** The `grid-template-columns` value. Fractions get a zero minimum so long words never widen a column. */
export function gridColumns(columns: ResolvedColumn[]): string {
  return columns.map(({ width }) => (width.endsWith("fr") ? `minmax(0,${width})` : width)).join(" ");
}
