document.body.onload = function() {
  chrome.storage.local.get("keym", function(items) {
    if (!chrome.runtime.error) {
      if (items.keym != undefined){
        document.getElementById("keym").value = items.keym;
      }     
    }
  });

  document.getElementById("saveKeyButton").onclick = function() {
    var keym = document.getElementById("keym").value;
    chrome.storage.local.set({ "keym" : keym }, function() {
      if (!chrome.runtime.error) {
        //
      }
    });
  }
}


document.getElementById('captureButton').addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      chrome.runtime.sendMessage({ action: 'capturePage', tabId: activeTab.id });
  });
});