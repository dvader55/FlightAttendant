chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      if (request.action == "fetchInbox") {
        chrome.identity.getAuthToken({interactive: true}, function(token) {
          fetchInbox(token, sendResponse);
        });
        return true;  // Will respond asynchronously
      }
    }
  );
  
  function fetchInbox(token, callback) {
    fetch('https://www.googleapis.com/gmail/v1/users/me/drafts', {
      headers: {
        Authorization: 'Bearer ' + token
      }
    })
    .then(response => response.json())
    .then(data => {
      // Check if there are any drafts
      if (data.drafts && data.drafts.length > 0) {
        // Get the ID of the first draft
        var draftId = data.drafts[0].id;
  
        // Fetch the full details of the draft
        fetch('https://www.googleapis.com/gmail/v1/users/me/drafts/' + draftId, {
          headers: {
            Authorization: 'Bearer ' + token
          }
        })
        .then(response => response.json())
        .then(draft => {
          // Check if the email is multipart
          if (draft.message.payload.mimeType === "multipart/alternative") {
            // Find the part with the mimeType "text/html"
            const part = draft.message.payload.parts.find(part => part.mimeType === "text/html");
            if (part && part.body.data) {
              // Decode the base64 string
              var decodedBody = atob(part.body.data.replace(/-/g, '+').replace(/_/g, '/'));
              // Remove HTML tags using regex
              var plainText = decodedBody.replace(/<[^>]*>?/gm, '');
              // Send a message to the popup with the plain text message body
              chrome.runtime.sendMessage({action: "fetchInbox", data: plainText});
            }
          } else if (draft.message.payload.body.data) {
            // Decode the base64 string
            var decodedBody = atob(draft.message.payload.body.data.replace(/-/g, '+').replace(/_/g, '/'));
            // Send a message to the popup with the decoded message body
            chrome.runtime.sendMessage({action: "fetchInbox", data: decodedBody});
          }
        });
      } else {
        console.log('No drafts found');
      }
    })
    .catch(error => console.error('Error:', error));
  }