import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root',
})
export class AlertService {
  constructor() {}

  /**
   * Show success toast with auto-close
   */
  success(title?: string, text?: string, timer: number = 3000) {
    Swal.fire({
      title: title,
      text: text,
      icon: 'success',
      showConfirmButton: false,
      timer: timer,
      timerProgressBar: true,
    });
  }

  /**
   * Show success toast (quick, 1 second)
   */
  successNoProcess(title?: string, text?: string) {
    Swal.fire({
      title: title,
      text: text,
      icon: 'success',
      showConfirmButton: false,
      timer: 1000,
    });
  }

  /**
   * Show success toast in top-right corner (minimal)
   */
  successMin(title: string) {
    const toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 1000,
      timerProgressBar: true,
    });
    toast.fire({
      icon: 'success',
      title: title,
    });
  }

  /**
   * Show error dialog
   */
  error(title?: string, text?: string) {
    Swal.fire({
      title: title,
      text: text,
      icon: 'error',
    });
  }

  /**
   * Show warning dialog
   */
  warning(title?: string, text?: string) {
    Swal.fire({
      title: title,
      text: text,
      icon: 'warning',
    });
  }

  /**
   * Show warning dialog with HTML content
   */
  warningWithHtml(title?: string, html?: string) {
    Swal.fire({
      title: title,
      icon: 'warning',
      html: html,
    });
  }

  /**
   * Show confirmation dialog with callback
   */
  confirm(title: string, text: string, okCallback: () => any) {
    Swal.fire({
      title: title,
      text: text,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'OK',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.value) {
        okCallback();
      }
    });
  }

  /**
   * Show confirmation dialog and return Promise<boolean>
   */
  confirmSwal(title: string, text: string): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      Swal.fire({
        title: title,
        text: text,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'OK',
        cancelButtonText: 'Cancel',
      }).then((result) => {
        if (result.value) {
          resolve(true);
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          resolve(false);
        }
      });
    });
  }

  /**
   * Show confirmation dialog with custom styled buttons
   */
  confirmCssTwoButton(title: string, text: string): Promise<boolean> {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-success ml-3',
        cancelButton: 'btn btn-danger',
      },
      buttonsStyling: false,
    });

    return swalWithBootstrapButtons
      .fire({
        title: title,
        text: text,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'OK',
        cancelButtonText: 'Cancel',
        reverseButtons: true,
      })
      .then((result) => {
        return result.isConfirmed;
      });
  }
}
