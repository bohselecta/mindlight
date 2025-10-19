/**
 * Service Worker Registration
 * 
 * Handles registration and updates of the service worker
 */

export function registerServiceWorker() {
  if (typeof window === 'undefined') return;

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered successfully:', registration.scope);

        // Handle updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New content is available, show update prompt
              showUpdatePrompt();
            }
          });
        });

        // Handle controller change (app was updated)
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          window.location.reload();
        });

      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    });
  }
}

function showUpdatePrompt() {
  // Create a simple update notification
  const updateNotification = document.createElement('div');
  updateNotification.className = 'fixed top-4 right-4 z-50 bg-slate-800 border border-slate-700 rounded-xl p-4 shadow-2xl';
  updateNotification.innerHTML = `
    <div class="flex items-center gap-3">
      <div class="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
        <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
        </svg>
      </div>
      <div>
        <h3 class="text-sm font-medium text-slate-200">Update Available</h3>
        <p class="text-xs text-slate-400">A new version of Reflector is ready.</p>
      </div>
      <button id="update-btn" class="bg-blue-500 hover:bg-blue-600 text-white text-xs py-1 px-3 rounded-lg transition-all">
        Update
      </button>
      <button id="dismiss-btn" class="text-slate-400 hover:text-slate-200">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
    </div>
  `;

  document.body.appendChild(updateNotification);

  // Handle update button click
  const updateBtn = updateNotification.querySelector('#update-btn');
  const dismissBtn = updateNotification.querySelector('#dismiss-btn');

  updateBtn?.addEventListener('click', () => {
    // Tell the service worker to skip waiting and activate
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
    }
    updateNotification.remove();
  });

  dismissBtn?.addEventListener('click', () => {
    updateNotification.remove();
  });

  // Auto-dismiss after 10 seconds
  setTimeout(() => {
    if (document.body.contains(updateNotification)) {
      updateNotification.remove();
    }
  }, 10000);
}

// Export for use in components
export { showUpdatePrompt };
