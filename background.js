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
                          console.log('MHTML файл успешно отправлен');
                      } else {
                          console.error('Ошибка при отправке MHTML файла');
                      }
                  })
                  .catch(error => {
                      console.error('Ошибка сети:', error);
                  });

                    
                });
                 


              };
              reader.readAsArrayBuffer(mhtmlBlob);
          });
      });
  }
});
