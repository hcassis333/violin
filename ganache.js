const Ganache = require("ganache");

async function startGanache() {
  const options = {
    logging: {
      quiet: false, // Mostra logs no console para depuração
    },
    accounts: [
      {
        balance: "0x56BC75E2D63100000", // 100 ETH em hexadecimal
        secretKey: "0x1".padStart(66, "0"), // Chave privada personalizada (exemplo)
      },
    ],
  };

  const server = Ganache.server(options);

  const PORT = 8545; // Porta padrão para o Ganache
  await server.listen(PORT);

  console.log(`Blockchain local rodando em http://127.0.0.1:${PORT}`);
}

startGanache().catch((error) => {
  console.error("Erro ao iniciar o Ganache:", error);
});
