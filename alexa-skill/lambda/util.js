const AWS = require('aws-sdk');

const s3SigV4Client = new AWS.S3({
  signatureVersion: 'v4',
  region: process.env.S3_PERSISTENCE_REGION,
});

module.exports = {
  getS3PreSignedUrl(s3ObjectKey) {
    const bucketName = process.env.S3_PERSISTENCE_BUCKET;
    const s3PreSignedUrl = s3SigV4Client.getSignedUrl('getObject', {
      Bucket: bucketName,
      Key: s3ObjectKey,
      Expires: 60 * 1, // the Expires is capped for 1 minute
    });
    console.log(`Util.s3PreSignedUrl: ${s3ObjectKey} URL ${s3PreSignedUrl}`);
    return s3PreSignedUrl;
  },

  shuffle(input) {
    const result = [];
    for (let i = input.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [input[j], input[i]];
    }
    return result;
  },

  getDefaultSlotResolution(slot, fallback) {
    if (!slot
          || !slot.resolutions
          || !Array.isArray(slot.resolutions.resolutionsPerAuthority)
          || slot.resolutions.resolutionsPerAuthority.length === 0
          || !Array.isArray(slot.resolutions.resolutionsPerAuthority[0].values)
          || slot.resolutions.resolutionsPerAuthority[0].values.length === 0
          || !slot.resolutions.resolutionsPerAuthority[0].values[0].value) {
      return fallback;
    }

    return slot.resolutions.resolutionsPerAuthority[0].values[0].value.name;
  },
};
