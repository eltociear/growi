import mongoose from 'mongoose';

import { getMongoUri, mongoOptions } from '@growi/core';
import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:migrate:adjust-page-grant');

module.exports = {

  async up(db) {
    logger.info('Apply migration');
    mongoose.connect(getMongoUri(), mongoOptions);

    const Page = require('~/server/models/page')();

    await Page.bulkWrite([
      {
        updateMany:
         {
           filter: { grant: null },
           update: { $set: { grant: Page.GRANT_PUBLIC } },
         },
      },
    ]);

    logger.info('Migration has successfully applied');

  },

  down(db) {
    // do not rollback
  },
};
