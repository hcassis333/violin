let web3; // Instância do Web3
let userAddress = null; // Endereço da carteira conectada
let mining = false; // Estado de mineração
let minedTokens = 0; // Contador de tokens minerados

// Conectar a carteira
document.getElementById("connect-wallet").addEventListener("click", async () => {
  if (window.ethereum) {
    web3 = new Web3(window.ethereum); // Inicializa o Web3
    try {
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      userAddress = accounts[0]; // Obtém o endereço da carteira
      document.getElementById("wallet-address").textContent = `Carteira: ${userAddress}`;
      document.getElementById("start-mining").disabled = false; // Habilita o botão de mineração
      document.getElementById("withdraw-tokens").disabled = false; // Habilita o botão de saque
      console.log("Carteira conectada:", userAddress);
    } catch (err) {
      console.error("Erro ao conectar carteira:", err);
    }
  } else {
    alert("MetaMask não detectado!");
  }
});

// Iniciar ou parar a mineração
document.getElementById("start-mining").addEventListener("click", () => {
  mining = !mining; // Alterna o estado de mineração
  document.getElementById("start-mining").textContent = mining ? "Parar Mineração" : "Iniciar Mineração";

  if (mining) {
    console.log("Mineração iniciada...");
    const miningInterval = setInterval(() => {
      if (!mining) {
        clearInterval(miningInterval); // Interrompe o intervalo quando a mineração é parada
        console.log("Mineração parada.");
        return;
      }
      minedTokens += 0.01; // Incrementa os tokens minerados
      document.getElementById("mined-tokens").textContent = `Tokens Minerados: ${minedTokens.toFixed(2)}`;
      console.log("Tokens minerados:", minedTokens);
    }, 1000); // Mineração a cada 1 segundo
  }
});

// Sacar tokens minerados
document.getElementById("withdraw-tokens").addEventListener("click", async () => {
  if (minedTokens > 0) {
    try {
      const response = await fetch("http://localhost:3000/mine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress: userAddress, tokens: minedTokens }),
      });

      if (response.ok) {
        alert(`Tokens transferidos para sua conta com sucesso!`);
        minedTokens = 0; // Zera o contador de tokens minerados
        document.getElementById("mined-tokens").textContent = "Tokens Minerados: 0";
        console.log("Tokens transferidos com sucesso.");
      } else {
        const error = await response.json();
        console.error("Erro na transferência:", error);
        alert("Erro ao transferir tokens. Consulte o console para mais detalhes.");
      }
    } catch (err) {
      console.error("Erro ao sacar tokens:", err);
    }
  } else {
    alert("Sem tokens para sacar.");
  }
});
