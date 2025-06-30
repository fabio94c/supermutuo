import { useState } from 'react';

export default function Home() {
  const [dati, setDati] = useState({
    reddito1: '',
    rata1: '',
    reddito2: '',
    rata2: '',
    eta: '',
    durata: '',
    mutuo: '',
    immobile: '',
    dueRichiedenti: false,
    carico: '1'
  });

  const [esiti, setEsiti] = useState([]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setDati({
      ...dati,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const calcola = () => {
    const r1 = parseFloat(dati.reddito1 || '0');
    const r2 = parseFloat(dati.reddito2 || '0');
    const rt1 = parseFloat(dati.rata1 || '0');
    const rt2 = parseFloat(dati.rata2 || '0');
    const redditoTot = r1 + r2;
    const rateTotali = rt1 + rt2;
    const durata = parseInt(dati.durata);
    const eta = parseInt(dati.eta);
    const etaFine = eta + durata;
    const valore = parseFloat(dati.immobile);
    const importo = parseFloat(dati.mutuo);
    const carichi = parseInt(dati.carico);
    const ltv = (importo / valore) * 100;

    const banche = [];

    const tassi = {
      ING: 0.039,
      CheBanca: 0.032,
      MPS: 0.031,
      BNL: ltv > 80 ? (eta < 36 ? 0.0325 : 0.0345) : 0.032,
      "Banco di Sardegna": 0.034
    };

    const calcolaRata = (tasso) => ((importo * tasso) / 12).toFixed(2);
    const soglie = {
      ING: [617, 902, 1158, 1402, 1629],
      CB: [734, 1035, 1304, 1572, 1816],
      MPS: [800, 1000, 1200, 1350, 1600],
      BNL: (n) => 1000 + (n - 1) * 250
    };

    const soglia = (banca) => {
      const num = carichi;
      if (banca === 'BNL') return soglie.BNL(num);
      if (banca === 'CheBanca') return soglie.CB[num - 1] || 1816;
      if (banca === 'ING') return soglie.ING[num - 1] || 1629;
      return soglie.MPS[num - 1] || 1600;
    };

    const redditoDisponibile = redditoTot - rateTotali;

    const condizioni = {
      ING: () => ltv <= 95 && importo && redditoDisponibile - calcolaRata(tassi.ING) >= soglia('ING') && (importo * tassi.ING / 12) / redditoTot <= 0.55,
      CheBanca: () => ltv <= 95 && redditoDisponibile - calcolaRata(tassi.CheBanca) >= soglia('CheBanca') && (importo * tassi.CheBanca / 12) / redditoTot <= 0.4,
      MPS: () => ltv <= 80 && etaFine <= 75 && redditoDisponibile - calcolaRata(tassi.MPS) >= soglia('MPS') && (importo * tassi.MPS / 12) / redditoTot <= 0.33,
      BNL: () => {
        let maxRr = 0.4;
        if (ltv > 80 && dati.dueRichiedenti) maxRr = 0.35;
        if (ltv > 80 && !dati.dueRichiedenti) maxRr = 0.3;
        if (ltv <= 80 && dati.dueRichiedenti) maxRr = 0.45;
        return ltv <= 95 && redditoDisponibile - calcolaRata(tassi.BNL) >= soglia('BNL') && (importo * tassi.BNL / 12) / redditoTot <= maxRr;
      },
      "Banco di Sardegna": () => ltv <= 95 && redditoDisponibile - calcolaRata(tassi["Banco di Sardegna"]) >= soglia('MPS') && (importo * tassi["Banco di Sardegna"] / 12) / redditoTot <= 0.4
    };

    for (let banca in tassi) {
      const rata = calcolaRata(tassi[banca]);
      banche.push({
        banca,
        rata,
        fattibile: condizioni[banca]()
      });
    }

    setEsiti(banche);
  };

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: 20, fontFamily: 'Arial' }}>
      <h1 style={{ fontSize: '24px', marginBottom: 10 }}>Check Mutuo – Preventivatore</h1>

      <label>Reddito Richiedente 1</label>
      <input name="reddito1" onChange={handleChange} value={dati.reddito1} />
      <label>Rata esistente 1</label>
      <input name="rata1" onChange={handleChange} value={dati.rata1} />

      <label>
        <input type="checkbox" name="dueRichiedenti" checked={dati.dueRichiedenti} onChange={handleChange} /> Aggiungi secondo richiedente
      </label>

      {dati.dueRichiedenti && (
        <>
          <label>Reddito Richiedente 2</label>
          <input name="reddito2" onChange={handleChange} value={dati.reddito2} />
          <label>Rata esistente 2</label>
          <input name="rata2" onChange={handleChange} value={dati.rata2} />
        </>
      )}

      <label>Persone a carico totali</label>
      <input name="carico" onChange={handleChange} value={dati.carico} />

      <label>Età richiedente</label>
      <input name="eta" onChange={handleChange} value={dati.eta} />
      <label>Durata mutuo (anni)</label>
      <input name="durata" onChange={handleChange} value={dati.durata} />
      <label>Importo mutuo</label>
      <input name="mutuo" onChange={handleChange} value={dati.mutuo} />
      <label>Valore immobile</label>
      <input name="immobile" onChange={handleChange} value={dati.immobile} />

      <button onClick={calcola} style={{ marginTop: 20 }}>Calcola</button>

      {esiti.length > 0 && (
        <div style={{ marginTop: 30 }}>
          {esiti.map((e, i) => (
            <div key={i} style={{ border: '1px solid #ccc', padding: 10, marginBottom: 10 }}>
              <strong>{e.banca}</strong><br />
              Rata stimata: €{e.rata}<br />
              Esito: <span style={{ color: e.fattibile ? 'green' : 'red', fontWeight: 'bold' }}>{e.fattibile ? 'Fattibile' : 'Non fattibile'}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
