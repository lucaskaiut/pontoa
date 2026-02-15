import { loadThemeComponent } from '@/lib/theme-loader';

export default async function Home() {
  const { component: Home, provider: Provider } = await loadThemeComponent('Home');

  return (
    <Provider>
      <Home />
    </Provider>
  );
}
