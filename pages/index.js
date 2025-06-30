import { useState } from 'react';
import Head from 'next/head';

function calcolaRata(importo, tasso, durata) {
  const r = tasso / 12;
  const n = durata * 12;
  return (importo * r) / (1 - Math.pow(1 + r, -n));
}

export default function Home() {
  const [form, setForm] = useState({
    reddito1: '', rata1: '',
    due: false, reddito2: '', rata2: '',
    eta: '', durata: '', importo: '', immobile: '',
    carico: '1', primaCasa: false, under36: false
  });

  const [esiti, setEsiti] = useState([]);

  const cambia = (e) => {
    const { name, value, checked, type } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const calcola = () => {
    const r1 = parseFloat(form.reddito1) || 0;
    const r2 = form.due ? parseFloat(form.reddito2) || 0 : 0;
    const red = r1 + r2;
    const ra1 = parseFloat(form.rata1) || 0;
    const ra2 = form.due ? parseFloat(form.rata2) || 0 : 0;
    const ratetot = ra1 + ra2;
    const eta = parseInt(form.eta);
    const fine = eta + parseInt(form.durata);
    const carico = parseInt(form.carico);
    const immobile = parseFloat(form.immobile);
    const mutuo = parseFloat(form.importo);
    const ltv = (mutuo / immobile) * 100;
    const redDisp = red - ratetot;

    const banche = [
      {
        nome: 'ING', tasso: 0.039, maxRr: 0.55, maxLtv: 95,
        soglia: [617, 902, 1158, 1402, 1629][carico - 1] || 1629
      },
      {
        nome: 'CheBanca', tasso: 0.032, maxRr: 0.4, maxLtv: 95,
        soglia: [734, 1035, 1304, 1572, 1816][carico - 1] || 1816
      },
      {
        nome: 'MPS', tasso: 0.031, maxRr: 0.33, maxLtv: form.primaCasa ? 95 : 80, maxEta: 75,
        soglia: [800, 1000, 1200, 1350, 1600][carico - 1] || 1600
      },
      {
        nome: 'BNL',
        tasso: ltv > 80 ? (form.under36 ? 0.0325 : 0.0345) : 0.032,
        maxRr: ltv > 80 ? (form.due ? 0.35 : 0.3) : (form.due ? 0.45 : 0.4),
        maxLtv: 95,
        soglia: 1000 + (carico - 1) * 250
      },
      {
        nome: 'Banco di Sardegna', tasso: 0.034, maxRr: 0.4, maxLtv: 95,
        soglia: [800, 1000, 1200, 1350, 1600][carico - 1] || 1600
      }
    ];

    const risultati = banche.map(b => {
      const rata = calcolaRata(mutuo, b.tasso, parseInt(form.durata));
      const rr = rata / red;
      const esito = rr <= b.maxRr && ltv <= b.maxLtv && (redDisp - rata) >= b.soglia && (!b.maxEta || fine <= b.maxEta);
      return {
        banca: b.nome,
        tasso: (b.tasso * 100).toFixed(2) + '%',
        rata: rata.toFixed(2),
        ltv: ltv.toFixed(1) + '%',
        fattibile: esito
      };
    });
    setEsiti(risultati);
  };

  return (
    <>
      <Head>
        <title>SuperMutuo - Simulazione Mutuo</title>
      </Head>
      <main style={{ maxWidth: 720, margin: '0 auto', padding: '2rem', fontFamily: 'sans-serif' }}>
        <h1 style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>💼 Simulatore Mutuo Professionale</h1>

        <label>Reddito mensile richiedente 1</label>
        <input name="reddito1" value={form.reddito1} onChange={cambia} />
        <label>Rata in corso richiedente 1</label>
        <input name="rata1" value={form.rata1} onChange={cambia} />

        <label>
          <input type="checkbox" name="due" checked={form.due} onChange={cambia} /> Aggiungi secondo richiedente
        </label>

        {form.due && (
          <>
            <label>Reddito mensile richiedente 2</label>
            <input name="reddito2" value={form.reddito2} onChange={cambia} />
            <label>Rata in corso richiedente 2</label>
            <input name="rata2" value={form.rata2} onChange={cambia} />
          </>
        )}

        <label>Età richiedente più anziano</label>
        <input name="eta" value={form.eta} onChange={cambia} />
        <label>Durata mutuo (anni)</label>
        <input name="durata" value={form.durata} onChange={cambia} />
        <label>Importo mutuo richiesto</label>
        <input name="importo" value={form.importo} onChange={cambia} />
        <label>Valore immobile</label>
        <input name="immobile" value={form.immobile} onChange={cambia} />

        <label>Persone a carico</label>
        <input name="carico" value={form.carico} onChange={cambia} />

        <label><input type="checkbox" name="primaCasa" checked={form.primaCasa} onChange={cambia} /> Prima casa</label>
        <label><input type="checkbox" name="under36" checked={form.under36} onChange={cambia} /> Under 36</label>

        <button onClick={calcola} style={{ marginTop: 20, padding: '10px 20px' }}>Calcola</button>

        {esiti.length > 0 && (
          <div style={{ marginTop: 30 }}>
            <h2>Risultati</h2>
            {esiti.map((e, i) => (
              <div key={i} style={{ border: '1px solid #ccc', borderLeft: `5px solid ${e.fattibile ? 'green' : 'red'}`, padding: 10, marginBottom: 10 }}>
                <strong>{e.banca}</strong><br />
                Tasso: {e.tasso}<br />
                Rata: €{e.rata}<br />
                LTV: {e.ltv}<br />
                Esito: <span style={{ fontWeight: 'bold', color: e.fattibile ? 'green' : 'red' }}>{e.fattibile ? 'Fattibile' : 'Non Fattibile'}</span>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
