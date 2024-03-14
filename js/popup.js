document.getElementById('refresh').addEventListener('click', function() {
    chrome.runtime.sendMessage({action: 'fetchInbox'}, function(response) {
  
    });
    chrome.runtime.onMessage.addListener(
      function(request, sender, sendResponse) {
        if (request.action == "fetchInbox") {
          // Log the message body to the console
          console.log(request.data);
        }
      }
    );
  });