const useWorker = true;

if ('serviceWorker' in navigator) {
  if (useWorker) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js');
    });
  } else {
    navigator.serviceWorker.getRegistrations().then(function(registrations) {
      for (let registration of registrations) {
        registration.unregister().then(function() {
          // ignore
        }, function() {
          // ignore
        });
      }
    });
  }
}