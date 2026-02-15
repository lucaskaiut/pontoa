import Home from '@/pages/Home';
import PrivateRoute from '@/pages/PrivateRoute';
import { PrivateGate } from '@/PrivateGate';
import { getRoute } from '@/services/route';
import { Metadata } from 'next';

type FixedRoutes = {
  component: React.ReactNode;
  isPublic: boolean;
  route: string;
};

const fixedRoutes: FixedRoutes[] = [
  {
    component: <Home />,
    isPublic: true,
    route: 'home',
  },
  {
    component: <PrivateRoute />,
    isPublic: false,
    route: 'private-route',
  },
];

export default async function CatchPage({ params }: any) {
  const { url } = await params;
  const slug = url ? url.join('/') : 'home';

  // const route = await getRoute(slug);

  // if (route.type === 'product' && !!route.product) {
  //   const { component: ProductPage, provider: Provider } = await loadThemeComponent('Product');

  //   return (
  //     <Provider>
  //       <ProductPage product={route.product} />
  //     </Provider>
  //   );
  // }

  // if (route.type === 'category' && !!route.category) {
  //   const { component: CategoryPage, provider: Provider } = await loadThemeComponent('Category');

  //   return (
  //     <Provider>
  //       <CategoryPage category={route.category} />
  //     </Provider>
  //   );
  // }

  const fixedRoute = fixedRoutes.find((fixedRoute) => fixedRoute.route == slug);

  if (!fixedRoute) {
    return <h1>{slug}</h1>;
  }

  const Page = fixedRoute.component;

  return fixedRoute.isPublic ? Page : <PrivateGate>{Page}</PrivateGate>;
}

export async function generateMetadata({ params }: any): Promise<Metadata> {
  // const { url } = await params;
  // const slug = url ? url.join('/') : 'home';

  // const route = await getRoute(slug);

  // if (route.type === 'product' && !!route.product) {
  //   const { component: ProductPage } = await loadThemeComponent('Product');

  //   if (ProductPage?.generateMetadata) {
  //     return await ProductPage.generateMetadata({ product: route.product });
  //   }

  //   return {
  //     title: `${route.product.Name}`,
  //     description: route.product.ShortDescription ?? '',
  //     openGraph: {
  //       title: `${route.product.Name}`,
  //       description: route.product.ShortDescription ?? '',
  //       siteName: 'Site Name',
  //       type: 'website',
  //     },
  //   };
  // }

  // if (route.type === 'category' && !!route.category) {
  //   const { component: CategoryPage } = await loadThemeComponent('Category');

  //   if (CategoryPage?.generateMetadata) {
  //     return await CategoryPage.generateMetadata({ category: route.category });
  //   }

  //   return {
  //     title: `${route.category.Name}`,
  //     description: route.category.Name,
  //     openGraph: {
  //       title: `${route.category.Name}`,
  //       description: route.category.Name,
  //       siteName: 'Site Name',
  //       type: 'website',
  //     },
  //   };
  // }

  return {
    title: 'Site Name',
    description: '',
  };
}
