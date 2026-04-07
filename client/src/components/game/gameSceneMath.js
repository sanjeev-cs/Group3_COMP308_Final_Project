const DEFAULT_PADDING = { x: 1.8, y: 1.35 };

const HIT_RADII = {
  meteor: 2.3,
  mine: 1.6,
  ghost_boy: 2.25,
  king_boo: 2.15,
  boss: 2.8,
  chuck: 1.9,
};

export const getVisibleMovementBounds = (viewport, camera, targetZ, maxRadius, padding = DEFAULT_PADDING) => {
  const view = viewport.getCurrentViewport(camera, [0, 0, targetZ]);

  return {
    x: Math.max(0, Math.min(maxRadius, view.width * 0.5 - padding.x)),
    y: Math.max(0, Math.min(maxRadius, view.height * 0.5 - padding.y)),
  };
};

export const clampToBounds = (position, bounds) => {
  position.x = Math.max(-bounds.x, Math.min(bounds.x, position.x));
  position.y = Math.max(-bounds.y, Math.min(bounds.y, position.y));
  return position;
};

export const hasProjectileHit = ({
  bulletPosition,
  enemyPosition,
  bulletSpeed,
  enemySpeed,
  delta,
  enemyType,
}) => {
  const hitRadius = HIT_RADII[enemyType] ?? 1.8;
  const dx = enemyPosition.x - bulletPosition.x;
  const dy = enemyPosition.y - bulletPosition.y;
  const dz = enemyPosition.z - bulletPosition.z;

  const lateralHit = dx * dx + dy * dy <= hitRadius * hitRadius;
  const depthAllowance = bulletSpeed * delta + enemySpeed * 8 * delta + hitRadius * 1.15;

  return lateralHit && Math.abs(dz) <= depthAllowance;
};
