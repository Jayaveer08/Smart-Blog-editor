import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")        # your Gmail address
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "") # Gmail App Password
APP_URL = os.getenv("APP_URL", "https://smart-blog-editor-eight.vercel.app")


def send_reset_email(to_email: str, reset_token: str) -> bool:
    """Send a password reset email. Returns True on success, False on failure."""
    if not SMTP_USER or not SMTP_PASSWORD:
        print(f"[Email] SMTP not configured — would send reset link for: {to_email}")
        return False

    reset_link = f"{APP_URL}/reset-password?token={reset_token}&email={to_email}"

    subject = "🔑 Reset Your Smart Blog Editor Password"

    html_body = f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body {{ font-family: Arial, sans-serif; background: #0f172a; color: #e2e8f0; margin: 0; padding: 0; }}
        .container {{ max-width: 480px; margin: 40px auto; background: #1e293b; border-radius: 16px; padding: 40px; border: 1px solid #334155; }}
        .logo {{ text-align: center; margin-bottom: 24px; }}
        .logo span {{ font-size: 28px; font-weight: 800; color: white; }}
        .logo span.accent {{ color: #818cf8; }}
        h2 {{ color: white; font-size: 22px; margin-bottom: 12px; }}
        p {{ color: #94a3b8; font-size: 14px; line-height: 1.6; }}
        .btn {{ display: block; text-align: center; margin: 28px 0; padding: 14px 28px;
                background: linear-gradient(to right, #4f46e5, #7c3aed);
                color: white; text-decoration: none; font-weight: bold;
                font-size: 15px; border-radius: 12px; }}
        .note {{ font-size: 12px; color: #64748b; margin-top: 20px; text-align: center; }}
        .divider {{ border: none; border-top: 1px solid #334155; margin: 24px 0; }}
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">
          <span>Smart Blog </span><span class="accent">Editor</span>
        </div>
        <h2>Password Reset Request</h2>
        <p>Hi there,</p>
        <p>We received a request to reset the password for your <strong>Smart Blog Editor</strong> account associated with <strong>{to_email}</strong>.</p>
        <p>Click the button below to reset your password. This link expires in <strong>1 hour</strong>.</p>
        <a href="{reset_link}" class="btn">🔑 Reset My Password</a>
        <hr class="divider">
        <p class="note">If you did not request a password reset, please ignore this email — your account is safe.</p>
        <p class="note">Or copy and paste this URL into your browser:<br>
          <span style="color:#818cf8;">{reset_link}</span>
        </p>
      </div>
    </body>
    </html>
    """

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"Smart Blog Editor <{SMTP_USER}>"
        msg["To"] = to_email

        msg.attach(MIMEText(f"Reset your password here: {reset_link}", "plain"))
        msg.attach(MIMEText(html_body, "html"))

        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.ehlo()
            server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.sendmail(SMTP_USER, to_email, msg.as_string())

        print(f"[Email] Password reset email sent to: {to_email}")
        return True

    except smtplib.SMTPAuthenticationError:
        print("[Email] SMTP Authentication failed — check SMTP_USER and SMTP_PASSWORD.")
        return False
    except smtplib.SMTPException as e:
        print(f"[Email] SMTP error: {e}")
        return False
    except Exception as e:
        print(f"[Email] General email error: {e}")
        return False
