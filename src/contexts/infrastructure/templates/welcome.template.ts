export function welcomeTemplate(params: { userName: string; loginUrl: string }): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to TaskFlow</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:40px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background-color:#18181b;padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:-0.5px;">TaskFlow</h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <h2 style="margin:0 0 16px;color:#18181b;font-size:20px;font-weight:600;">Welcome aboard, ${params.userName}!</h2>
              <p style="margin:0 0 24px;color:#52525b;font-size:15px;line-height:24px;">
                Your TaskFlow account has been created successfully. You're all set to start organizing your work, collaborating with your team, and getting things done.
              </p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
                <tr>
                  <td style="padding:16px 20px;background-color:#f4f4f5;border-radius:8px;">
                    <p style="margin:0 0 8px;color:#18181b;font-size:14px;font-weight:600;">Here's how to get started:</p>
                    <p style="margin:0;color:#52525b;font-size:14px;line-height:22px;">
                      1. Create your first workspace<br>
                      2. Add tasks and set priorities<br>
                      3. Invite your team as collaborators
                    </p>
                  </td>
                </tr>
              </table>
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 24px;">
                <tr>
                  <td style="background-color:#18181b;border-radius:8px;">
                    <a href="${params.loginUrl}" target="_blank" style="display:inline-block;padding:12px 32px;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;">
                      Go to TaskFlow
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:0;color:#a1a1aa;font-size:13px;line-height:20px;">
                If you have any questions, just reply to this email. We're happy to help.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;border-top:1px solid #e4e4e7;text-align:center;">
              <p style="margin:0;color:#a1a1aa;font-size:12px;">
                &copy; ${new Date().getFullYear()} TaskFlow by Escalia &mdash; escalia.tech
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
