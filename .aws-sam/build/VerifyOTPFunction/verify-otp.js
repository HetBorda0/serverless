const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

const TABLE_NAME = process.env.OTP_TABLE_NAME;
const MAX_ATTEMPTS = 3;

exports.handler = async (event) => {
  console.log('🔍 OTP Verification started');
  console.log('📥 Request body:', JSON.stringify(event.body));
  
  try {
    const { email, phoneNumber, otp, type } = JSON.parse(event.body);
    console.log('📧 Email:', email);
    console.log('📱 Phone:', phoneNumber);
    console.log('🔢 OTP:', otp);
    console.log('🏷️ Type:', type);
    
    if (!otp || !type || (type === 'email' && !email) || (type === 'phone' && !phoneNumber)) {
      console.log('❌ Invalid parameters provided');
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'POST, OPTIONS'
        },
        body: JSON.stringify({ message: 'Invalid parameters. OTP, type, and corresponding identifier are required.' })
      };
    }

    let result;
    const identifier = type === 'email' ? email : phoneNumber;
    console.log('🔍 Looking up OTP for:', identifier, 'Type:', type);

    // Get OTP record from DynamoDB based on type
    if (type === 'email') {
      console.log('📧 Querying by email...');
      const getParams = {
        TableName: TABLE_NAME,
        Key: { email: email }
      };
      result = await dynamodb.get(getParams).promise();
      console.log('📧 Email query result:', result.Item ? 'Found' : 'Not found');
    } else {
      console.log('📱 Querying by phone number using GSI...');
      // Use GSI for phone number lookup
      const queryParams = {
        TableName: TABLE_NAME,
        IndexName: 'PhoneNumberIndex',
        KeyConditionExpression: 'phoneNumber = :phoneNumber',
        ExpressionAttributeValues: {
          ':phoneNumber': phoneNumber
        }
      };
      result = await dynamodb.query(queryParams).promise();
      console.log('📱 Phone query result:', result.Items ? `${result.Items.length} items found` : 'No items found');
      // Get the first (and should be only) item from the query result
      result.Item = result.Items && result.Items.length > 0 ? result.Items[0] : null;
    }
    
    if (!result.Item) {
      console.log('❌ OTP not found in database');
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'POST, OPTIONS'
        },
        body: JSON.stringify({ message: 'OTP not found or expired' })
      };
    }

    const otpRecord = result.Item;
    const currentTime = Math.floor(Date.now() / 1000);
    console.log('📊 OTP Record found:', {
      storedOTP: otpRecord.otp,
      attempts: otpRecord.attempts,
      expirationTime: otpRecord.expirationTime,
      currentTime: currentTime
    });

    // Check if OTP is expired
    if (currentTime > otpRecord.expirationTime) {
      console.log('⏰ OTP has expired');
      // Delete expired OTP
      const deleteParams = {
        TableName: TABLE_NAME,
        Key: type === 'email' ? { email: email } : { email: otpRecord.email }
      };
      await dynamodb.delete(deleteParams).promise();
      console.log('🗑️ Expired OTP deleted from database');
      
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'POST, OPTIONS'
        },
        body: JSON.stringify({ message: 'OTP has expired' })
      };
    }

    // Check if max attempts exceeded
    if (otpRecord.attempts >= MAX_ATTEMPTS) {
      console.log('🚫 Maximum attempts exceeded:', otpRecord.attempts);
      // Delete OTP after max attempts
      const deleteParams = {
        TableName: TABLE_NAME,
        Key: type === 'email' ? { email: email } : { email: otpRecord.email }
      };
      await dynamodb.delete(deleteParams).promise();
      console.log('🗑️ OTP deleted due to max attempts');
      
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'POST, OPTIONS'
        },
        body: JSON.stringify({ message: 'Maximum attempts exceeded. Please request a new OTP.' })
      };
    }

    // Verify OTP
    console.log('🔍 Comparing OTPs:', { provided: otp, stored: otpRecord.otp });
    if (otpRecord.otp !== otp) {
      console.log('❌ OTP mismatch - incrementing attempts');
      // Increment attempts
      const updateParams = {
        TableName: TABLE_NAME,
        Key: type === 'email' ? { email: email } : { email: otpRecord.email },
        UpdateExpression: 'SET attempts = attempts + :inc',
        ExpressionAttributeValues: {
          ':inc': 1
        }
      };

      await dynamodb.update(updateParams).promise();
      console.log('📈 Attempts incremented to:', otpRecord.attempts + 1);

      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'POST, OPTIONS'
        },
        body: JSON.stringify({ message: 'Invalid OTP' })
      };
    }

    console.log('✅ OTP verified successfully!');
    // OTP is valid - delete it from database
    const deleteParams = {
      TableName: TABLE_NAME,
      Key: type === 'email' ? { email: email } : { email: otpRecord.email }
    };
    await dynamodb.delete(deleteParams).promise();
    console.log('🗑️ Verified OTP deleted from database');
    console.log('🎉 Verification completed successfully');

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({ 
        message: `${type} OTP verified successfully`,
        type: type,
        identifier: identifier
      })
    };

  } catch (error) {
    console.error('💥 Error verifying OTP:', error);
    console.error('❌ Stack trace:', error.stack);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({ message: 'Internal server error' })
    };
  }
}; 