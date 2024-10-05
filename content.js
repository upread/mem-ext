/*
function getInfo(){
	chrome.storage.local.get("nik", function(items) {
		if (!chrome.runtime.error) {
			console.log(items);
			var xhr = new XMLHttpRequest();
			xhr.responseType = 'document';
			xhr.open("POST", "https://for-lost.tech/api.php?hash=vxblmkr3oph36ndw3i2curuu37gm4", true);
	
			var data = new FormData();
			data.append('name', items.nik);
  
			xhr.onreadystatechange = function() {
				if (this.readyState == 4 && this.status == 200) {
					var html = this.response.body.innerHTML;

					chrome.storage.local.get("data", function(items) {
						if (items.data != html){
							chrome.runtime.sendMessage({
								action: 'updateIcon',
								value: true
							});
							
							chrome.storage.local.set({ "data" : html }, function() {
								if (chrome.runtime.error) {
									console.log("Runtime error.");
								}
							});	
						}
					  });
	 
				}
			}	
			xhr.send(data);	
		}
	});
}

setTimeout(getInfo, 60000);
setInterval(getInfo, 240000);
*/



