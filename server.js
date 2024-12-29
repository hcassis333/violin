const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { ethers } = require("ethers");

// Configuração do servidor
const app = express();
const port = 3000;

// Configuração do nó local
const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545");

// Chaves do contrato
const contractAddress = "SEU_CONTRATO_ENDERECO";
const contractABI = [
  // ABI mínima para interagir com as funções do contrato
  "function mint(address to, uint256 amount) public",
  "function balanceOf(address owner) public view returns (uint256)",
];

// Conexão com o contrato
const privateKey = "CHAVE_PRIVADA_DO_OWNER";
const wallet = new ethers.Wallet(privateKey, provider);
const contract = new ethers.Contract(contractAddress, contractABI, wallet);

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Endpoint: Minerar tokens
app.post("/mine", async (req, res) => {
  const { walletAddress, tokens } = req.body;

  try {
    const tx = await contract.mint(walletAddress, ethers.utils.parseEther(tokens.toString()));
    await tx.wait();
    res.status(200).json({ message: "Tokens minerados com sucesso!", txHash: tx.hash });
  } catch (err) {
    console.error("Erro ao minerar tokens:", err);
    res.status(500).json({ error: "Erro ao minerar tokens" });
  }
});

// Endpoint: Consultar saldo
app.get("/balance/:walletAddress", async (req, res) => {
  const walletAddress = req.params.walletAddress;

  try {
    const balance = await contract.balanceOf(walletAddress);
    res.status(200).json({ balance: ethers.utils.formatEther(balance) });
  } catch (err) {
    console.error("Erro ao consultar saldo:", err);
    res.status(500).json({ error: "Erro ao consultar saldo" });
  }
});

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
