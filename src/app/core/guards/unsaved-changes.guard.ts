import { CanDeactivateFn } from '@angular/router';

/**
 * Interface for components that can have unsaved changes
 */
export interface ComponentCanDeactivate {
  canDeactivate: () => boolean;
}

/**
 * Unsaved Changes Guard - Warns user before leaving page with unsaved changes
 */
export const unsavedChangesGuard: CanDeactivateFn<ComponentCanDeactivate> = (component) => {
  if (component.canDeactivate && !component.canDeactivate()) {
    return confirm('You have unsaved changes. Do you really want to leave?');
  }
  return true;
};
