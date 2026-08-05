import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

export default {
  env: process.env.NODE_ENV,
  port: process.env.PORT,
  super_admin_email: process.env.SUPER_ADMIN_EMAIL,
  backend_base_url: process.env.BACKEND_BASE_URL,
  jwt: {
    jwt_secret: process.env.JWT_SECRET,
    gen_salt: process.env.GEN_SALT,
    expires_in: process.env.EXPIRES_IN,
    refresh_token_secret: process.env.REFRESH_TOKEN_SECRET,
    refresh_token_expires_in: process.env.REFRESH_TOKEN_EXPIRES_IN,
    reset_pass_secret: process.env.RESET_PASS_TOKEN,
    reset_pass_token_expires_in: process.env.RESET_PASS_TOKEN_EXPIRES_IN,
  },
  reset_pass_link: process.env.RESET_PASS_LINK,
  emailSender: {
    email_user_name: process.env.EMAIL_USER,
    email_pass: process.env.EMAIL_PASS,
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    publishableKey: process.env.STRIPE_PK,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  },
  twilio: {
    twilio_id: process.env.TWILIO_ID,
    twilio_token: process.env.TWILIO_TOKEN,
    twilio_number: process.env.TWILIO_PHONE_NUMBER,
  },
  brevo: {
    brevo_api_key: process.env.BREVO_API_KEY,
  },
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  },
  otpSecret: {
    signup_otp_secret: process.env.SIGNUP_OTP_SECRET,
    verify_otp_secret: process.env.VERIFY_OTP_SECRET,
    reset_password_secret: process.env.RESET_PASSWORD_SECRET,
    login_otp_secret: process.env.LOGIN_OTP_SECRRET,
    forget_password_secret: process.env.FORGET_PASSWORD_SECRET,
  },
  S3: {
    space_endpoint: process.env.SPACE_ENDPOINT,
    space_origin_endpoint: process.env.SPACE_ORIGIN_ENDPOINT,
    space_accesskey: process.env.SPACE_ACCESS_KEY,
    space_secret_key: process.env.SPACE_SECRET_KEY,
    space_bucket: process.env.SPACE_BUCKET,
    space_bucket_region: process.env.SPACE_BUCKET_REGION,
  },
  
};
