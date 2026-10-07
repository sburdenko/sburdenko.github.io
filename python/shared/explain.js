/**
 * Text for one step. A rig may narrate its own lines through dictionary keys `rig.<id>.l<line>` (or `…l<line>:<kind>`),
 * which receive the event; otherwise the generic explanation of the event kind is used.
 */
import { t } from '../../assets/i18n.js?v=202610071637';

const tryKey = (key, event) => { const text = t(key, event); return text === key ? null : text; };

export function explain(event, rig) {
  if (rig && rig.id) {
    const own = tryKey(`rig.${rig.id}.l${event.line}:${event.kind}`, event) ?? tryKey(`rig.${rig.id}.l${event.line}`, event);
    if (own) return own;
  }
  if (rig && rig.notes) {
    const key = rig.notes[`${event.line}:${event.kind}`] ?? rig.notes[event.line];
    if (key) { const text = tryKey(key, event); if (text) return text; }
  }
  const input = (event.touched || []).find(x => x.input !== undefined);
  const generic = tryKey(`py.ev.${event.kind}`, event) || '';
  return input ? `${t('py.ev.input', input)} ${generic}` : generic;
}
