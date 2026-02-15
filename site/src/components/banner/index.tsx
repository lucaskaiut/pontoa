import { Container } from '@/components/Container';
import { Search } from './search';
import { Card } from './card';

export function Banner() {
  return (
    <div className="bg-primary w-full justify-center pt-6 pb-8 md:pt-10 md:pb-10 min-h-[280px] md:min-h-[320px] text-white">
      <Container className="flex flex-col items-center">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center px-2">
          Tudo para facilitar sua vida
        </h1>
        <span className="text-sm sm:text-base md:text-lg font-thin text-center mt-1 px-2">
          Encontre tudo o que você precisa em um só lugar
        </span>
        <div className="w-full mt-4 px-0 sm:px-2">
          <Search />
        </div>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-2 w-full mt-4">
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
