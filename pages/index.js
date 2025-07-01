import { useState } from 'react';
import Head from 'next/head';
import emailjs from '@emailjs/browser';

function calcolaRata(importo, tasso, durata) {
  const r = tasso / 12;
  const n = durata * 12;
  return (importo * r) / (1 - Math.pow(1 + r, -n));
}

export default function Home() {
  const [form, setForm] = useState({
    nome: '',
    reddito1: '', rata1: '',
    due: false, reddito2: '', rata2: '',
    eta: '', durata: '', importo: '', immobile: '',
    carico: '1', primaCasa: false, under36: false
  });

  const [esiti, setEsiti] = useState([]);
  const [emailInviata, setEmailInviata] = useState(false);

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
        fattibile: esito ? '✅ Fattibile' : '❌ Non Fattibile'
      };
    });
    setEsiti(risultati);

    const contenuto = {
      ...form,
      risultato: risultati.map(r => `${r.banca}: ${r.fattibile}, Rata: €${r.rata}, Tasso: ${r.tasso}, LTV: ${r.ltv}`).join('\n')
    };

    emailjs.send('service_ds8s53n', 'template_ar5ij3f', contenuto, '07kHc8vY52WJr-iQx')
      .then(() => setEmailInviata(true))
      .catch(() => alert("Errore nell'invio email"));
  };

  return (
    <>
      <Head>
        <title>Simulatore Mutuo</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <main style={{ maxWidth: 600, margin: '0 auto', padding: '1rem', fontFamily: 'Arial, sans-serif' }}>
        <h1 style={{ color: '#0070f3' }}>💼 Simulatore Mutuo</h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <label>Nome e Cognome</label>
          <input name="nome" value={form.nome} onChange={cambia} />
          <label>Reddito 1</label>
          <input name="reddito1" value={form.reddito1} onChange={cambia} />
          <label>Rata 1</label>
          <input name="rata1" value={form.rata1} onChange={cambia} />
          <label><input type="checkbox" name="due" checked={form.due} onChange={cambia} /> Aggiungi secondo richiedente</label>
          {form.due && <>
            <label>Reddito 2</label>
            <input name="reddito2" value={form.reddito2} onChange={cambia} />
            <label>Rata 2</label>
            <input name="rata2" value={form.rata2} onChange={cambia} />
          </>}
          <label>Età</label>
          <input name="eta" value={form.eta} onChange={cambia} />
          <label>Durata (anni)</label>
          <input name="durata" value={form.durata} onChange={cambia} />
          <label>Importo mutuo</label>
          <input name="importo" value={form.importo} onChange={cambia} />
          <label>Valore immobile</label>
          <input name="immobile" value={form.immobile} onChange={cambia} />
          <label>Persone a carico</label>
          <input name="carico" value={form.carico} onChange={cambia} />
          <label><input type="checkbox" name="primaCasa" checked={form.primaCasa} onChange={cambia} /> Prima casa</label>
          <label><input type="checkbox" name="under36" checked={form.under36} onChange={cambia} /> Under 36</label>
          <button onClick={calcola} style={{ backgroundColor: '#0070f3', color: 'white', padding: '10px', borderRadius: '5px', border: 'none', marginTop: '20px' }}>Calcola e Invia</button>
        </div>

        {emailInviata && <p style={{ color: 'green', marginTop: '20px' }}>📧 Email inviata con successo!</p>}

        {esiti.length > 0 && (
          <div style={{ marginTop: 30 }}>
            <h2 style={{ color: '#0070f3' }}>Risultati</h2>
            {esiti.map((e, i) => (
              <div key={i} style={{ backgroundColor: 'white', borderLeft: `5px solid ${e.fattibile === '✅ Fattibile' ? 'green' : 'red'}`, padding: 10, marginBottom: 10, borderRadius: '5px' }}>
                <strong>{e.banca}</strong><br />
                <span>Tasso: {e.tasso}</span><br />
                <span>Rata: €{e.rata}</span><br />
                <span>LTV: {e.ltv}</span><br />
                <span>Esito: <strong>{e.fattibile}</strong></span>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
{
  "name": "check-mutuo",
  "version": "1.0.0",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "@emailjs/browser": "^3.11.0",
    "next": "13.4.19",
    "react": "18.2.0",
    "react-dom": "18.2.0"
  }
}
