chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'capturePage') {
      chrome.pageCapture.saveAsMHTML({ tabId: request.tabId }, (mhtmlBlob) => {
          // Получаем текущую вкладку
          chrome.tabs.get(request.tabId, (currentTab) => {
              const url = currentTab.url;

              const reader = new FileReader();
              reader.onload = function() {
                const mhtmlContent = reader.result;

                // Подготовка данных для отправки
                const formData = new FormData();
                const blob = new Blob([mhtmlContent]);
                formData.append('mhtml', blob, 'data.bin');
                formData.append('url', url); // Добавляем URL в данные

                chrome.storage.local.get("keym", function(items) {
                    formData.append('key', items.keym);
                  // Отправка POST-запроса
                  fetch('https://mem.upread.ru/mph.php', {
                      method: 'POST',
                      body: formData
                  })
                  .then(response => {
                      if (response.ok) {
                          chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                            chrome.tabs.sendMessage(request.tabId, { action: "showAlert", message: 'Страница сохранена успешно' });
                          });
                      } else {
                        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                            chrome.tabs.sendMessage(request.tabId, { action: "showAlert", message: 'Ошибка при отправке страницы' });
                          });
                      }
                  })
                  .catch(error => {
                    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                        chrome.tabs.sendMessage(request.tabId, { action: "showAlert", message:'Ошибка при отправке страницы' });
                      });
                  });

                    
                });
                 


              };
              reader.readAsArrayBuffer(mhtmlBlob);
          });
      });
  }
});

// Проверка наличия API Chrome
if (typeof chrome === 'undefined' || !chrome.runtime || !chrome.runtime.getManifest) {
  console.error('Chrome runtime API is not available. Is this running in an extension context?');
} else {
  console.log('Background script loaded successfully.');

  // Параметры для проверки обновлений
  const CHECK_INTERVAL = 24 * 60 * 60 * 1000; // Проверка каждые 24 часа

  // Функция сравнения версий
  function compareVersions(v1, v2) {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);
    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
      const part1 = parts1[i] || 0;
      const part2 = parts2[i] || 0;
      if (part1 < part2) return -1;
      if (part1 > part2) return 1;
    }
    return 0;
  }

  // Функция проверки обновлений
  function checkForUpdates() {
    console.log('Checking for updates...');

    // URL JSON-файла с информацией о последней версии
    const UPDATE_URL = 'https://mem.upread.ru/dist/update.json';

    fetch(UPDATE_URL)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        const currentVersion = chrome.runtime.getManifest().version;
        const latestVersion = data.latestVersion;

        console.log(`Current version: ${currentVersion}`);
        console.log(`Latest version on server: ${latestVersion}`);

        if (compareVersions(currentVersion, latestVersion) < 0) {
          console.log(`New version available: ${latestVersion}`);
          downloadAndUpdate(data.downloadUrl);
        } else {
          console.log('Extension is up to date.');
        }
      })
      .catch(error => {
        console.error('Failed to check for updates:', error);
      });
  }

  // Функция загрузки новой версии
  function downloadAndUpdate(downloadUrl) {
    console.log('Downloading update from:', downloadUrl);

    fetch(downloadUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.blob();
      })
      .then(blob => {
        console.log('Update downloaded successfully.');

        // Используем API Chrome для скачивания файла напрямую из Blob
        const reader = new FileReader();
        reader.onload = () => {
          const base64Data = reader.result.split(',')[1]; // Получаем Base64 данные
          chrome.downloads.download({
            url: `data:application/zip;base64,${base64Data}`,
            filename: 'my-extension-latest.zip'
          }, () => {
            console.log('Update file downloaded. Please manually update the extension.');
          });
        };
        reader.readAsDataURL(blob); // Преобразуем Blob в Base64
      })
      .catch(error => {
        console.error('Failed to download update:', error);
      });
  }

  // Запуск проверки при старте расширения
  checkForUpdates();

  // Периодическая проверка обновлений
  setInterval(checkForUpdates, CHECK_INTERVAL);
}