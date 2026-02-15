import { Container } from '@/components/Container';
import { Search } from './search';
import { Card } from './card';

export function Banner() {
  return (
    <div className="bg-primary text-slate-900 w-full justify-center pt-10 h-100 text-white">
      <Container className="flex flex-col items-center">
        <h1 className="text-4xl font-bold">Tudo para facilitar sua vida</h1>
        <span className="text-lg font-thin">
          Encontre tudo o que você precisa em um só lugar
        </span>
        <div className="w-full mt-4">
          <Search />
        </div>
        <div className="flex gap-2 w-full mt-4">
          <Card
            title="Produtos"
            description="Encontre produtos para facilitar seu dia a dia"
            href="/produtos"
            className="bg-secondary text-primary"
          />
          <Card
            title="Serviços"
            description="Encontre profissionais que vão tornar sua vida mais fácil"
            href="/servicos"
            className="bg-secondary text-primary"
          />
        </div>
      </Container>
    </div>
  );
}
