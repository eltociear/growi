import loggerFactory from '~/utils/logger';


const logger = loggerFactory('growi:routes:apiv3:export-job');

const express = require('express');
const mongoose = require('mongoose');
const ErrorV3 = require('../../models/vo/error-apiv3');

const router = express.Router();

/**
 * @swagger
 *  tags:
 *    name: Export
 */

module.exports = (crowi) => {
  const accessTokenParser = require('../../middlewares/access-token-parser')(crowi);
  const loginRequired = require('../../middlewares/login-required')(crowi);
  const csrf = require('../../middlewares/csrf')(crowi);

  /**
   * @swagger
   *
   *  /export-jobs:
   *    post:
   *      tags: [Export]
   *      operationId: createExportJob
   *      summary: /export-jobs
   *      description: create export job
   *      requestBody:
   *        required: true
   *        content:
   *            application/json:
   *              schema:
   *                properties:
   *                  pageId:
   *                    type: number
   *                  format:
   *                    type: string
   *                required:
   *                  - pageId
   *                  - format
   *      responses:
   *        204:
   *          description: Job successfully created
   */
  router.post('/', accessTokenParser, loginRequired, csrf, async(req, res) => {
    const { path: basePagePath } = req.body;

    // when s3 or gcs is ready
    // NOTE: it allows only one multipart upload for now
    const MultipartUploadInfo = mongoose.model('MultipartUploadInfo');
    const count = await MultipartUploadInfo.countDocuments();
    if (count !== 0) throw Error('Another multipart upload job is still running. Try again when the job is over.');

    try {
      await crowi.exportService.bulkExportWithBasePagePath(basePagePath);
    }
    catch (err) {
      logger.error(err);
      const msg = 'Error occurred when starting export';
      return res.apiv3Err(new ErrorV3(msg, 'starting-export-failed'));
    }
    return res.apiv3();
  });

  return router;
};