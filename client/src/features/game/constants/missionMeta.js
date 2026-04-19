import { MISSION_CATALOG } from '../../../../../shared/gameContent.js';

export const MISSION_META = Object.fromEntries(
  MISSION_CATALOG.map((mission) => [mission.id, mission]),
);

export const MISSION_ORDER = MISSION_CATALOG.map((mission) => mission.id);

export const getMissionMeta = (missionId) => MISSION_META[missionId] || null;
