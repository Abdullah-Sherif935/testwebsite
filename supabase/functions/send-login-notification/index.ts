import "jsr:@supabase/functions-js/edge-runtime.d.ts"

const RESEND_API_KEY = (Deno as any).env.get('RESEND_API_KEY')

Deno.serve(async (req: Request) => {
  try {
    const body = await req.json()
    console.log('Webhook received:', JSON.stringify(body, null, 2))

    const { record, old_record, type } = body
    const userEmail = record?.email
    const fullName = record?.raw_user_meta_data?.full_name || 'بطلنا الجديد'

    if (!userEmail) {
      return new Response(JSON.stringify({ message: "No email found in record" }), { status: 400 })
    }

    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not defined in Supabase Secrets')
    }

    let subject = ''
    let htmlContent = ''
    let emailType = ''

    // 1. Detection Logic
    const isSignup = type === 'INSERT' || (!old_record && record)
    const isLogin = record?.last_sign_in_at && record.last_sign_in_at !== old_record?.last_sign_in_at

    if (isSignup) {
      emailType = 'WELCOME'
      subject = `أهلاً بك يا ${fullName} في منصة المهندس عبدالله شريف! 🚀`
      htmlContent = `
        <div style="direction: rtl; font-family: sans-serif; text-align: right; padding: 30px; background-color: #f9fafb;">
          <div style="background: white; padding: 40px; border-radius: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); max-width: 600px; margin: 0 auto;">
            <h1 style="color: #1a56db; font-size: 24px;">أهلاً بك في عائلتنا التقنية! 👋</h1>
            <p style="font-size: 16px; color: #374151; line-height: 1.6;">
              مرحباً يا <b>${fullName}</b>، نحن سعداء جداً بانضمامك إلينا.
            </p>
            <p style="font-size: 16px; color: #374151; line-height: 1.6;">
              من الآن فصاعداً، يمكنك استكشاف المقالات العلمية، تحميل الأكواد البرمجية، ومتابعة أحدث المشاريع الهندسية.
            </p>
            <div style="text-align: center; margin-top: 30px;">
              <a href="https://eng-abdullah.work" style="background: #1a56db; color: white; padding: 12px 30px; text-decoration: none; border-radius: 10px; font-weight: bold;">اكتشف الموقع الآن</a>
            </div>
            <hr style="margin: 30px 0; border: 0; border-top: 1px solid #e5e7eb;">
            <p style="font-size: 12px; color: #6b7280; text-align: center;">هذا البريد مرسل إليك لأنك قمت بإنشاء حساب في موقع المهندس عبدالله شريف.</p>
          </div>
        </div>
      `
    } else if (isLogin) {
      emailType = 'SECURITY_ALERT'
      const loginTime = new Date().toLocaleString('ar-EG', { timeZone: 'Africa/Cairo' })
      subject = 'تنبيه أمان: تسجيل دخول جديد 🛡️'
      htmlContent = `
        <div style="direction: rtl; font-family: sans-serif; text-align: right; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #ef4444;">تنبيه أمان من منصة المهندس عبدالله</h2>
          <p>مرحباً <b>${fullName}</b>، نود إخطارك بأنه تمت عملية تسجيل دخول جديدة لحسابك.</p>
          <p style="background: #f4f4f4; padding: 15px; border-radius: 8px;">
            <b>وقت الدخول:</b> ${loginTime}
          </p>
          <p style="color: #6b7280; font-size: 14px;">إذا كنت أنت من قام بهذا، يمكنك تجاهل هذه الرسالة. أما إذا لم تكن أنت، فيرجى تغيير كلمة المرور فوراً.</p>
          <br>
          <p style="font-size: 12px; color: #9ca3af; text-align: center;">إيميل تلقائي لحماية حسابك.</p>
        </div>
      `
    } else {
      console.log('Event ignored: Not a signup or login event.')
      return new Response(JSON.stringify({ message: "Event ignored" }), { status: 200 })
    }

    // 2. Send via Resend
    console.log(`Sending ${emailType} email to ${userEmail}...`)
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Eng. Abdullah <onboarding@resend.dev>',
        to: userEmail,
        subject: subject,
        html: htmlContent
      }),
    })

    const data = await res.json()
    console.log('Resend Response:', data)

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    })

  } catch (err: any) {
    console.error('Core Error:', err.message)
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    })
  }
})