chrome.identity.getAuthToken(
	{'interactive': true},
	function(){
	  //load Google's javascript client libraries
		window.gapi_onload = authorize;
		loadScript('https://apis.google.com/js/client.js');
	}
);

const { google } = require('googleapis');
const gmail = google.gmail('v1');

async function read(auth) {
    const draftsResponse = await gmail.users.drafts.list({
        userId: 'me',
        auth: auth
    });

    const drafts = draftsResponse.data.drafts;

    if (drafts && drafts.length) {
        const draftResponse = await gmail.users.drafts.get({
            userId: 'me',
            id: drafts[0].id,
            auth: auth
        });

        const topDraftMessage = draftResponse.data.message.snippet;
        console.log(`Top draft: ${topDraftMessage}`);

        return topDraftMessage;
    } else {
        console.log('No drafts found.');
        return null;
    }
}

module.exports = { read };