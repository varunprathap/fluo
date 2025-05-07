import { google } from "googleapis";
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { accessToken } = req.headers;
  
  if (!accessToken || Array.isArray(accessToken)) {
    return res.status(401).json({ error: 'Invalid access token' });
  }
  
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  
  const drive = google.drive({ version: "v3", auth });
  
  try {
    const response = await drive.files.list({
      corpora: 'drive',
      driveId: process.env.SHARED_DRIVE_ID,
      includeItemsFromAllDrives: true,
      supportsAllDrives: true,
      fields: 'files(id,name,webViewLink)'
    });
    
    res.status(200).json(response.data.files);
  } catch (error) {
    console.error('Drive API error:', error);
    res.status(500).json({ error: 'Drive API error' });
  }
} 