import { createHash } from 'crypto';

// Definindo a interface do Bloco
export interface Bloco {
    header: {
        nonce: number;
        hashBloco: string;
    };
    payload: {
        sequencia: number;
        timestamp: number;
        dados: any;
        hashAnterior: string;
    };
}

// Definindo a classe Blockchain
export class Blockchain {
    private #chain: Bloco[] = [];
    private prefixoPow = '0';

    constructor(private readonly dificuldade: number = 4) {
        this.#chain.push(this.criarBlocoGenesis());
    }

    // Getter para acessar a cadeia
    public get chain(): Bloco[] {
        return this.#chain;
    }

    // Função para criar o bloco gênesis
    private criarBlocoGenesis(): Bloco {
        const payload = {
            sequencia: 0,
            timestamp: +new Date(),
            dados: 'Bloco inicial',
            hashAnterior: ''
        };

        return {
            header: {
                nonce: 0,
                hashBloco: createHash('sha256').update(JSON.stringify(payload)).digest('hex')
            },
            payload
        };
    }

    // Função para pegar o último bloco
    private get ultimoBloco(): Bloco {
        return this.#chain.at(-1) as Bloco;
    }

    // Função para gerar o hash do último bloco
    private hashUltimoBloco(): string {
        return this.ultimoBloco.header.hashBloco;
    }

    // Função para criar um novo bloco
    criarBloco(dados: any): Bloco['payload'] {
        const novoBloco = {
            sequencia: this.ultimoBloco.payload.sequencia + 1,
            timestamp: +new Date(),
            dados: dados,
            hashAnterior: this.hashUltimoBloco()
        };

        console.log(`Bloco #${novoBloco.sequencia} criado: ${JSON.stringify(novoBloco)}`);
        return novoBloco;
    }

    // Função para minerar o bloco
    minerarBloco(bloco: Bloco['payload']): { blocoMinerado: Bloco } {
        let nonce = 0;
        const inicio = +new Date();
        while (true) {
            const hashBloco = createHash('sha256').update(JSON.stringify(bloco)).digest('hex');
            const hashPow = createHash('sha256').update(hashBloco + nonce).digest('hex');

            if (this.hashValidado({ hash: hashPow, dificuldade: this.dificuldade, prefixo: this.prefixoPow })) {
                const final = +new Date();
                const hashReduzido = hashBloco.slice(0, 12);
                const tempoMineracao = (final - inicio) / 1000;

                console.log(`Bloco #${bloco.sequencia} minerado em ${tempoMineracao}s. Hash ${hashReduzido} (${nonce} tentativas)`);

                return {
                    blocoMinerado: {
                        payload: { ...bloco },
                        header: {
                            nonce,
                            hashBloco
                        }
                    }
                };
            }

            nonce++;
        }
    }

    // Função para verificar se o bloco é válido
    verificarBloco(bloco: Bloco): boolean {
        if (bloco.payload.hashAnterior !== this.hashUltimoBloco()) {
            console.error(`Bloco #${bloco.payload.sequencia} inválido: hashAnterior é ${this.hashUltimoBloco()} e não ${bloco.payload.hashAnterior}`);
            return false;
        }

        const hashTeste = createHash('sha256').update(JSON.stringify(bloco.payload)).digest('hex');
        if (!this.hashValidado({ hash: hashTeste, dificuldade: this.dificuldade, prefixo: this.prefixoPow })) {
            console.error(`Bloco #${bloco.payload.sequencia} inválido: Nonce ${bloco.header.nonce} não pode ser verificado`);
            return false;
        }

        return true;
    }

    // Função para validar o hash
    private hashValidado({ hash, dificuldade, prefixo }: { hash: string; dificuldade: number; prefixo: string }): boolean {
        return hash.startsWith(prefixo.repeat(dificuldade));
    }

    // Função para enviar o bloco
    enviarBloco(bloco: Bloco): Bloco[] {
        if (this.verificarBloco(bloco)) {
            this.#chain.push(bloco);
            console.log(`Bloco #${bloco.payload.sequencia} foi adicionado à blockchain`);
            console.log(`Blockchain: ${JSON.stringify(this.#chain, null, 2)}`);
        }
        return this.#chain;
    }
}

// ---- Código principal ----

// Pega o valor de dificuldade dos argumentos de linha de comando ou usa 4 como valor padrão
const dificuldade = Number(process.argv[2]) || 4;

// Cria a instância da blockchain com a dificuldade especificada
const blockchain = new Blockchain(dificuldade);

// Pega o número de blocos a serem criados dos argumentos de linha de comando ou usa 10 como valor padrão
const numBlocos = Number(process.argv[3]) || 10;

// Inicializa a cadeia
let chain = blockchain.chain; // Agora usando o getter 'chain' para acessar os blocos

// Cria os blocos, minera e envia
for (let i = 1; i <= numBlocos; i++) {
    // Cria um novo bloco
    const bloco = blockchain.criarBloco(`Bloco #${i}`);
    
    // Minera o bloco
    const mineInfo = blockchain.minerarBloco(bloco);
    
    // Envia o bloco para a blockchain
    chain = blockchain.enviarBloco(mineInfo.blocoMinerado);
}

// Exibe a blockchain
console.log('--BLOCKCHAIN --');
console.log(JSON.stringify(chain, null, 2));
