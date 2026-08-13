/**
 * Run with: npm test
 *
 * Policy under test: a stay occupies `[check_in, check_out]` inclusive — every
 * night, plus the check-out day itself, which is reserved for cleaning. The
 * next guest can only arrive the day *after* check-out.
 *
 * This rule has to hold identically in create-booking (conflict check),
 * check-availability (what the calendar paints) and both iCal directions,
 * otherwise the calendar and the booking engine disagree.
 */
import assert from "node:assert/strict";
import test from "node:test";
import { buildOccupancySets } from "./availability.ts";
import { expandStayRange, generateICal, parseICalEvents } from "./ical-parser.ts";

const WINDOW = { from: "2026-08-20", to: "2026-09-20" };
const empty = { pending: [], confirmed: [], blocked: [], ical: [], ...WINDOW };

test("stay range covers every night plus the cleaning day", () => {
  assert.deepEqual(expandStayRange("2026-09-01", "2026-09-04"), [
    "2026-09-01",
    "2026-09-02",
    "2026-09-03",
    "2026-09-04",
  ]);
});

test("a 7-night booking blocks 8 days: 7 nights + cleaning", () => {
  const { confirmed } = buildOccupancySets({
    ...empty,
    confirmed: [{ check_in: "2026-09-01", check_out: "2026-09-08" }],
  });

  assert.deepEqual([...confirmed].sort(), [
    "2026-09-01",
    "2026-09-02",
    "2026-09-03",
    "2026-09-04",
    "2026-09-05",
    "2026-09-06",
    "2026-09-07",
    "2026-09-08",
  ]);
  assert.ok(confirmed.has("2026-09-08"), "check-out day is the cleaning day");
  assert.ok(!confirmed.has("2026-09-09"), "next day is free again");
});

test("DB bookings and iCal imports block exactly the same days", () => {
  const stay = { check_in: "2026-09-01", check_out: "2026-09-08" };

  const viaDb = buildOccupancySets({ ...empty, confirmed: [stay] });
  const viaIcal = buildOccupancySets({
    ...empty,
    ical: expandStayRange(stay.check_in, stay.check_out),
  });

  assert.deepEqual([...viaDb.confirmed].sort(), [...viaIcal.blocked].sort());
});

test("pending bookings reserve the cleaning day too", () => {
  const { pending } = buildOccupancySets({
    ...empty,
    pending: [{ check_in: "2026-09-01", check_out: "2026-09-04" }],
  });

  assert.deepEqual([...pending].sort(), [
    "2026-09-01",
    "2026-09-02",
    "2026-09-03",
    "2026-09-04",
  ]);
});

test("back-to-back stays overlap on the cleaning day", () => {
  // 24->28 and 28->31 share the 28th: one departs, the other would arrive.
  // Under the cleaning-day policy that day belongs to neither guest.
  const first = expandStayRange("2026-08-24", "2026-08-28");
  const second = expandStayRange("2026-08-28", "2026-08-31");
  const clash = first.filter((d) => second.includes(d));

  assert.deepEqual(clash, ["2026-08-28"], "same-day turnover is a conflict");
});

test("a stay arriving the day after check-out is fine", () => {
  const first = expandStayRange("2026-08-24", "2026-08-28");
  const second = expandStayRange("2026-08-29", "2026-08-31");

  assert.deepEqual(first.filter((d) => second.includes(d)), []);
});

test("confirmed wins over pending on overlap", () => {
  const { pending, confirmed } = buildOccupancySets({
    ...empty,
    pending: [{ check_in: "2026-09-01", check_out: "2026-09-05" }],
    confirmed: [{ check_in: "2026-09-03", check_out: "2026-09-06" }],
  });

  assert.deepEqual([...pending].sort(), ["2026-09-01", "2026-09-02"]);
  assert.deepEqual([...confirmed].sort(), [
    "2026-09-03",
    "2026-09-04",
    "2026-09-05",
    "2026-09-06",
  ]);
});

test("dates outside the window are clipped", () => {
  const { confirmed } = buildOccupancySets({
    ...empty,
    confirmed: [{ check_in: "2026-08-15", check_out: "2026-08-24" }],
  });

  assert.deepEqual([...confirmed].sort(), [
    "2026-08-20",
    "2026-08-21",
    "2026-08-22",
    "2026-08-23",
    "2026-08-24",
  ]);
});

test("ISO timestamps from the DB are normalized to dates", () => {
  const { confirmed } = buildOccupancySets({
    ...empty,
    confirmed: [
      { check_in: "2026-09-01T00:00:00+00:00", check_out: "2026-09-03T00:00:00+00:00" },
    ],
  });

  assert.deepEqual([...confirmed].sort(), [
    "2026-09-01",
    "2026-09-02",
    "2026-09-03",
  ]);
});

test("outgoing feed extends DTEND so partners hold the cleaning day", () => {
  const ical = generateICal([
    { id: "abc", check_in: "2026-09-01", check_out: "2026-09-08" },
  ]);
  const [event] = parseICalEvents(ical);

  assert.equal(event.dtstart, "2026-09-01");
  assert.equal(event.dtend, "2026-09-09", "DTEND is exclusive, so +1 past cleaning");
  assert.deepEqual(
    expandStayRange("2026-09-01", "2026-09-08"),
    // What a partner importing our feed will consider unavailable.
    ["2026-09-01","2026-09-02","2026-09-03","2026-09-04",
     "2026-09-05","2026-09-06","2026-09-07","2026-09-08"],
  );
});
