import { InAppNotification } from '../../models/in-app-notification';

const express = require('express');

const router = express.Router();


module.exports = (crowi) => {
  const accessTokenParser = require('../../middlewares/access-token-parser')(crowi);
  const loginRequiredStrictly = require('../../middlewares/login-required')(crowi);
  const csrf = require('../../middlewares/csrf')(crowi);
  const inAppNotificationService = crowi.inAppNotificationService;

  router.get('/list', accessTokenParser, loginRequiredStrictly, async(req, res) => {
    const user = req.user;

    let limit = 10;
    if (req.query.limit) {
      limit = parseInt(req.query.limit, 10);
    }

    let offset = 0;
    if (req.query.offset) {
      offset = parseInt(req.query.offset, 10);
    }

    const requestLimit = limit + 1;

    const paginationResult = await inAppNotificationService.getLatestNotificationsByUser(user._id, requestLimit, offset);
    return res.apiv3(paginationResult);

  });

  router.get('/status', accessTokenParser, loginRequiredStrictly, async(req, res) => {
    const userId = req.user._id;
    try {
      const count = await inAppNotificationService.getUnreadCountByUser(userId);
      const result = { count };
      return res.apiv3(result);
    }
    catch (err) {
      return res.apiv3Err(err);
    }
  });

  router.post('/read', accessTokenParser, loginRequiredStrictly, csrf, (req, res) => {
    const user = req.user;

    try {
      const notification = InAppNotification.read(user);
      const result = { notification };
      return res.apiv3(result);
    }
    catch (err) {
      return res.apiv3Err(err);
    }
  });

  router.post('/open', accessTokenParser, loginRequiredStrictly, csrf, async(req, res) => {
    const user = req.user;
    const id = req.body.id;

    try {
      const notification = await InAppNotification.open(user, id);
      const result = { notification };
      return res.apiv3(result);
    }
    catch (err) {
      return res.apiv3Err(err);
    }
  });

  return router;
};