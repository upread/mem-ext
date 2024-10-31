chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request.action === "showAlert") {
	  alert(request.message);
	  chrome.runtime.sendMessage({ action: "closePopup" });
	}
  });

