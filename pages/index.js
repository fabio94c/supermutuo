import { useState } from 'react';

function calcolaRata(importo, tassoAnnuo, durataAnni) {
  const r = tassoAnnuo / 12;
  const n = durataAnni * 12;
  return (importo * r) / (1 - Math.pow(1 + r, -n));
}

export default function Home() {
  const [form, setForm] = useState({
    reddito1: '',
    rata1: '',
    dueRichiedenti: false,
    reddito2: '',
    rata2: '',
    eta: '',
    durata: '',
    importo: '',
    immobile: '',
    carico: '1',
    primaCasa: false,
    under36: false
  });

  const [esiti, setEsiti] = useState([]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const valuta = () => {
    const reddito1 = parseFloat(form.reddito1) || 0;
    const reddito2 = form.dueRichiedenti ? parseFloat(form.reddito2) || 0 : 0;
    const rata1 = parseFloat(form.rata1) || 0;
    const rata2 = form.dueRichiedenti ? parseFloat(form.rata2) || 0 : 0;
    const redditoTot = reddito1 + reddito2;
    const rataTot = rata1 + rata2;

    const eta = parseInt(form.eta);
    const durata = parseInt(form.durata);
    const importo = parseFloat(form.importo);
    const immobile = parseFloat(form.immobile);
    const carico = parseInt(form.carico);
    const ltv = (importo / immobile) * 100;
    const redditoDisponibile = redditoTot - rataTot;
    const etaFine = eta + durata;

    const banche = [
      {
        nome: 'ING',
        tasso: 0.039,
        maxRr: 0.55,
        soglia: [617, 902, 1158, 1402, 1629][carico - 1] || 1629,
        maxLtv: 95
      },
      {
        nome: 'CheBanca',
        tasso: 0.032,
        maxRr: 0.4,
        soglia: [734, 1035, 1304, 1572, 1816][carico - 1] || 1816,
        maxLtv: 95
      },
      {
        nome: 'MPS',
        tasso: 0.031,
        maxRr: 0.33,
        soglia: [800, 1000, 1200, 1350, 1600][carico - 1] || 1600,
        maxLtv: form.primaCasa ? 95 : 80,
        maxEta: 75
      },
      {
        nome: 'BNL',
        tasso: ltv > 80 ? (form.under36 ? 0.0325 : 0.0345) : 0.032,
        maxRr:
          ltv > 80
            ? form.dueRichiedenti
              ? 0.35
              : 0.3
            : form.dueRichiedenti
            ? 0.45
            : 0.4,
        soglia: 1000 + (carico - 1) * 250,
        maxLtv: 95
      },
      {
        nome: 'Banco di Sardegna',
        tasso: 0.034,
        maxRr: 0.4,
        soglia: [800, 1000, 1200, 1350, 1600][carico - 1] || 1600,
        maxLtv: 95
      }
    ];

    const risultati = banche.map((banca) => {
      const rata = calcolaRata(importo, banca.tasso, durata);
      const rr = rata / redditoTot;
      const sogliaOk = redditoDisponibile - rata >= banca.soglia;
      const etaOk = banca.maxEta ? etaFine <= banca.maxEta : true;
      const fattibile = rr <= banca.maxRr && ltv <= banca.maxLtv && sogliaOk && etaOk;

      return {
        banca: banca.nome,
        tasso: (banca.tasso * 100).toFixed(2) + '%',
        rata: rata.toFixed(2),
        ltv: ltv.toFixed(1) + '%',
        fattibile
      };
    });

    setEsiti(risultati);
  };

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', fontFamily: 'Arial', padding: 20 }}>
      <h1>Preventivatore Mutuo</h1>

      <label>Reddito richiedente 1</label>
      <input name="reddito1" onChange={handleChange} value={form.reddito1} />
      <label>Rata in corso 1</label>
      <input name="rata1" onChange={handleChange} value={form.rata1} />

      <label>
        <input type="checkbox" name="dueRichiedenti" checked={form.dueRichiedenti} onChange={handleChange} /> Aggiungi secondo richiedente
      </label>

      {form.dueRichiedenti && (
        <>
          <label>Reddito richiedente 2</label>
          <input name="reddito2" onChange={handleChange} value={form.reddito2} />
          <label>Rata in corso 2</label>
          <input name="rata2" onChange={handleChange} value={form.rata2} />
        </>
      )}

      <label>Età richiedente più anziano</label>
      <input name="eta" onChange={handleChange} value={form.eta} />
      <label>Durata mutuo (anni)</label>
      <input name="durata" onChange={handleChange} value={form.durata} />
      <label>Importo mutuo richiesto</label>
      <input name="importo" onChange={handleChange} value={form.importo} />
      <label>Valore immobile</label>
      <input name="immobile" onChange={handleChange} value={form.immobile} />

      <label>Persone a carico totali</label>
      <input name="carico" onChange={handleChange} value={form.carico} />

      <label>
        <input type="checkbox" name="primaCasa" checked={form.primaCasa} onChange={handleChange} /> Prima casa
      </label>
      <label>
        <input type="checkbox" name="under36" checked={form.under36} onChange={handleChange} /> Under 36
      </label>

      <button style={{ marginTop: 20 }} onClick={valuta}>Calcola</button>

      <div style={{ marginTop: 30 }}>
        {esiti.map((e, i) => (
          <div key={i} style={{ border: '1px solid #ccc', padding: 10, marginBottom: 10 }}>
            <strong>{e.banca}</strong><br />
            Tasso: {e.tasso}<br />
            Rata stimata: €{e.rata}<br />
            LTV: {e.ltv}<br />
            Esito: <span style={{ color: e.fattibile ? 'green' : 'red', fontWeight: 'bold' }}>{e.fattibile ? '✅ Fattibile' : '❌ Non Fattibile'}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
