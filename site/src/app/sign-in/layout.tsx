import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function SignInLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const authToken = (await cookies()).get('authToken');

  if (authToken) {
    redirect('/');
  }

  return <>{children}</>;
}
