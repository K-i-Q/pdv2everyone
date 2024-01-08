import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const domain = process.env.NEXT_PUBLIC_APP_URL;
export const sendTwoFactorTokenEmail = async (email: string, token: string) => {
  await resend.emails.send({
    from: "onboarding@resend.dev",
    to: email,
    subject: "Segundo fator de autenticação",
    html: `<p>Seu código de autenticação é: ${token}</p>`,
  });
};
export const sendPasswordResetTokenEmail = async (
  email: string,
  token: string
) => {
  const resetLink = `${domain}/auth/new-password?token=${token}`;

  await resend.emails.send({
    from: "onboarding@resend.dev",
    to: email,
    subject: "Email para resetar senha",
    html: `<p>Clique <a href="${resetLink}"> aqui</a> para resetar sua senha.</p>`,
  });
};
export const sendVerificationEmail = async (email: string, token: string) => {
  const confirmLink = `${domain}/auth/new-verification?token=${token}`;

  await resend.emails.send({
    from: "onboarding@resend.dev",
    to: email,
    subject: "Confirme seu email",
    html: `<p>Clique<a href="${confirmLink}"> aqui</a> para confirmar seu email. </p>`,
  });
};
