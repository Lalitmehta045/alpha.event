export function verifyEmailTemplate(otp: string) {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333333; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 6px;">
      
      <div style="text-align: center; border-bottom: 1px solid #eeeeee;">
        <h2 style="color: #4f46e5; margin: 0; font-size: 24px;">Alpha Art & Events</h2>
      </div>

      <div style="padding: 5px 0; text-align: center;">
        <p style="font-size: 16px; margin-bottom: 15px;">Please use the following code to complete your verification:</p>
        
        <div style="background-color: #f5f5f7; border: 1px solid #e0e0e0; padding: 5px 20px; display: inline-block; border-radius: 4px; margin: 10px 0;">
          <h1 style="color: #4f46e5; margin: 0; font-size: 36px; letter-spacing: 5px;">${otp}</h1>
        </div>
        
        <p style="font-size: 14px; color: #cc0000; margin-top: 10px; font-weight: bold;">
          This code is valid for 5 minutes.
        </p>
      </div>

      <div style="padding-top: 10px; border-top: 1px solid #eeeeee; font-size: 12px; color: #777777; text-align: center;">
        <p style="margin: 0;">If you did not request this code, you can safely ignore this email.</p>
        <p style="margin: 5px 0 0;">Do not share this code with anyone.</p>
      </div>

    </div>
  `;
}
