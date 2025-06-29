const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

const TABLE_NAME = process.env.OTP_TABLE_NAME;

exports.handler = async (event) => {
  console.log('🧹 Cleanup Expired OTP started');
  console.log('📅 Current time:', new Date().toISOString());
  
  try {
    const currentTime = Math.floor(Date.now() / 1000);
    console.log('⏰ Current timestamp:', currentTime);

    // Scan for expired OTPs
    console.log('🔍 Scanning for expired OTPs...');
    const scanParams = {
      TableName: TABLE_NAME,
      FilterExpression: 'expirationTime < :currentTime',
      ExpressionAttributeValues: {
        ':currentTime': currentTime
      }
    };

    const scanResult = await dynamodb.scan(scanParams).promise();
    console.log('📊 Found expired OTPs:', scanResult.Items ? scanResult.Items.length : 0);

    if (!scanResult.Items || scanResult.Items.length === 0) {
      console.log('✅ No expired OTPs found');
      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'No expired OTPs found' })
      };
    }

    // Delete expired OTPs
    console.log('🗑️ Deleting expired OTPs...');
    const deletePromises = scanResult.Items.map(item => {
      const deleteParams = {
        TableName: TABLE_NAME,
        Key: {
          email: item.email
        }
      };
      console.log('🗑️ Deleting expired OTP for:', item.email || item.phoneNumber);
      return dynamodb.delete(deleteParams).promise();
    });

    await Promise.all(deletePromises);
    console.log('✅ Successfully deleted', scanResult.Items.length, 'expired OTPs');

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        message: `Successfully cleaned up ${scanResult.Items.length} expired OTPs`,
        deletedCount: scanResult.Items.length
      })
    };

  } catch (error) {
    console.error('💥 Error during cleanup:', error);
    console.error('❌ Stack trace:', error.stack);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error during cleanup' })
    };
  }
}; 