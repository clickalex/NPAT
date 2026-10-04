let deferredInstallPrompt = null;

function setInstallButtonsVisible(visible) {
  document.querySelectorAll('[data-install-app]').forEach((button) => {
    button.hidden = !visible;
  });
}

window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;
  setInstallButtonsVisible(true);
});

window.addEventListener('appinstalled', () => {
  deferredInstallPrompt = null;
  setInstallButtonsVisible(false);
});

document.querySelectorAll('[data-install-app]').forEach((button) => {
  button.addEventListener('click', async () => {
    if (!deferredInstallPrompt) return;
    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    setInstallButtonsVisible(false);
  });
});

function updateConnectionStatus() {
  const offline = !navigator.onLine;
  document.querySelectorAll('[data-connection-status]').forEach((status) => {
    status.textContent = offline ? 'Offline · saved game ready' : 'Online';
    status.classList.toggle('is-offline', offline);
    status.setAttribute('aria-label', offline ? 'You are offline. The saved game is available.' : 'You are online.');
  });
}

window.addEventListener('online', updateConnectionStatus);
window.addEventListener('offline', updateConnectionStatus);
updateConnectionStatus();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch((error) => {
      console.warn('NPAT could not register its offline cache.', error);
    });
  });
}
