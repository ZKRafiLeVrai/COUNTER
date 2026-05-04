export default async function handler(req, res) {
  // Autorise les CORS pour que Roblox puisse appeler
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { universeId, dataStoreName, action, key } = req.body;

  const API_KEY = "ZBJkaYNen0iXfxa0ObNw8fAEZVmUt8r2rBTZvHL/3LmSs24bZXlKaGJHY2lPaUpTVXpJMU5pSXNJbXRwWkNJNkluTnBaeTB5TURJeExUQTNMVEV6VkRFNE9qVXhPalE1V2lJc0luUjVjQ0k2SWtwWFZDSjkuZXlKaGRXUWlPaUpTYjJKc2IzaEpiblJsY201aGJDSXNJbWx6Y3lJNklrTnNiM1ZrUVhWMGFHVnVkR2xqWVhScGIyNVRaWEoyYVdObElpd2lZbUZ6WlVGd2FVdGxlU0k2SWxwQ1NtdGhXVTVsYmpCcFdHWjRZVEJQWWs1M09HWkJSVnBXYlZWME9ISXlja0pVV25aSVRDOHpURzFUY3pJMFlpSXNJbTkzYm1WeVNXUWlPaUl5TmpVM09UWTJOVEFpTENKbGVIQWlPakUzTnpjNU1UQTFOakFzSW1saGRDSTZNVGMzTnprd05qazJNQ3dpYm1KbUlqb3hOemMzT1RBMk9UWXdmUS5qT0RJR2NEYkFLVGpqQXFkWjBHVElBR3FFd25JcWJYc1g4T29tbVpnSVRCdU8xRTlNZTliSC0wVWxfRTduU01RSjFqdmpKY2R6ZFY5UG8zbjQxV09vOGtqWmdvSXZCcnpqMDVybE94SU9BT0NLUlhzc1dWUnIxRXk5VU5PbGVKckxtYzI0TnNUeU1fUm80RlRnRFlXSFdYVmtTS29sWjRLaUZ3cUctNkZpSktmWFFNZld6akdSa1YyQTlVWUlHWEtER0hnREtZcVVBVHRveENxYllWa3cwX25pLThZUmctR2RMcVZGZXVNN2VHQUxXZ1dtMUNYelUtZzF1TC13NVlrOTRGTVhvVU9tQW9hT3pJN3hOY0NyYkpQallXZ3dOdEZYb00ycmpKdm02LUdQQ0dIa2ZLbWtlTVkyR2JTajVNQ2tWcEloTXRfcl9QMWdWV1E2elQ0Y1E=";

  try {
    if (action === 'listKeys') {
      // Lister toutes les clés du DataStore
      let allKeys = [];
      let pageToken = null;

      do {
        let url = `https://apis.roblox.com/cloud/v2/universes/${universeId}/data-stores/${dataStoreName}/entries?scope=global&maxPageSize=100`;
        if (pageToken) {
          url += `&pageToken=${encodeURIComponent(pageToken)}`;
        }

        const response = await fetch(url, {
          headers: { 'x-api-key': API_KEY }
        });

        if (!response.ok) {
          const errText = await response.text();
          return res.status(response.status).json({ error: errText });
        }

        const data = await response.json();

        for (const entry of (data.dataStoreEntries || [])) {
          // L'ID est de la forme "global/123456789", on extrait le nombre
          const entryId = entry.id;
          const keyName = entryId.includes('/') ? entryId.split('/')[1] : entryId;
          allKeys.push(keyName);
        }

        pageToken = data.nextPageToken;
      } while (pageToken);

      return res.status(200).json({ keys: allKeys });
    }

    if (action === 'getData') {
      // Lire les données d'un joueur
      const response = await fetch(`https://apis.roblox.com/cloud/v2/universes/${universeId}/data-stores/${dataStoreName}/entries/global%2F${key}`, {
        headers: { 'x-api-key': API_KEY }
      });

      if (!response.ok) {
        const errText = await response.text();
        return res.status(response.status).json({ error: errText });
      }

      const data = await response.json();
      return res.status(200).json({ value: data.value });
    }

    return res.status(400).json({ error: 'Action inconnue' });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
