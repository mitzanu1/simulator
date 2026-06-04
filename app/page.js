"use client"; // Obligatoriu în Next.js pentru interactivitate (state, click-uri)
import { useState } from "react";
import { simuleazaLupta } from "./utils";

export default function Home() {
  // Profilurile de bază actualizate cu cele 2 subclase pentru Mount
  const profileUnitati = {
    melee: {
      clasa: "melee",
      hp: 160,
      damage: 25,
      defence: 20,
      accuracy: 15,
      agility: 10,
      speed: 10,
    },
    range: {
      clasa: "range",
      hp: 80,
      damage: 35,
      defence: 5,
      accuracy: 35,
      agility: 12,
      speed: 15,
    },
    light_mount: {
      clasa: "light_mount",
      hp: 95,
      damage: 18,
      defence: 8,
      accuracy: 22,
      agility: 35,
      speed: 40,
    },
    heavy_mount: {
      clasa: "heavy_mount",
      hp: 140,
      damage: 26,
      defence: 18,
      accuracy: 18,
      agility: 15,
      speed: 20,
    },
  };

  // Inițializăm ambele tabere cu câte un singur mercenar din fiecare tip (4 în total acum)
  const [tabara1, setTabara1] = useState([
    { ...profileUnitati.melee },
    { ...profileUnitati.range },
    { ...profileUnitati.light_mount },
    { ...profileUnitati.heavy_mount },
  ]);

  const [tabara2, setTabara2] = useState([
    { ...profileUnitati.melee },
    { ...profileUnitati.range },
    { ...profileUnitati.light_mount },
    { ...profileUnitati.heavy_mount },
  ]);

  const [istoricLupta, setIstoricLupta] = useState([]);
  const [castigator, setCastigator] = useState("");

  const adaugaMercenar = (tabara, tipClasa) => {
    const nouMercenar = { ...profileUnitati[tipClasa] };
    if (tabara === 1) {
      setTabara1((prev) => [...prev, nouMercenar]);
    } else {
      setTabara2((prev) => [...prev, nouMercenar]);
    }
  };

  const eliminaMercenar = (tabara, indexGlobal) => {
    if (tabara === 1) {
      setTabara1((prev) => prev.filter((_, idx) => idx !== indexGlobal));
    } else {
      setTabara2((prev) => prev.filter((_, idx) => idx !== indexGlobal));
    }
  };

  const schimbaAtribut = (tabara, indexGlobal, atribut, valoare) => {
    const valoareNumerica = Math.max(0, parseInt(valoare) || 0);
    if (tabara === 1) {
      setTabara1((prev) =>
        prev.map((m, idx) =>
          idx === indexGlobal ? { ...m, [atribut]: valoareNumerica } : m,
        ),
      );
    } else {
      setTabara2((prev) =>
        prev.map((m, idx) =>
          idx === indexGlobal ? { ...m, [atribut]: valoareNumerica } : m,
        ),
      );
    }
  };

  const pornesteBatalia = () => {
    const rezultat = simuleazaLupta(tabara1, tabara2);
    setIstoricLupta(rezultat.logs);
    setCastigator(rezultat.castigator);
  };

  // Helper JSX pentru a randa o linie specifică dintr-o tabără
  const RandeazaLinieTactica = ({
    numarTabara,
    tipClasa,
    listaCompleta,
    culoareAccent,
    numeAfisat,
  }) => {
    // Filtrăm elementele care aparțin exclusiv acestei linii/clase
    const mercenariLinie = listaCompleta
      .map((m, idx) => ({ ...m, indexGlobal: idx }))
      .filter((m) => m.clasa === tipClasa);

    return (
      <div
        style={{
          marginBottom: "20px",
          background: "#f8fafc",
          padding: "10px",
          borderRadius: "6px",
          borderLeft: `4px solid ${culoareAccent}`,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "8px",
          }}
        >
          <h4
            style={{
              margin: 0,
              textTransform: "uppercase",
              fontSize: "12px",
              color: "#334155",
            }}
          >
            {numeAfisat} ({mercenariLinie.length})
          </h4>
          <button
            onClick={() => adaugaMercenar(numarTabara, tipClasa)}
            style={{
              padding: "3px 8px",
              fontSize: "11px",
              cursor: "pointer",
              background: "#10b981",
              color: "white",
              border: "none",
              borderRadius: "4px",
              fontWeight: "bold",
            }}
          >
            + Adaugă
          </button>
        </div>

        {mercenariLinie.length === 0 ? (
          <p
            style={{
              margin: "5px 0",
              fontSize: "12px",
              color: "#94a3b8",
              fontStyle: "italic",
            }}
          >
            Linie goală (niciun mercenar)
          </p>
        ) : (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            {mercenariLinie.map((mercenar) => (
              <div
                key={mercenar.indexGlobal}
                style={{
                  background: "#fff",
                  padding: "8px",
                  border: "1px solid #e2e8f0",
                  borderRadius: "4px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "6px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: "bold",
                      color: "#64748b",
                    }}
                  >
                    Mercenar #{mercenar.indexGlobal + 1}
                  </span>
                  <button
                    onClick={() =>
                      eliminaMercenar(numarTabara, mercenar.indexGlobal)
                    }
                    style={{
                      padding: "2px 6px",
                      fontSize: "10px",
                      cursor: "pointer",
                      background: "#ef4444",
                      color: "white",
                      border: "none",
                      borderRadius: "3px",
                    }}
                  >
                    Șterge
                  </button>
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: "6px",
                  }}
                >
                  {Object.keys(mercenar)
                    .filter((k) => k !== "clasa" && k !== "indexGlobal")
                    .map((atribut) => (
                      <label
                        key={atribut}
                        style={{
                          fontSize: "10px",
                          textTransform: "uppercase",
                          fontWeight: "bold",
                          color: "#475569",
                        }}
                      >
                        {atribut}:
                        <input
                          type="number"
                          value={mercenar[atribut]}
                          onChange={(e) =>
                            schimbaAtribut(
                              numarTabara,
                              mercenar.indexGlobal,
                              atribut,
                              e.target.value,
                            )
                          }
                          style={{
                            width: "100%",
                            padding: "3px",
                            marginTop: "2px",
                            boxSizing: "border-box",
                            borderRadius: "3px",
                            border: "1px solid #cbd5e1",
                            fontSize: "11px",
                          }}
                        />
                      </label>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      style={{
        padding: "20px",
        fontFamily: "sans-serif",
        maxWidth: "1200px",
        margin: "0 auto",
      }}
    >
      <h1 style={{ textAlign: "center", marginBottom: "5px" }}>
        ⚔️ Arena Strategică cu Subclase Cavalerești
      </h1>
      <p
        style={{
          textAlign: "center",
          color: "#666",
          marginTop: "0",
          marginBottom: "25px",
        }}
      >
        Light Mount excelează în viteză și eschive. Heavy Mount oferă putere
        brută și rezistență de tanc.
      </p>

      {/* Secțiunea de Configurare Armate */}
      <div
        style={{
          display: "flex",
          gap: "25px",
          flexWrap: "wrap",
          marginBottom: "25px",
        }}
      >
        {/* Tabăra 1 (Alianța) */}
        <div
          style={{
            flex: 1,
            minWidth: "340px",
            padding: "15px",
            border: "1px solid #cbd5e1",
            borderRadius: "8px",
            background: "#fff",
          }}
        >
          <h3
            style={{
              borderBottom: "2px solid #2563eb",
              paddingBottom: "5px",
              color: "#2563eb",
              marginTop: 0,
            }}
          >
            🛡️ Alianța - Tabăra 1 ({tabara1.length})
          </h3>
          <RandeazaLinieTactica
            numarTabara={1}
            tipClasa="melee"
            listaCompleta={tabara1}
            culoareAccent="#3b82f6"
            numeAfisat="Linia Melee"
          />
          <RandeazaLinieTactica
            numarTabara={1}
            tipClasa="range"
            listaCompleta={tabara1}
            culoareAccent="#ef4444"
            numeAfisat="Linia Range"
          />
          <RandeazaLinieTactica
            numarTabara={1}
            tipClasa="light_mount"
            listaCompleta={tabara1}
            culoareAccent="#f59e0b"
            numeAfisat="Linia Light Mount"
          />
          <RandeazaLinieTactica
            numarTabara={1}
            tipClasa="heavy_mount"
            listaCompleta={tabara1}
            culoareAccent="#b45309"
            numeAfisat="Linia Heavy Mount"
          />
        </div>

        {/* Tabăra 2 (Hoarda) */}
        <div
          style={{
            flex: 1,
            minWidth: "340px",
            padding: "15px",
            border: "1px solid #cbd5e1",
            borderRadius: "8px",
            background: "#fff",
          }}
        >
          <h3
            style={{
              borderBottom: "2px solid #dc2626",
              paddingBottom: "5px",
              color: "#dc2626",
              marginTop: 0,
            }}
          >
            🔺 Hoarda - Tabăra 2 ({tabara2.length})
          </h3>
          <RandeazaLinieTactica
            numarTabara={2}
            tipClasa="melee"
            listaCompleta={tabara2}
            culoareAccent="#3b82f6"
            numeAfisat="Linia Melee"
          />
          <RandeazaLinieTactica
            numarTabara={2}
            tipClasa="range"
            listaCompleta={tabara2}
            culoareAccent="#ef4444"
            numeAfisat="Linia Range"
          />
          <RandeazaLinieTactica
            numarTabara={2}
            tipClasa="light_mount"
            listaCompleta={tabara2}
            culoareAccent="#f59e0b"
            numeAfisat="Linia Light Mount"
          />
          <RandeazaLinieTactica
            numarTabara={2}
            tipClasa="heavy_mount"
            listaCompleta={tabara2}
            culoareAccent="#b45309"
            numeAfisat="Linia Heavy Mount"
          />
        </div>
      </div>

      {/* Buton Execuție Luptă */}
      <div style={{ textAlign: "center", marginBottom: "25px" }}>
        <button
          onClick={pornesteBatalia}
          style={{
            padding: "14px 40px",
            fontSize: "18px",
            fontWeight: "bold",
            cursor: "pointer",
            backgroundColor: "#059669",
            color: "white",
            border: "none",
            borderRadius: "6px",
            boxShadow: "0 4px 6px rgba(5, 150, 105, 0.2)",
          }}
        >
          ⚔️ SIMULEAZĂ BĂTĂLIA DINAMICĂ
        </button>
      </div>

      {/* Panou Câștigător */}
      {castigator && (
        <div
          style={{
            background: "#dcfce7",
            border: "1px solid #bbf7d0",
            padding: "15px",
            borderRadius: "8px",
            textAlign: "center",
            marginBottom: "20px",
          }}
        >
          <h2 style={{ margin: 0, color: "#166534" }}>
            🏆 Rezultat: A câștigat {castigator}!
          </h2>
        </div>
      )}

      {/* Jurnalul de Luptă Terminar (Dark Mode) */}
      {istoricLupta.length > 0 && (
        <div
          style={{
            background: "#1e1e1e",
            color: "#f8f8f2",
            padding: "20px",
            borderRadius: "8px",
            maxHeight: "500px",
            overflowY: "auto",
            boxSizing: "border-box",
            fontFamily: "monospace",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.3)",
          }}
        >
          <h3
            style={{
              margin: "0 0 15px 0",
              borderBottom: "1px solid #444",
              paddingBottom: "5px",
              color: "#a6e22e",
            }}
          >
            📜 Jurnalul de Luptă Detaliat:
          </h3>
          {istoricLupta.map((log, index) => (
            <p
              key={index}
              style={{
                margin: "4px 0",
                fontSize: "13px",
                lineHeight: "1.5",
                fontWeight:
                  log.tip === "runda" || log.tip === "sistem"
                    ? "bold"
                    : "normal",
                color:
                  log.tip === "runda"
                    ? "#66d9ef"
                    : log.tip === "moarte"
                      ? "#f92672"
                      : log.tip === "lovitura"
                        ? "#f8f8f2"
                        : log.tip === "ratare"
                          ? "#75715e"
                          : log.tip === "critic"
                            ? "#fd971f"
                            : "#e6db74",
              }}
            >
              {log.text}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
