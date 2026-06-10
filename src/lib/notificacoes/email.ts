// E-mail via Nodemailer SMTP. Se SMTP_HOST não estiver configurado, loga e retorna sem erro.

let nodemailer: any = null;

async function getTransporter() {
  if (!process.env.SMTP_HOST) return null;
  if (!nodemailer) {
    nodemailer = (await import("nodemailer")).default;
  }
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT ?? "587"),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export async function enviarEmail(para: string, assunto: string, texto: string) {
  const transporter = await getTransporter();
  if (!transporter) {
    console.log(`[notificacoes] SMTP não configurado — e-mail não enviado para ${para}`);
    return;
  }

  await transporter.sendMail({
    from: process.env.SMTP_FROM ?? "noreply@inc.com.br",
    to: para,
    subject: assunto,
    html: gerarHtmlEmail(assunto, texto),
  });
}

function gerarHtmlEmail(titulo: string, mensagem: string) {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"/></head>
<body style="font-family:Arial,sans-serif;background:#f7f7f7;padding:32px;">
  <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e5e5;">
    <div style="background:#000;padding:20px 24px;">
      <span style="color:#FF7924;font-size:18px;font-weight:700;">INC Empreendimentos</span>
      <span style="color:#fff;font-size:12px;margin-left:8px;">Novos Negócios</span>
    </div>
    <div style="padding:24px;">
      <h2 style="color:#000;font-size:16px;margin:0 0 12px;">${titulo}</h2>
      <p style="color:#606060;font-size:14px;line-height:1.6;margin:0;">${mensagem}</p>
    </div>
    <div style="padding:16px 24px;border-top:1px solid #f0f0f0;">
      <p style="color:#a0a0a0;font-size:11px;margin:0;">Sistema INC — Gestão de Novos Negócios</p>
    </div>
  </div>
</body></html>`;
}
