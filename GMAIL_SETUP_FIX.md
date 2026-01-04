# 🚨 Gmail SMTP Setup - Step by Step Fix

## Issue Identified
Your current Gmail app password `9594910933` appears to be a phone number, not a Gmail app password. Gmail app passwords are 16-character alphanumeric codes.

## Step-by-Step Fix

### 1. Enable 2-Factor Authentication (if not already done)
1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Click "Security" in the left sidebar
3. Under "Signing in to Google", click "2-Step Verification"
4. Follow the prompts to enable 2FA using your phone number

### 2. Generate Gmail App Password
1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Click "Security" in the left sidebar
3. Under "Signing in to Google", click "App passwords"
   - If you don't see this option, make sure 2FA is enabled first
4. Select "Mail" as the app
5. Select "Other (Custom name)" as the device
6. Enter "MediMe Health Alerts" as the custom name
7. Click "Generate"
8. **Copy the 16-character password** (it will look like: `abcd efgh ijkl mnop`)
   - **Important**: Copy it WITHOUT spaces
   - Example: `abcdefghijklmnop` (16 characters, no spaces)

### 3. Update .env.local File
Replace your current Gmail configuration with:

```env
# Gmail SMTP Configuration for SOS Alerts
GMAIL_USER=2023.siddharth.gupta@ves.ac.in
GMAIL_APP_PASSWORD=your-16-character-app-password-here
```

**Example of correct format:**
```env
GMAIL_USER=2023.siddharth.gupta@ves.ac.in
GMAIL_APP_PASSWORD=abcdefghijklmnop
```

### 4. Test the Configuration

#### Option A: Use Debug Endpoint
1. Go to: http://localhost:3001/api/debug-gmail
2. This will test your Gmail SMTP connection and send a test email
3. Check the response for detailed error information

#### Option B: Use Test Button
1. Go to: http://localhost:3001/vitals
2. Click the "🧪 Test SOS Email" button
3. Check browser console for detailed logs

### 5. Common Issues and Solutions

#### Issue: "Authentication failed"
- **Cause**: Wrong app password or 2FA not enabled
- **Solution**: Regenerate app password, ensure 2FA is enabled

#### Issue: "App password not found"
- **Cause**: 2FA not enabled on Gmail account
- **Solution**: Enable 2-Factor Authentication first

#### Issue: "Less secure app access"
- **Cause**: Using regular password instead of app password
- **Solution**: Use app password, not your regular Gmail password

#### Issue: "Network error"
- **Cause**: Firewall or network blocking SMTP
- **Solution**: Check firewall settings, try different network

### 6. Verification Steps

After updating your credentials:

1. **Restart your development server**:
   ```bash
   # Stop the server (Ctrl+C)
   npm run dev
   ```

2. **Test the debug endpoint**:
   - Go to: http://localhost:3001/api/debug-gmail
   - Should return success message

3. **Test SOS email**:
   - Go to: http://localhost:3001/vitals
   - Click "🧪 Test SOS Email"
   - Check your email (including spam folder)

### 7. Expected App Password Format

✅ **Correct**: `abcdefghijklmnop` (16 characters, letters and numbers)
❌ **Wrong**: `9594910933` (phone number)
❌ **Wrong**: `your-app-password` (placeholder)
❌ **Wrong**: `abcd efgh ijkl mnop` (with spaces)

### 8. Security Notes

- **Never use your regular Gmail password**
- **App passwords are specific to each application**
- **You can revoke app passwords anytime from Google Account settings**
- **Keep your app password secure and don't share it**

## Quick Test

Once you've updated your credentials, test immediately:

```bash
# In your browser, go to:
http://localhost:3001/api/debug-gmail
```

This will give you detailed feedback on what's working and what needs to be fixed.