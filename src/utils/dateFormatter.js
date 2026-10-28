/**
 * Shared date formatting utilities for AAYAM events.
 * Formats event dates into clean, elegant, human-readable strings (e.g., "29 – 31 Oct 2026")
 * and extracts day/month for calendar badges.
 */

export function formatCleanDate(ev) {
  if (!ev) return 'TBA';

  const sStr = ev.start_date || '';
  const eStr = ev.end_date || '';
  const rawDateStr = (ev.date_str || '').trim();

  let start = sStr ? new Date(sStr) : null;
  let end = eStr ? new Date(eStr) : null;

  // If start_date not provided as timestamp, parse from rawDateStr
  if ((!start || isNaN(start.getTime())) && rawDateStr) {
    if (rawDateStr.includes(' to ')) {
      const parts = rawDateStr.split(' to ');
      const p0 = new Date(parts[0].trim());
      const p1 = new Date(parts[1].trim());
      if (!isNaN(p0.getTime())) start = p0;
      if (!isNaN(p1.getTime())) end = p1;
    } else if (rawDateStr.includes(' – ') || rawDateStr.includes(' - ')) {
      const parts = rawDateStr.split(/ [–-] /);
      const p0 = new Date(parts[0].trim());
      const p1 = new Date(parts[1].trim());
      if (!isNaN(p0.getTime())) start = p0;
      if (!isNaN(p1.getTime())) end = p1;
    } else {
      const single = new Date(rawDateStr);
      if (!isNaN(single.getTime())) start = single;
    }
  }

  if (start && !isNaN(start.getTime())) {
    const sDay = start.getDate();
    const sMon = start.toLocaleString('en-US', { month: 'short' });
    const sYr = start.getFullYear();

    if (end && !isNaN(end.getTime())) {
      const eDay = end.getDate();
      const eMon = end.toLocaleString('en-US', { month: 'short' });
      const eYr = end.getFullYear();

      if (sDay === eDay && sMon === eMon && sYr === eYr) {
        return `${sDay} ${sMon} ${sYr}`;
      }
      if (sMon === eMon && sYr === eYr) {
        return `${sDay} – ${eDay} ${sMon} ${sYr}`;
      }
      if (sYr === eYr) {
        return `${sDay} ${sMon} – ${eDay} ${eMon} ${sYr}`;
      }
      return `${sDay} ${sMon} ${sYr} – ${eDay} ${eMon} ${eYr}`;
    }

    return `${sDay} ${sMon} ${sYr}`;
  }

  // If already clean like "18 March 2026", return it directly
  return rawDateStr || 'TBA';
}

export function parseDateBadge(dateStr, startDateStr) {
  if (startDateStr) {
    const d = new Date(startDateStr);
    if (!isNaN(d.getTime())) {
      return {
        num: String(d.getDate()),
        mon: d.toLocaleString('en-US', { month: 'short' }).toUpperCase()
      };
    }
  }

  if (dateStr) {
    const firstPart = dateStr.split(/ to | – | - /)[0].trim();
    const d = new Date(firstPart);
    if (!isNaN(d.getTime())) {
      return {
        num: String(d.getDate()),
        mon: d.toLocaleString('en-US', { month: 'short' }).toUpperCase()
      };
    }

    const match = dateStr.match(/(\d{1,2})\s+([A-Za-z]+)/);
    if (match) {
      return {
        num: match[1],
        mon: match[2].slice(0, 3).toUpperCase()
      };
    }
  }

  return { num: '18', mon: 'MAR' };
}
