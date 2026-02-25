/**
 * Controla si el sidebar debe animar al entrar (solo la primera vez en la sesión de dashboard).
 * Se resetea al montar la pantalla de login para que al volver a entrar se anime de nuevo.
 */
let sidebarAlreadyShown = false;

export function shouldAnimateSidebar(): boolean {
  return !sidebarAlreadyShown;
}

export function markSidebarShown(): void {
  sidebarAlreadyShown = true;
}

export function resetSidebarForNextEntry(): void {
  sidebarAlreadyShown = false;
}
