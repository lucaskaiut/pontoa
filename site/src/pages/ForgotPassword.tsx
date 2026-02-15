import { ForgotPasswordPageProps } from '@/types/theme-pages';
import { Button, Input, InputGroup, Link, Stack } from '@chakra-ui/react';
import { LuMail } from 'react-icons/lu';

export default async function ForgotPassword({ onSubmit }: ForgotPasswordPageProps) {
  return (
    <Stack w="100vw" h="100vh" justify="center" align="center" bg="#f6fbff">
      <Stack
        w={['90%', '400px']}
        h="auto"
        minH="400px"
        p={6}
        bg="white"
        borderRadius={10}
        boxShadow="lg"
      >
        <p>Esqueceu sua senha?</p>
        <form action={onSubmit}>
          <Stack>
            <InputGroup startElement={<LuMail />}>
              <Input placeholder="E-mail" name="email" />
            </InputGroup>
            <Button>Enviar</Button>
            <Link href="/sign-in">Voltar</Link>
          </Stack>
        </form>
      </Stack>
    </Stack>
  );
}
