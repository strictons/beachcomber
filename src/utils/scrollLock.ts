// Reference-counted so multiple overlays (menu, filter panel, ...) can each
// hold a lock independently without one closing early stomping the other's.
let lockCount = 0;

export function lockScroll() {
  lockCount += 1;
  if (lockCount === 1) {
    document.body.style.overflow = 'hidden';
  }
}

export function unlockScroll() {
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount === 0) {
    document.body.style.overflow = '';
  }
}
