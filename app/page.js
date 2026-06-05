"use client"; // Obligatoriu în Next.js pentru interactivitate (state, click-uri)
import { useState } from "react";
import { simuleazaLupta } from "./utils";

export default function Home() {
  // Profilurile de bază folosite ca șablon când se dă click pe "Adaugă"
  const profileUnitati = {
    rogue: {
      clasa: "rogue",
      hp: 110,
      damage: 22,
      defence: 10,
      accuracy: 25,
      agility: 28,
      speed: 22,
    },
    stavesmen: {
      clasa: "stavesmen",
      hp: 130,
      damage: 20,
      defence: 14,
      accuracy: 28,
      agility: 18,
      speed: 16,
    },
    swordsmen: {
      clasa: "swordsmen",
      hp: 150,
      damage: 24,
      defence: 18,
      accuracy: 20,
      agility: 12,
      speed: 12,
    },
    wipmen: {
      clasa: "wipmen",
      hp: 120,
      damage: 21,
      defence: 12,
      accuracy: 30,
      agility: 20,
      speed: 18,
    },
    axmen: {
      clasa: "axmen",
      hp: 170,
      damage: 28,
      defence: 16,
      accuracy: 14,
      agility: 8,
      speed: 8,
    },
    knifeman: {
      clasa: "knifeman",
      hp: 100,
      damage: 26,
      defence: 8,
      accuracy: 24,
      agility: 22,
      speed: 25,
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

  // Taberele pornesc complet goale, fără placeholders
  const [tabara1, setTabara1] = useState([]);
  const [tabara2, setTabara2] = useState([]);

  // Stări pentru rezultatele bătăliei
  const [istoricLupta, setIstoricLupta] = useState([]);
  const [castigator, setCastigator] = useState("");
  const [statisticiMasa, setStatisticiMasa] = useState(null);
  const [seSimuleaza, setSeSimuleaza] = useState(false);

  // Funcție de import: suportă numere negative și ignoră zecimalele
  const importaDinText = (tabara, indexGlobal, textBrut) => {
    if (!textBrut.trim()) return;

    const potriviri = textBrut.match(/-?\d+(?:[.,]\d+)?/g);

    if (!potriviri || potriviri.length < 6) {
      alert(
        "❌ Textul nu conține destule numere! Este nevoie de 6 valori în ordine: HP, Damage, Defence, Accuracy, Agility, Speed.",
      );
      return;
    }

    const [hp, damage, defence, accuracy, agility, speed] = potriviri.map(
      (num) => parseInt(num, 10),
    );

    if (tabara === 1) {
      setTabara1((prev) =>
        prev.map((m, idx) =>
          idx === indexGlobal
            ? { ...m, hp, damage, defence, accuracy, agility, speed }
            : m,
        ),
      );
    } else {
      setTabara2((prev) =>
        prev.map((m, idx) =>
          idx === indexGlobal
            ? { ...m, hp, damage, defence, accuracy, agility, speed }
            : m,
        ),
      );
    }
  };

  // Adaugă un mercenar nou pe o anumită linie tactică
  const adaugaMercenar = (tabara, tipClasa) => {
    const nouMercenar = { ...profileUnitati[tipClasa] };
    if (tabara === 1) {
      setTabara1((prev) => [...prev, nouMercenar]);
    } else {
      setTabara2((prev) => [...prev, nouMercenar]);
    }
  };

  // Șterge un mercenar specific dintr-o tabără
  const eliminaMercenar = (tabara, indexGlobal) => {
    if (tabara === 1) {
      setTabara1((prev) => prev.filter((_, idx) => idx !== indexGlobal));
    } else {
      setTabara2((prev) => prev.filter((_, idx) => idx !== indexGlobal));
    }
  };

  // Editează o valoare manuală (permite numere negative)
  const schimbaAtribut = (tabara, indexGlobal, atribut, valoare) => {
    const valoareNumerica = parseInt(valoare, 10) || 0;
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

  // Urmărește o singură luptă detaliată
  const pornesteBatalia = () => {
    setStatisticiMasa(null);
    const rezultat = simuleazaLupta(tabara1, tabara2);
    setIstoricLupta(rezultat.logs);
    setCastigator(rezultat.castigator);
  };

  // Rulează 100 de lupte și afișează raportul procentual compact
  const pornesteSimulareMasa = () => {
    if (tabara1.length === 0 && tabara2.length === 0) {
      alert("❌ Ambele armate sunt goale! Adaugă trupe înainte de simulare.");
      return;
    }

    setSeSimuleaza(true);
    setCastigator("");
    setIstoricLupta([]);

    let victoriiT1 = 0;
    let victoriiT2 = 0;

    for (let i = 0; i < 100; i++) {
      const rezultat = simuleazaLupta(tabara1, tabara2);
      if (rezultat.castigator === "Tabăra 1") {
        victoriiT1++;
      } else if (rezultat.castigator === "Tabăra 2") {
        victoriiT2++;
      }
    }

    setStatisticiMasa({
      procentT1: victoriiT1,
      procentT2: victoriiT2,
    });

    setSeSimuleaza(false);
  };

  // Componentă helper internă (mutată corect în corpul principal pentru a moșteni starea din React)
  const RandeazaLinieTactica = ({
    numarTabara,
    tipClasa,
    listaCompleta,
    culoareAccent,
    numeAfisat,
  }) => {
    const mercenariLinie = listaCompleta
      .map((m, idx) => ({ ...m, indexGlobal: idx }))
      .filter((m) => m.clasa === tipClasa);

    return (
      <div
        style={{
          marginBottom: "15px",
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
              margin: "3px 0",
              fontSize: "11px",
              color: "#94a3b8",
              fontStyle: "italic",
            }}
          >
            Linie goală (niciun mercenar)
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
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
                    marginBottom: "8px",
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
                    marginBottom: "8px",
                    background: "#f1f5f9",
                    padding: "6px",
                    borderRadius: "4px",
                    display: "flex",
                    gap: "4px",
                  }}
                >
                  <input
                    type="text"
                    placeholder="Paste text brut (ex: 150 30 15 25 20 12)..."
                    onPaste={(e) => {
                      const textLipit = e.clipboardData.getData("text");
                      importaDinText(
                        numarTabara,
                        mercenar.indexGlobal,
                        textLipit,
                      );
                    }}
                    style={{
                      width: "100%",
                      fontSize: "11px",
                      padding: "4px",
                      borderRadius: "3px",
                      border: "1px solid #cbd5e1",
                      boxSizing: "border-box",
                    }}
                  />
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
        maxWidth: "1300px",
        margin: "0 auto",
      }}
    >
      <h1 style={{ textAlign: "center", marginBottom: "5px" }}>
        ⚔️ Arena Strategică Multi-Clasă ATB
      </h1>
      <p
        style={{
          textAlign: "center",
          color: "#666",
          marginTop: "0",
          marginBottom: "25px",
        }}
      >
        Folosește căsuța gri din dreptul fiecărui mercenar pentru a da **Paste**
        la un șir de 6 numere (HP, DMG, DEF, ACC, AGI, SPD) [INDEX].
      </p>

      {/* Panou Vizual Simplificat: Echipa 1 vs Echipa 2 */}
      {statisticiMasa && (
        <div
          style={{
            background: "#f0fdf4",
            border: "1px solid #bbf7d0",
            padding: "20px",
            borderRadius: "8px",
            marginBottom: "25px",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
          }}
        >
          <h2
            style={{
              textAlign: "center",
              marginTop: 0,
              color: "#166534",
              borderBottom: "2px solid #bbf7d0",
              paddingBottom: "8px",
            }}
          >
            📊 Raport Procentual de Câștig (100 de Simulări)
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "15px",
              marginTop: "15px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                background: "#fff",
                padding: "12px",
                borderRadius: "6px",
                border: "1px solid #e2e8f0",
              }}
            >
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: "bold",
                  color: "#64748b",
                  textTransform: "uppercase",
                }}
              >
                Rată Victorie Echipa 1
              </span>
              <h3
                style={{
                  fontSize: "28px",
                  margin: "5px 0 0 0",
                  color: "#2563eb",
                }}
              >
                {statisticiMasa.procentT1}%
              </h3>
            </div>
            <div
              style={{
                background: "#fff",
                padding: "12px",
                borderRadius: "6px",
                border: "1px solid #e2e8f0",
              }}
            >
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: "bold",
                  color: "#64748b",
                  textTransform: "uppercase",
                }}
              >
                Rată Victorie Echipa 2
              </span>
              <h3
                style={{
                  fontSize: "28px",
                  margin: "5px 0 0 0",
                  color: "#dc2626",
                }}
              >
                {statisticiMasa.procentT2}%
              </h3>
            </div>
          </div>
        </div>
      )}

      {/* Secțiunea Principală de Configurare Armate */}
      <div
        style={{
          display: "flex",
          gap: "25px",
          flexWrap: "wrap",
          marginBottom: "25px",
        }}
      >
        {/* Panel Armata 1 (Echipa 1) */}
        <div
          style={{
            flex: 1,
            minWidth: "350px",
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
              marginBottom: "15px",
            }}
          >
            🛡️ Echipa 1 ({tabara1.length})
          </h3>
          <RandeazaLinieTactica
            numarTabara={1}
            tipClasa="rogue"
            listaCompleta={tabara1}
            culoareAccent="#3b82f6"
            numeAfisat="Linia Rogue"
          />
          <RandeazaLinieTactica
            numarTabara={1}
            tipClasa="stavesmen"
            listaCompleta={tabara1}
            culoareAccent="#2563eb"
            numeAfisat="Linia Stavesmen"
          />
          <RandeazaLinieTactica
            numarTabara={1}
            tipClasa="swordsmen"
            listaCompleta={tabara1}
            culoareAccent="#1d4ed8"
            numeAfisat="Linia Swordsmen"
          />
          <RandeazaLinieTactica
            numarTabara={1}
            tipClasa="wipmen"
            listaCompleta={tabara1}
            culoareAccent="#1e40af"
            numeAfisat="Linia Wipmen"
          />
          <RandeazaLinieTactica
            numarTabara={1}
            tipClasa="axmen"
            listaCompleta={tabara1}
            culoareAccent="#172554"
            numeAfisat="Linia Axmen"
          />
          <RandeazaLinieTactica
            numarTabara={1}
            tipClasa="knifeman"
            listaCompleta={tabara1}
            culoareAccent="#60a5fa"
            numeAfisat="Linia Knifeman"
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

        {/* Panel Armata 2 (Echipa 2) */}
        <div
          style={{
            flex: 1,
            minWidth: "350px",
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
              marginBottom: "15px",
            }}
          >
            🔺 Echipa 2 ({tabara2.length})
          </h3>
          <RandeazaLinieTactica
            numarTabara={2}
            tipClasa="rogue"
            listaCompleta={tabara2}
            culoareAccent="#3b82f6"
            numeAfisat="Linia Rogue"
          />
          <RandeazaLinieTactica
            numarTabara={2}
            tipClasa="stavesmen"
            listaCompleta={tabara2}
            culoareAccent="#2563eb"
            numeAfisat="Linia Stavesmen"
          />
          <RandeazaLinieTactica
            numarTabara={2}
            tipClasa="swordsmen"
            listaCompleta={tabara2}
            culoareAccent="#1d4ed8"
            numeAfisat="Linia Swordsmen"
          />
          <RandeazaLinieTactica
            numarTabara={2}
            tipClasa="wipmen"
            listaCompleta={tabara2}
            culoareAccent="#1e40af"
            numeAfisat="Linia Wipmen"
          />
          <RandeazaLinieTactica
            numarTabara={2}
            tipClasa="axmen"
            listaCompleta={tabara2}
            culoareAccent="#172554"
            numeAfisat="Linia Axmen"
          />
          <RandeazaLinieTactica
            numarTabara={2}
            tipClasa="knifeman"
            listaCompleta={tabara2}
            culoareAccent="#60a5fa"
            numeAfisat="Linia Knifeman"
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

      {/* Zona Butoane Centrale de Acțiune */}
      <div
        style={{
          display: "flex",
          gap: "15px",
          justifyContent: "center",
          marginBottom: "25px",
        }}
      >
        <button
          onClick={pornesteBatalia}
          style={{
            padding: "14px 30px",
            fontSize: "16px",
            fontWeight: "bold",
            cursor: "pointer",
            backgroundColor: "#059669",
            color: "white",
            border: "none",
            borderRadius: "6px",
            boxShadow: "0 4px 6px rgba(5, 150, 105, 0.2)",
          }}
        >
          ⚔️ URMĂREȘTE O LUPTĂ (DETALIAT)
        </button>

        <button
          onClick={pornesteSimulareMasa}
          disabled={seSimuleaza}
          style={{
            padding: "14px 30px",
            fontSize: "16px",
            fontWeight: "bold",
            cursor: "pointer",
            backgroundColor: "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: "6px",
            boxShadow: "0 4px 6px rgba(59, 130, 246, 0.2)",
            opacity: seSimuleaza ? 0.6 : 1,
          }}
        >
          {seSimuleaza ? "⏳ Se calculează..." : "📊 SIMULEAZĂ 100 DE LUPTE"}
        </button>
      </div>

      {/* Banner Câștigător Unic */}
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
            🏆 Rezultat Final: A câștigat {castigator}!
          </h2>
        </div>
      )}

      {/* Terminalul de Log-uri Stilizat, Curățat și Colorat Strategic */}
      {istoricLupta.length > 0 && (
        <div
          style={{
            background: "#111827",
            color: "#f3f4f6",
            padding: "20px",
            borderRadius: "8px",
            maxHeight: "550px",
            overflowY: "auto",
            boxSizing: "border-box",
            fontFamily: 'monospace, "Courier New"',
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.5)",
          }}
        >
          <h3
            style={{
              margin: "0 0 15px 0",
              borderBottom: "1px solid #374151",
              paddingBottom: "5px",
              color: "#10b981",
            }}
          >
            📜 Jurnalul de Luptă Detaliat:
          </h3>
          {istoricLupta.map((log, index) => {
            if (log.echipa !== 1 && log.echipa !== 2) return null;

            let culoareText = "#e5e7eb";

            if (log.tip === "moarte") {
              culoareText = "#ef4444";
            } else if (log.echipa === 1) {
              culoareText = "#22c55e";
            } else if (log.echipa === 2) {
              culoareText = "#94a3b8";
            }

            return (
              <p
                key={index}
                style={{
                  margin: "6px 0",
                  fontSize: "13px",
                  lineHeight: "1.5",
                  color: culoareText,
                  borderBottom: "1px solid #1f2937",
                  paddingBottom: "4px",
                  fontWeight: log.tip === "moarte" ? "bold" : "normal",
                }}
              >
                {log.text}
              </p>
            );
          })}
        </div>
      )}
    </div>
  );
}
