import { BinaryLike, createHash } from 'crypto';

// Função para calcular o hash de um dado
export function hash(dado: BinaryLike): string {
    return createHash('sha256').update(dado).digest('hex');
}

// Função para verificar se o hash atende à condição de dificuldade
export function hashValidado({
    hash,
    dificuldade = 4,
    prefixo = '0'
}: {
    hash: string;
    dificuldade: number;
    prefixo: string;
}): boolean {
    const check = prefixo.repeat(dificuldade);
    return hash.startsWith(check);
}
