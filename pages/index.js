import { useState } from 'react';

export default function Home() {
  const [dati, setDati] = useState({
    reddito: '',
    rataEsistente: '',
    eta: '',
    durata: '',
    mutuo: '',
    immobile: '',
    richiedenti: 1
  });

  const [esiti, setEsiti] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDati({ ...dati, [name]: value });
  };

  const calcolaBanche = () => {
    const redditoNetto = parseFloat(dati.reddito) - parseFloat(dati.rataEsistente || 0);
    const rataSimulata = ((parseFloat(dati.mutuo) * 0.032) / 12);
    const ltv = (parseFloat(dati.mutuo) / parseFloat(dati.immobile)) * 100;
    const durataAnni = parseInt(dati.durata);
    const eta = parseInt(dati.eta);
    const richiedenti = parseInt(dati.richiedenti);
    const etaFineMutuo = eta + durataAnni;

    const banche = [];

    const sogliaSussistenzaING = [617, 902, 1158, 1402, 1629][richiedenti - 1] || 1629;
    const redditoResiduoING = redditoNetto - rataSimulata;
    const fattibileING = ltv <= 95 && rataSimulata / redditoNetto <= 0.55 && redditoResiduoING >= sogliaSussistenzaING;
    banche.push({ nome: "ING", fattibile: fattibileING, rata: rataSimulata.toFixed(2), ltv: ltv.toFixed(2) });

    const sogliaSussistenzaCB = [734, 1035, 1304, 1572, 1816][richiedenti - 1] || 1816;
    const redditoResiduoCB = redditoNetto - rataSimulata;
    const fattibileCB = ltv <= 95 && rataSimulata / redditoNetto <= 0.4 && redditoResiduoCB >= sogliaSussistenzaCB;
    banche.push({ nome: "CheBanca", fattibile: fattibileCB, rata: rataSimulata.toFixed(2), ltv: ltv.toFixed(2) });

    const sogliaSussistenzaMPS = [800, 1000, 1200, 1350, 1600][richiedenti - 1] || 1600;
    const fattibileMPS = ltv <= 80 && rataSimulata / redditoNetto <= 0.33 && etaFineMutuo <= 75 && (redditoNetto - rataSimulata >= sogliaSussistenzaMPS);
    banche.push({ nome: "MPS", fattibile: fattibileMPS, rata: rataSimulata.toFixed(2), ltv: ltv.toFixed(2) });

    let sogliaBNL = 1000 + (richiedenti - 1) * 250;
    let maxRr = 0.4;
    if (ltv > 80 && richiedenti === 1) maxRr = 0.3;
    if (ltv > 80 && richiedenti === 2) maxRr = 0.35;
    if (ltv <= 80 && richiedenti === 2) maxRr = 0.45;
    const fattibileBNL = ltv <= 95 && rataSimulata / redditoNetto <= maxRr && (redditoNetto - rataSimulata >= sogliaBNL);
    banche.push({ nome: "BNL", fattibile: fattibileBNL, rata: rataSimulata.toFixed(2), ltv: ltv.toFixed(2) });

    const sogliaSussistenzaSardegna = sogliaSussistenzaMPS;
    const fattibileSardegna = ltv <= 95 && rataSimulata / redditoNetto <= 0.4 && (redditoNetto - rataSimulata >= sogliaSussistenzaSardegna);
    banche.push({ nome: "Banco di Sardegna", fattibile: fattibileSardegna, rata: rataSimulata.toFixed(2), ltv: ltv.toFixed(2) });

    setEsiti(banche);
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h1>Check Mutuo – Preventivatore</h1>

      <input name="reddito" placeholder="Reddito mensile" onChange={handleChange} />
      <input name="rataEsistente" placeholder="Rata esistente" onChange={handleChange} />
      <input name="eta" placeholder="Età richiedente" onChange={handleChange} />
      <input name="durata" placeholder="Durata (anni)" onChange={handleChange} />
      <input name="mutuo" placeholder="Importo mutuo" onChange={handleChange} />
      <input name="immobile" placeholder="Valore immobile" onChange={handleChange} />
      <input name="richiedenti" placeholder="Numero richiedenti" onChange={handleChange} />

      <button onClick={calcolaBanche}>Calcola</button>

      {esiti.map((b, i) => (
        <div key={i} style={{ marginTop: '10px', border: '1px solid #ccc', padding: '10px' }}>
          <strong>{b.nome}</strong><br />
          Rata: €{b.rata} – LTV: {b.ltv}%<br />
          Esito: {b.fattibile ? '✅ Fattibile' : '❌ Non Fattibile'}
        </div>
      ))}
    </div>
  );
}
