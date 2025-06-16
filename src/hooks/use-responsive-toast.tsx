import { toast, type ToastProps } from '@/hooks/use-toast';
import * as React from 'react';

type ResponsiveToastProps = ToastProps & {
  className?: string;
  description?: React.ReactNode;
};

const mobileToastManager = {
  toasts: [] as HTMLDivElement[],

  add(toast: HTMLDivElement): void {
    this.toasts.push(toast);
    this.updatePositions();
  },

  remove(toast: HTMLDivElement): void {
    const index = this.toasts.indexOf(toast);
    if (index !== -1) {
      this.toasts.splice(index, 1);
      this.updatePositions();
    }
  },

  updatePositions(): void {
    const gap = 5;

    this.toasts.forEach((toast, index) => {
      const topPosition = 5 + index * (toast.offsetHeight + gap);
      toast.style.top = `${topPosition}px`;
      toast.style.bottom = 'auto';
    });
  },
};

function createMobileToast(
  title?: React.ReactNode,
  description?: React.ReactNode,
  variant: 'default' | 'destructive' = 'default',
  duration: number = 5000,
): void {
  if (typeof window === 'undefined') return;

  const toastContainer = document.createElement('div');

  Object.assign(toastContainer.style, {
    position: 'fixed',
    top: '5px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '85vw',
    maxWidth: '85vw',
    backgroundColor: variant === 'destructive' ? '#f44336' : '#333',
    color: '#fff',
    borderRadius: '4px',
    padding: '12px 16px',
    boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
    zIndex: '9999',
    opacity: '0',
    transition: 'opacity 0.3s ease, top 0.3s ease, transform 0.2s ease',
    fontSize: '14px',
    wordBreak: 'break-word',
    whiteSpace: 'normal',
    overflow: 'hidden',
    cursor: 'pointer',
  });

  if (title) {
    const titleElement = document.createElement('div');
    titleElement.style.fontWeight = 'bold';
    titleElement.style.marginBottom = '2px';
    titleElement.textContent = title.toString();
    toastContainer.appendChild(titleElement);
  }

  if (description) {
    const descElement = document.createElement('div');
    descElement.style.wordBreak = 'break-word';
    descElement.style.whiteSpace = 'normal';

    const descText = description.toString();
    descElement.textContent = descText.length > 100 ? `${descText.substring(0, 97)}...` : descText;

    toastContainer.appendChild(descElement);
  }

  document.body.appendChild(toastContainer);

  mobileToastManager.add(toastContainer);

  setTimeout(() => {
    toastContainer.style.opacity = '1';
  }, 10);

  const removeToast = () => {
    toastContainer.style.opacity = '0';
    setTimeout(() => {
      if (document.body.contains(toastContainer)) {
        document.body.removeChild(toastContainer);
        mobileToastManager.remove(toastContainer);
      }
    }, 300);
  };

  const timeoutId = setTimeout(() => {
    removeToast();
  }, duration);

  let touchStartX = 0;
  let touchStartY = 0;
  let initialTransform = 'translateX(-50%)';

  toastContainer.addEventListener(
    'touchstart',
    (e) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      initialTransform = toastContainer.style.transform;
      clearTimeout(timeoutId);
    },
    { passive: true },
  );

  toastContainer.addEventListener(
    'touchmove',
    (e) => {
      const touchX = e.touches[0].clientX;
      const touchY = e.touches[0].clientY;

      const deltaX = touchX - touchStartX;
      const deltaY = Math.abs(touchY - touchStartY);

      if (deltaY < Math.abs(deltaX) * 0.8) {
        e.preventDefault();

        toastContainer.style.transform = `translateX(calc(-50% + ${deltaX}px))`;
      }
    },
    { passive: false },
  );

  toastContainer.addEventListener(
    'touchend',
    (e) => {
      const touchX = e.changedTouches[0].clientX;
      const deltaX = touchX - touchStartX;

      if (Math.abs(deltaX) > 80) {
        const direction = deltaX > 0 ? '100%' : '-100%';
        toastContainer.style.transform = `translateX(${direction})`;
        toastContainer.style.opacity = '0';

        setTimeout(removeToast, 300);
      } else {
        toastContainer.style.transform = initialTransform;

        setTimeout(() => {
          removeToast();
        }, duration);
      }
    },
    { passive: true },
  );

  toastContainer.addEventListener('click', () => {
    removeToast();
  });
}

export function useResponsiveToast() {
  const responsiveToast = (props: ResponsiveToastProps) => {
    const isMobile = typeof window !== 'undefined' ? window.innerWidth < 480 : false;
    if (isMobile) {
      const variant = props.variant === null ? undefined : props.variant;
      createMobileToast(props.title, props.description, variant, props.duration || 5000);

      return { id: '' };
    }

    return toast(props);
  };

  return { toast: responsiveToast };
}
