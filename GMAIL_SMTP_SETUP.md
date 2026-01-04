# Gmail SMTP Setup for SOS Email Alerts

This guide will help you set up Gmail SMTP for sending critical health alert emails when temperature or heart rate becomes critical.

## Prerequisites

- A Gmail account
- Access to Google Account settings

## Step 1: Enable 2-Factor Authentication

1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Click on "Security" in the left sidebar
3. Under "Signing in to Google", click on "2-Step Verification"
4. Follow the prompts to enable 2FA if not already enabled

## Step 2: Generate App Password

1. In Google Account Settings, go to "Security"
2. Under "Signing in to Google", click on "App passwords"
3. Select "Mail" as the app
4. Select "Other (Custom name)" as the device
5. Enter "MediMe Health Alerts" as the custom name
6. Click "Generate"
7. **Copy the 16-character app password** (you'll need this for the .env file)

## Step 3: Update Environment Variables

Update your `.env.local` file with your Gmail credentials:

```env
# Gmail SMTP Configuration for SOS Alerts
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-16-character-app-password
```

**Important Notes:**
- Replace `your-email@gmail.com` with your actual Gmail address
- Replace `your-16-character-app-password` with the app password from Step 2
- **Never use your regular Gmail password** - only use the app password
- **Never commit these credentials to version control**

## Step 4: Test the Setup

1. Start your development server: `npm run dev`
2. Go to the Vitals page
3. Start monitoring with simulation mode
4. The system will automatically send SOS emails when:
   - Temperature > 38.0°C (High fever)
   - Temperature < 35.5°C (Hypothermia)
   - Heart Rate > 120 BPM (Tachycardia)
   - Heart Rate < 50 BPM (Bradycardia)

## How It Works

### Critical Thresholds
- **Temperature Critical**: > 38.0°C or < 35.5°C
- **Heart Rate Critical**: > 120 BPM or < 50 BPM

### Email Features
- **High Priority**: Emails are marked as high priority
- **Rich HTML Content**: Professional medical alert format
- **Emergency Contacts**: Includes emergency service numbers
- **Spam Prevention**: Won't send more than 3 alerts per hour
- **Database Logging**: All alerts are logged in the database

### Email Content Includes
- Critical vital signs readings
- Timestamp of the alert
- Emergency contact information
- Clear action items for the user
- Professional medical alert formatting

## Troubleshooting

### Common Issues

1. **"Invalid login" error**
   - Make sure you're using the app password, not your regular password
   - Verify 2FA is enabled on your Google account

2. **"Less secure app access" error**
   - This shouldn't happen with app passwords, but if it does:
   - Go to Google Account Settings > Security
   - Turn on "Less secure app access" (not recommended)
   - Better solution: Use app passwords instead

3. **Emails not being sent**
   - Check the browser console for error messages
   - Verify your Gmail credentials in .env.local
   - Make sure the API route is accessible

4. **Emails going to spam**
   - This is normal for automated emails
   - Add your Gmail address to your contacts
   - Check spam folder regularly

### Testing Without Real Critical Values

You can test the system by temporarily modifying the critical thresholds in the code:

```typescript
// In vital-signs-dashboard.tsx, temporarily change:
if (vitals.temperature > 36.0) { // Lower threshold for testing
  // ... alert logic
}
```

## Security Best Practices

1. **Never commit credentials**: Always use .env files and add them to .gitignore
2. **Use app passwords**: Never use your main Gmail password
3. **Rotate passwords**: Regenerate app passwords periodically
4. **Monitor usage**: Check your Gmail sent folder for unexpected emails
5. **Limit scope**: Only use this Gmail account for health alerts

## Production Deployment

For production deployment (Vercel, Netlify, etc.):

1. Add environment variables in your hosting platform's dashboard
2. Never include credentials in your code
3. Consider using a dedicated email service like SendGrid or AWS SES for production
4. Set up proper error monitoring and logging

## Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify your Gmail app password is correct
3. Test with a simple email first
4. Check the API route logs for detailed error information

The SOS email system is now ready to protect your health by sending immediate alerts when critical vital signs are detected!