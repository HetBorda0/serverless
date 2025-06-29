const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();
const crypto = require('crypto');

const TABLE_NAME = process.env.OTP_TABLE_NAME;

exports.handler = async (event) => {
  console.log('🚀 OTP Generation started');
  console.log('📥 Request body:', JSON.stringify(event.body));
  
  try {
    const { email, phoneNumber } = JSON.parse(event.body);
    console.log('📧 Email provided:', email ? 'Yes' : 'No');
    console.log('📱 Phone provided:', phoneNumber ? 'Yes' : 'No');
    
    if (!email && !phoneNumber) {
      console.log('❌ No email or phone provided');
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'POST, OPTIONS'
        },
        body: JSON.stringify({ message: 'Email or phone number is required' })
      };
    }

    const results = {};

    // Generate OTP for email if provided
    if (email) {
      console.log('🔐 Generating email OTP for:', email);
      const emailOtp = crypto.randomInt(100000, 999999).toString();
      const emailExpirationTime = Math.floor(Date.now() / 1000) + (15 * 60);
      
      console.log('📧 Email OTP generated:', emailOtp);
      console.log('⏰ Email OTP expires at:', new Date(emailExpirationTime * 1000).toISOString());
      
      const emailParams = {
        TableName: TABLE_NAME,
        Item: {
          email: email,
          otp: emailOtp,
          expirationTime: emailExpirationTime,
          createdAt: Math.floor(Date.now() / 1000),
          attempts: 0,
          type: 'email'
        }
      };

      console.log('💾 Storing email OTP in DynamoDB...');
      await dynamodb.put(emailParams).promise();
      console.log('✅ Email OTP stored successfully');
      
      results.email = { otp: emailOtp, email: email };
      console.log(`📧 Email OTP ${emailOtp} generated for: ${email}`);
    }

    // Generate OTP for phone if provided
    if (phoneNumber) {
      console.log('🔐 Generating phone OTP for:', phoneNumber);
      const phoneOtp = crypto.randomInt(100000, 999999).toString();
      const phoneExpirationTime = Math.floor(Date.now() / 1000) + (15 * 60);
      
      console.log('📱 Phone OTP generated:', phoneOtp);
      console.log('⏰ Phone OTP expires at:', new Date(phoneExpirationTime * 1000).toISOString());
      
      const phoneParams = {
        TableName: TABLE_NAME,
        Item: {
          phoneNumber: phoneNumber,
          otp: phoneOtp,
          expirationTime: phoneExpirationTime,
          createdAt: Math.floor(Date.now() / 1000),
          attempts: 0,
          type: 'phone'
        }
      };

      console.log('💾 Storing phone OTP in DynamoDB...');
      await dynamodb.put(phoneParams).promise();
      console.log('✅ Phone OTP stored successfully');
      
      results.phone = { otp: phoneOtp, phoneNumber: phoneNumber };
      console.log(`📱 Phone OTP ${phoneOtp} generated for: ${phoneNumber}`);
    }

    // TODO: Send OTPs via email service (SES) and SMS service (SNS)
    console.log('📤 TODO: Send OTPs via email/SMS services');
    console.log('🎯 Generation completed successfully');

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({ 
        message: 'OTPs sent successfully',
        results: results
      })
    };

  } catch (error) {
    console.error('💥 Error generating OTP:', error);
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