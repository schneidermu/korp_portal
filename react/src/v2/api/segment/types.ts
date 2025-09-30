import * as R from "radashi";

export type SegmentStatus = "В разработке" | "Активно" | "Архив";

export interface Segment {
  id: number;
  name: string;
  supervisor: string | null; // UUID
  supervisorFallback: string | null;
  url: string;
  description: string;
  isFavorite: boolean;
  status: SegmentStatus;
  groupId: number;
  groupName: string;
}

export interface SegmentRaw {
  id: number;
  name: string;
  supervisor: string | null; // UUID
  supervisor_fallback: string | null;
  url: string;
  description: string;
  is_favorite: boolean;
  status: SegmentStatus;
  segment_group: number;
  segment_group_name: string;
}

export const toSegment = (r: SegmentRaw): Segment => ({
  ...R.pick(r, ["id", "name", "supervisor", "url", "description", "status"]),
  isFavorite: r.is_favorite,
  groupId: r.segment_group,
  groupName: r.segment_group_name,
  supervisorFallback: r.supervisor_fallback,
});
