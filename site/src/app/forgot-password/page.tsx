import { loadThemeComponent } from '@/lib/theme-loader';

export default async function ForgotPassword() {
  const { component: ForgotPassword, provider: Provider } = await loadThemeComponent(
    'ForgotPassword'
  );

  const handleForgotPassword = async (data: FormData) => {
    'use server';
  };

  return (
    <Provider>
      <ForgotPassword onSubmit={handleForgotPassword} />
    </Provider>
  );
}
