import { trackEvent, roundRectPath } from './helpers.js';

export function exportToCalendar(mealPlan, config, children, MEAL_TYPES) {
  const mealTimes = { breakfast:[8,0,30], lunch:[12,0,45], dinner:[19,0,45] };
  const mealLabels = { breakfast:'아침', lunch:'점심', dinner:'저녁' };
  const today = new Date(); today.setHours(0,0,0,0);
  const fmtDT = (d) => {
    const pad = n => String(n).padStart(2,'0');
    return `${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
  };
  const esc = (s) => s.replace(/[,;\\]/g, c => '\\' + c).replace(/\n/g, '\\n');
  const lines = [
    'BEGIN:VCALENDAR','VERSION:2.0',
    'PRODID:-//우리 가족 식단 플래너//KR','CALSCALE:GREGORIAN','METHOD:PUBLISH',
  ];
  let uid = Date.now();
  for (let d = 0; d < config.period; d++) {
    const date = new Date(today); date.setDate(today.getDate() + d);
    for (const mt of ['breakfast','lunch','dinner']) {
      const slot = mealPlan[d]?.[mt];
      if (!slot) continue;
      let summary;
      if (children) {
        const an = slot.adult?.name, cn = slot.child?.name;
        if (!an && !cn) continue;
        summary = `${mealLabels[mt]}: ${an||'-'}${cn?' / '+cn+'(아이)':''}`;
      } else {
        if (!slot.name) continue;
        summary = `${mealLabels[mt]}: ${slot.name}`;
      }
      const [h,m,dur] = mealTimes[mt];
      const start = new Date(date); start.setHours(h,m,0,0);
      const end = new Date(start); end.setMinutes(start.getMinutes()+dur);
      lines.push('BEGIN:VEVENT');
      lines.push(`UID:fmp-${d}-${mt}-${uid++}@family-meal-planner`);
      lines.push(`DTSTART:${fmtDT(start)}`);
      lines.push(`DTEND:${fmtDT(end)}`);
      lines.push(`SUMMARY:${esc(summary)}`);
      lines.push('END:VEVENT');
    }
  }
  lines.push('END:VCALENDAR');
  const blob = new Blob([lines.join('\r\n')], { type:'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `식단표_${new Date().toISOString().slice(0,10)}.ics`;
  a.click(); URL.revokeObjectURL(url);
  trackEvent('calendar_exported', { period: config.period });
}

export function shareImage(mealPlan, config, week, weekStart, totalWeeks, children, MEAL_TYPES, NUTRITION_INFO) {
  const W = 1200, H = 640;
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');
  const KO_FONT = '"Apple SD Gothic Neo","Malgun Gothic","Noto Sans KR",sans-serif';

  // Background
  const bg = ctx.createLinearGradient(0,0,W,H);
  bg.addColorStop(0,'#fff7ed'); bg.addColorStop(1,'#fce7f3');
  ctx.fillStyle = bg; ctx.fillRect(0,0,W,H);

  // Header bar
  const hg = ctx.createLinearGradient(0,0,W,0);
  hg.addColorStop(0,'#f97316'); hg.addColorStop(1,'#ec4899');
  ctx.fillStyle = hg; ctx.fillRect(0,0,W,72);
  ctx.fillStyle = '#fff';
  ctx.font = `bold 28px ${KO_FONT}`; ctx.textBaseline='middle';
  ctx.fillText('🍽️ 우리 가족 식단표', 24, 28);
  ctx.font = `16px ${KO_FONT}`;
  const weekLabel = totalWeeks > 1 ? ` · ${week+1}주차` : '';
  ctx.fillText(`${config.period}일 플랜 · ${config.members.length}인 가족${weekLabel}`, 24, 54);

  const daysN = Math.min(7, config.period - weekStart);
  const LEFT = 60, TOP = 82, BOT = 620;
  const colW = (W - LEFT - 8) / daysN;
  const rowH = (BOT - TOP - 32) / 3;
  const DAYS_KO = ['월','화','수','목','금','토','일'];
  const MT_LABEL = { breakfast:'🌅 아침', lunch:'☀️ 점심', dinner:'🌙 저녁' };

  // Row labels
  ctx.textBaseline = 'middle'; ctx.textAlign = 'center';
  MEAL_TYPES.forEach((mt, ri) => {
    const y = TOP + 32 + ri * rowH + rowH / 2;
    ctx.font = `bold 13px ${KO_FONT}`; ctx.fillStyle = '#6b7280';
    ctx.fillText(MT_LABEL[mt.id], LEFT/2, y);
  });

  // Day headers
  for (let i = 0; i < daysN; i++) {
    const di = weekStart + i, dow = di % 7;
    const x = LEFT + i * colW + colW / 2;
    ctx.fillStyle = dow===6?'#ef4444':dow===5?'#3b82f6':'#374151';
    ctx.font = `bold 16px ${KO_FONT}`; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText(DAYS_KO[dow], x, TOP + 16);
  }

  // Cells
  MEAL_TYPES.forEach((mt, ri) => {
    for (let i = 0; i < daysN; i++) {
      const di = weekStart + i;
      const slot = mealPlan[di]?.[mt.id];
      const name = children ? slot?.adult?.name : slot?.name;
      const childName = children ? slot?.child?.name : null;
      const x = LEFT + i * colW + 4, y = TOP + 32 + ri * rowH + 4;
      const cw = colW - 8, ch = rowH - 8;
      roundRectPath(ctx, x, y, cw, ch, 10);
      ctx.fillStyle = name ? '#ffffff' : '#f9fafb'; ctx.fill();
      ctx.strokeStyle = '#e5e7eb'; ctx.lineWidth = 1; ctx.stroke();
      if (name) {
        ctx.fillStyle = '#111827'; ctx.textAlign='center'; ctx.textBaseline='middle';
        ctx.font = `bold 13px ${KO_FONT}`;
        const maxW = cw - 12;
        let txt = name;
        while (ctx.measureText(txt).width > maxW && txt.length > 2) txt = txt.slice(0,-1);
        if (txt !== name) txt = txt.slice(0,-1) + '…';
        ctx.fillText(txt, x + cw/2, y + (childName ? ch*0.38 : ch/2));
        if (childName) {
          ctx.font = `11px ${KO_FONT}`; ctx.fillStyle = '#9ca3af';
          let ct = childName;
          while (ctx.measureText('👶'+ct).width > maxW && ct.length > 2) ct = ct.slice(0,-1);
          if (ct !== childName) ct = ct.slice(0,-1) + '…';
          ctx.fillText('👶'+ct, x + cw/2, y + ch*0.68);
        }
      }
    }
  });

  // Footer URL
  ctx.fillStyle = '#9ca3af'; ctx.font = `13px ${KO_FONT}`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
  ctx.fillText('peterpark3832.github.io/Family-meal-planner/', W/2, H - 8);

  canvas.toBlob(async (blob) => {
    const file = new File([blob], '식단표.png', { type:'image/png' });
    try {
      if (navigator.share && navigator.canShare?.({ files:[file] })) {
        await navigator.share({ title:'우리 가족 식단표', files:[file] });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `식단표_${new Date().toISOString().slice(0,10)}.png`;
        a.click(); URL.revokeObjectURL(url);
      }
    } catch(e) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `식단표_${new Date().toISOString().slice(0,10)}.png`;
      a.click(); URL.revokeObjectURL(url);
    }
    trackEvent('plan_image_shared', { period: config.period, week });
  }, 'image/png');
}
