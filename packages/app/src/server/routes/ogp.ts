import {
  Request, Response,
} from 'express';

import axios from '~/utils/axios';

module.exports = function(crowi) {
  return {
    async renderOgp(req: Request, res: Response) {

      if (req.params.pageId === '') {
        return res.status(400).send();
      }

      const ogpUri: string = process.env.OGP_URI || '';
      if (ogpUri === '') {
        return res.status(400).send('OGP URI for GROWI has not been setup');
      }

      let result;
      try {
        result = await axios({
          url: ogpUri,
          method: 'GET',
          responseType: 'stream',
          // TODO: Make it possible to display the GROWI APP name and page title
          params: {
            title: 'Page Title',
            brand: 'GROWI App Name',
          },
        });
      }
      catch (err) {
        const { status, statusText } = err.response;
        console.log(`Error! HTTP Status: ${status} ${statusText}`);
        return res.status(500).send();
      }

      res.writeHead(200, {
        'Content-Type': 'image/jpeg',
      });
      result.data.pipe(res);
    },
  };
};
