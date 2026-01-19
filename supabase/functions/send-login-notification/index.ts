import "jsr:@supabase/functions-js/edge-runtime.d.ts"

// Note: In local VS Code, you might see red lines under 'Deno' or imports. 
// This is because VS Code is defaults to Node/React settings. 
// However, this code is perfectly correct for Supabase Edge Functions which run on Deno.

const RESEND_API_KEY = (Deno as any).env.get('RESEND_API_KEY')

Deno.serve(async (req: Request) => {
  try {
    const body = await req.json()
    console.log('Received body:', body)

    const { record, old_record } = body

    // Check if it's a login event (last_sign_in_at changed)
    const isLogin = record?.last_sign_in_at && record.last_sign_in_at !== old_record?.last_sign_in_at

    if (!isLogin && old_record) {
      return new Response(JSON.stringify({ message: "Not a login event" }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      })
    }

    const userEmail = record.email
    const loginTime = new Date().toLocaleString('ar-EG', { timeZone: 'Africa/Cairo' })

    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not defined')
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Security <onboarding@resend.dev>',
        to: userEmail,
        subject: 'تنبيه أمان: تسجيل دخول جديد 🛡️',
        html: `
          <div style="direction: rtl; font-family: sans-serif; text-align: right; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #ef4444;">تنبيه أمان من منصة المهندس عبدالله</h2>
            <p>مرحباً، نود إخطارك بأنه تمت عملية تسجيل دخول جديدة لحسابك.</p>
            <p style="background: #f4f4f4; padding: 10px; border-radius: 5px;">
              <b>وقت الدخول:</b> ${loginTime}
            </p>
            <p>إذا كنت أنت من قام بهذا، يمكنك تجاهل هذه الرسالة. أما إذا لم تكن أنت، فيرجى تغيير كلمة المرور فوراً.</p>
            <br>
            <hr>
            <p style="font-size: 12px; color: #777;">هذا إيميل تلقائي من موقع eng-abdullah.work</p>
          </div>
        `
      }),
    })

    const data = await res.json()
    console.log('Resend response:', data)

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    })
  } catch (err: any) {
    const errorMessage = err instanceof Error ? err.message : String(err)
    console.error('Error:', errorMessage)
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    })
  }
})