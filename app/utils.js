// Funcție helper pentru variația standard de +-50%
function aplicaVariatieStandard(valoare) {
  const procentVariatie = Math.random() * 100 - 50;
  const valoareFinala = valoare + valoare * (procentVariatie / 100);
  return Math.max(0, Math.round(valoareFinala));
}

// Funcție helper pentru variația critică de +0% până la +100% (doar crește)
function aplicaVariatieCriticaPozitiva(valoareDeBaza) {
  const bonusProcent = Math.random();
  const bonusCalculat = valoareDeBaza * bonusProcent;
  return Math.round(valoareDeBaza + bonusCalculat);
}

// Alege ținta perfectă pe baza priorităților stricte de clasă (Actualizat pentru cele 6 subclase Melee)
function alegeTintaDupaPrioritate(clasaAtacator, inamiciVii) {
  let ordineaPrioritatilor = [];

  // Grupăm subclasele pentru a fi recunoscute unitar de către AI-ul de țintire
  const toateSubclaseleMelee = [
    "rogue",
    "stavesmen",
    "swordsmen",
    "wipmen",
    "axmen",
    "knifeman",
  ];
  const toateSubclaseleMount = ["light_mount", "heavy_mount"];

  const esteAtacatorMelee = toateSubclaseleMelee.includes(clasaAtacator);
  const esteAtacatorMount = toateSubclaseleMount.includes(clasaAtacator);

  if (esteAtacatorMelee) {
    ordineaPrioritatilor = [
      toateSubclaseleMelee,
      ["range"],
      toateSubclaseleMount,
    ];
  } else if (clasaAtacator === "range") {
    ordineaPrioritatilor = [
      toateSubclaseleMelee,
      ["range"],
      toateSubclaseleMount,
    ];
  } else if (esteAtacatorMount) {
    ordineaPrioritatilor = [
      toateSubclaseleMount,
      ["range"],
      toateSubclaseleMelee,
    ];
  }

  // Scanăm liniile inamice în ordinea priorităților stabilite
  for (let grupClase of ordineaPrioritatilor) {
    let potentialiInamici = inamiciVii.filter((m) =>
      grupClase.includes(m.clasa),
    );
    if (potentialiInamici.length > 0) {
      // Dacă sunt mai mulți mercenari vii pe linia respectivă, alegem unul aleatoriu
      return potentialiInamici[
        Math.floor(Math.random() * potentialiInamici.length)
      ];
    }
  }
  return null;
}

// Funcție internă izolată pentru aplicarea matricei complexe de avantaje și slăbiciuni
// Se execută pe valorile de bază, ÎNAINTE de variația de +-50%
function calculeazaAtributeModificate(atacator, tinta, logs) {
  let accA = atacator.stats.accuracy;
  let dmgA = atacator.stats.damage;
  let defA = atacator.stats.defence;
  let agiA = atacator.stats.agility;

  let accT = tinta.stats.accuracy;
  let dmgT = tinta.stats.damage;
  let defT = tinta.stats.defence;
  let agiT = tinta.stats.agility;

  const cA = atacator.stats.clasa;
  const cT = tinta.stats.clasa;

  const meleeClase = [
    "rogue",
    "stavesmen",
    "swordsmen",
    "wipmen",
    "axmen",
    "knifeman",
  ];
  const esteMeleeA = meleeClase.includes(cA);
  const esteMeleeT = meleeClase.includes(cT);

  // 1. CERCUL INFANTERIEI MELEE (±15%)
  // Rogue > Stavesmen > Swordsmen > Wipmen > Axmen > Knifeman > Rogue
  if (esteMeleeA && esteMeleeT) {
    const lant = [
      "rogue",
      "stavesmen",
      "swordsmen",
      "wipmen",
      "axmen",
      "knifeman",
    ];
    const idxA = lant.indexOf(cA);
    const idxT = lant.indexOf(cT);

    // Verificăm dacă atacatorul este fix înaintea țintei în lanț (sau knifeman -> rogue)
    if (idxA === idxT - 1 || (cA === "knifeman" && cT === "rogue")) {
      accA *= 1.15;
      dmgA *= 1.15;
      defA *= 1.15;
      agiA *= 1.15;
      accT *= 0.85;
      dmgT *= 0.85;
      defT *= 0.85;
      agiT *= 0.85;
      logs.push({
        tip: "sistem",
        text: `  🔺 [CERC MELEE] ${atacator.nume} domină pe ${tinta.nume} (+-15% stats aplicat)!`,
      });
    }
  }

  // 2. RELAȚIILE DINTRE CLASELE MARI (±10% și ±3%)

  // Range vs Heavy Mount (±10%)
  if (cA === "range" && cT === "heavy_mount") {
    accA *= 1.1;
    dmgA *= 1.1;
    defA *= 1.1;
    agiA *= 1.1;
    accT *= 0.9;
    dmgT *= 0.9;
    defT *= 0.9;
    agiT *= 0.9;
    logs.push({
      tip: "sistem",
      text: `  🏹 [ANTI-TANC] ${atacator.nume} are avantaj masiv contra ${tinta.nume} (+-10% stats)!`,
    });
  } else if (cA === "heavy_mount" && cT === "range") {
    accA *= 0.9;
    dmgA *= 0.9;
    defA *= 0.9;
    agiA *= 0.9;
    accT *= 1.1;
    dmgT *= 1.1;
    defT *= 1.1;
    agiT *= 1.1;
    logs.push({
      tip: "sistem",
      text: `  ⚠️ [VULNERABILITATE] ${atacator.nume} suferă penalizare contra trupelor la distanță (+-10% stats)!`,
    });
  }

  // Melee vs Range (±3%)
  if (esteMeleeA && cT === "range") {
    accA *= 1.03;
    dmgA *= 1.03;
    defA *= 1.03;
    agiA *= 1.03;
    accT *= 0.97;
    dmgT *= 0.97;
    defT *= 0.97;
    agiT *= 0.97;
    logs.push({
      tip: "sistem",
      text: `  ⚔️ [VÂNĂTOARE] ${atacator.nume} prinde arcașul ${tinta.nume} (+-3% stats)!`,
    });
  } else if (cA === "range" && esteMeleeT) {
    accA *= 0.97;
    dmgA *= 0.97;
    defA *= 0.97;
    agiA *= 0.97;
    accT *= 1.03;
    dmgT *= 1.03;
    defT *= 1.03;
    agiT *= 1.03;
    logs.push({
      tip: "sistem",
      text: `  ⚠️ [ANCHORAT] ${atacator.nume} este încolțit de infanteria ${tinta.nume} (+-3% stats)!`,
    });
  }

  // Melee vs Light Mount (±3%)
  if (esteMeleeA && cT === "light_mount") {
    accA *= 1.03;
    dmgA *= 1.03;
    defA *= 1.03;
    agiA *= 1.03;
    accT *= 0.97;
    dmgT *= 0.97;
    defT *= 0.97;
    agiT *= 0.97;
    logs.push({
      tip: "sistem",
      text: `  🛡️ [ANTI-CAVALERIE] ${atacator.nume} oprește șarja lui ${tinta.nume} (+-3% stats)!`,
    });
  } else if (cA === "light_mount" && esteMeleeT) {
    accA *= 0.97;
    dmgA *= 0.97;
    defA *= 0.97;
    agiA *= 0.97;
    accT *= 1.03;
    dmgT *= 1.03;
    defT *= 1.03;
    agiT *= 1.03;
    logs.push({
      tip: "sistem",
      text: `  ⚠️ [BLOCAJ] ${atacator.nume} s-a împotmolit în infanteria ${tinta.nume} (+-3% stats)!`,
    });
  }

  // Light Mount vs Heavy Mount (±3%)
  if (cA === "light_mount" && cT === "heavy_mount") {
    accA *= 1.03;
    dmgA *= 1.03;
    defA *= 1.03;
    agiA *= 1.03;
    accT *= 0.97;
    dmgT *= 0.97;
    defT *= 0.97;
    agiT *= 0.97;
    logs.push({
      tip: "sistem",
      text: `  ⚡ [FLANC] ${atacator.nume} hărțuiește flancul greu al lui ${tinta.nume} (+-3% stats)!`,
    });
  } else if (cA === "heavy_mount" && cT === "light_mount") {
    accA *= 0.97;
    dmgA *= 0.97;
    defA *= 0.97;
    agiA *= 0.97;
    accT *= 1.03;
    dmgT *= 1.03;
    defT *= 1.03;
    agiT *= 1.03;
    logs.push({
      tip: "sistem",
      text: `  ⚠️ [DEZECHILIBRU] ${atacator.nume} este depășit de viteza lui ${tinta.nume} (+-3% stats)!`,
    });
  }

  // Heavy Mount vs Melee (+3% asimetric, Melee 0% penalizare)
  if (cA === "heavy_mount" && esteMeleeT) {
    accA *= 1.03;
    dmgA *= 1.03;
    defA *= 1.03;
    agiA *= 1.03;
    logs.push({
      tip: "sistem",
      text: `  🔨 [STRIVIRE] Tancul ${atacator.nume} primește +3% stats asimetric contra infanteriei!`,
    });
  } else if (esteMeleeA && cT === "heavy_mount") {
    accT *= 1.03;
    dmgT *= 1.03;
    defT *= 1.03;
    agiT *= 1.03;
    logs.push({
      tip: "sistem",
      text: `  🛡️ [ZID DE SCUTURI] ${atacator.nume} rezistă fără penalizări, dar ${tinta.nume} are +3% stats apărare!`,
    });
  }

  return { accA, dmgA, defA, agiA, accT, dmgT, defT, agiT };
}

export function simuleazaLupta(tabara1Original, tabara2Original) {
  const t1 = JSON.parse(JSON.stringify(tabara1Original));
  const t2 = JSON.parse(JSON.stringify(tabara2Original));
  const logs = [];

  if (t1.length === 0 && t2.length === 0)
    return {
      castigator: "Nimeni",
      logs: [{ tip: "sistem", text: "❌ Armate goale!" }],
      stareFinala: { tabara1: t1, tabara2: t2 },
    };
  if (t1.length === 0)
    return {
      castigator: "Tabăra 2",
      logs: [{ tip: "sistem", text: "❌ T1 nu are trupe!" }],
      stareFinala: { tabara1: t1, tabara2: t2 },
    };
  if (t2.length === 0)
    return {
      castigator: "Tabăra 1",
      logs: [{ tip: "sistem", text: "❌ T2 nu are trupe!" }],
      stareFinala: { tabara1: t1, tabara2: t2 },
    };

  logs.push({
    tip: "sistem",
    text: `--- ÎNCEPE BĂTĂLIA MULTI-CICLU (ATB DINAMIC) ---`,
  });

  let mercenari = [];
  t1.forEach((m, idx) =>
    mercenari.push({
      stats: m,
      echipa: 1,
      nume: `[${m.clasa.toUpperCase()}] T1-#${idx + 1}`,
      vitezăTick: 0,
      atbPoints: 0,
    }),
  );
  t2.forEach((m, idx) =>
    mercenari.push({
      stats: m,
      echipa: 2,
      nume: `[${m.clasa.toUpperCase()}] T2-#${idx + 1}`,
      vitezăTick: 0,
      atbPoints: 0,
    }),
  );

  let numarCiclu = 1;
  let luptaActiva = true;

  while (luptaActiva) {
    let mercenariVii = mercenari.filter((m) => m.stats.hp > 0);
    const MAX_TICKS = mercenariVii.length * 10; // Durata dinamică a tick-urilor per ciclu

    logs.push({
      tip: "sistem",
      text: `🔄 >>> PORNEȘTE CICLUL GLOBAL #${numarCiclu} (Durată dinamică: ${MAX_TICKS} Ticks) <<< 🔄`,
    });

    for (let m of mercenari) {
      if (m.stats.hp > 0) m.vitezăTick = aplicaVariatieStandard(m.stats.speed);
    }

    let tick = 1;
    while (tick <= MAX_TICKS && luptaActiva) {
      for (let m of mercenari) {
        if (m.stats.hp > 0) m.atbPoints += m.vitezăTick;
      }
      // Sub-bucla de consum pentru execuția acțiunilor consecutive în cadrul aceluiași tick
      while (
        mercenari.some((m) => m.stats.hp > 0 && m.atbPoints >= 100) &&
        luptaActiva
      ) {
        let listaPregatita = mercenari
          .filter((m) => m.stats.hp > 0 && m.atbPoints >= 100)
          .sort((a, b) => b.atbPoints - a.atbPoints);

        let atacatorCurent = listaPregatita[0];
        if (!atacatorCurent) break;

        // Verificăm dacă jocul s-a încheiat
        let t1Vii = mercenari.filter((m) => m.echipa === 1 && m.stats.hp > 0);
        let t2Vii = mercenari.filter((m) => m.echipa === 2 && m.stats.hp > 0);

        if (t1Vii.length === 0 || t2Vii.length === 0) {
          luptaActiva = false;
          break;
        }

        let inamiciVii = mercenari
          .filter((m) => m.echipa !== atacatorCurent.echipa && m.stats.hp > 0)
          .map((m) => m.stats);

        let statsTintaAleasa = alegeTintaDupaPrioritate(
          atacatorCurent.stats.clasa,
          inamiciVii,
        );
        if (!statsTintaAleasa) {
          atacatorCurent.atbPoints = 0;
          continue;
        }

        let tintaCompleta = mercenari.find((m) => m.stats === statsTintaAleasa);

        // Consumăm 100 de puncte. Restul se păstrează în rezervor!
        atacatorCurent.atbPoints -= 100;

        logs.push({
          tip: "runda",
          text: `⏱️ [C${numarCiclu}-TICK ${tick}] >>> Acțiune: ${atacatorCurent.nume} (Energie rămasă: ${atacatorCurent.atbPoints})`,
        });

        // CALCULUL DINAMIC AL CLASEI: Aplicăm matricea de avantaje/penalizări înainte de variație
        let bazeModificate = calculeazaAtributeModificate(
          atacatorCurent,
          tintaCompleta,
          logs,
        );

        // Aplicăm variația de +-50% pe bazele modificate tactic
        let acurateteAtacant = aplicaVariatieStandard(bazeModificate.accA);
        let agilitateTinta = aplicaVariatieStandard(bazeModificate.agiT);

        logs.push({
          tip: "actiune",
          text: `  ⚔️ Atac asupra ${tintaCompleta.nume}...`,
        });

        // 1. EXECUȚIE ATAC PRINCIPAL
        if (acurateteAtacant > agilitateTinta) {
          let esteCritic = false;
          let sansaCritic = 0;

          let agilitateSigura = agilitateTinta === 0 ? 1 : agilitateTinta;
          let raportCrit = acurateteAtacant / agilitateSigura;

          if (raportCrit >= 3) {
            sansaCritic = 100;
          } else if (raportCrit >= 2) {
            sansaCritic = 1 + (raportCrit - 2) * 99;
          }

          if (sansaCritic > 0 && Math.random() * 100 <= sansaCritic) {
            esteCritic = true;
          }

          let damageFinal = 0;

          if (esteCritic) {
            // Atacul critic folosește valoarea tactică din bazeModificate și ignoră defence
            let damageAtacantCritic = aplicaVariatieCriticaPozitiva(
              bazeModificate.dmgA,
            );
            damageFinal = Math.max(0, damageAtacantCritic);
            tintaCompleta.stats.hp = Math.max(
              0,
              tintaCompleta.stats.hp - damageFinal,
            );

            logs.push({
              tip: "critic",
              text: `    🔥 LOVITURĂ CRITICĂ! Armură ignorată! Damage: ${damageFinal}. HP rămas țintă: ${tintaCompleta.stats.hp}`,
            });
          } else {
            // Atacul normal folosește ambele baze tactice modificate
            let damageAtacantNormal = aplicaVariatieStandard(
              bazeModificate.dmgA,
            );
            let aparareTintaNormal = aplicaVariatieStandard(
              bazeModificate.defT,
            );
            damageFinal = Math.max(0, damageAtacantNormal - aparareTintaNormal);
            tintaCompleta.stats.hp = Math.max(
              0,
              tintaCompleta.stats.hp - damageFinal,
            );

            logs.push({
              tip: "lovitura",
              text: `    💥 Lovitură normală! Damage aplicat: ${damageFinal}. HP rămas țintă: ${tintaCompleta.stats.hp}`,
            });
          }

          if (tintaCompleta.stats.hp <= 0) {
            logs.push({
              tip: "moarte",
              text: `    💀 ${tintaCompleta.nume} a fost eliminat!`,
            });
          }
        }
        // 2. LOGICĂ RATARE ȘI CONTRATAC ASIMETRIC
        else {
          logs.push({
            tip: "ratare",
            text: `    💨 Ratare! (Acc: ${acurateteAtacant} vs Agi: ${agilitateTinta})`,
          });

          // REGULĂ DE IMUNITATE RANGE LA CONTRATAC
          // Dacă atacatorul este range sau ținta este range, contratacul nu are loc (0% șansă)
          if (
            atacatorCurent.stats.clasa === "range" ||
            tintaCompleta.stats.clasa === "range"
          ) {
            logs.push({
              tip: "ratare",
              text: `    🏹 Luptă la distanță securizată! Sistemul de contratac este dezactivat pentru această fază.`,
            });
          } else {
            // Dacă nu sunt implicați arcași, se re-calculează testul folosind aceleași baze tactice modificate
            let aDouaAcurateteAtacant = aplicaVariatieStandard(
              bazeModificate.accA,
            );
            let aDouaAgilitateTinta = aplicaVariatieStandard(
              bazeModificate.agiT,
            );

            if (aDouaAcurateteAtacant <= aDouaAgilitateTinta) {
              logs.push({
                tip: "sistem",
                text: `    ⚡ CONTRATAC! ${tintaCompleta.nume} profită și ripostează!`,
              });

              // Cel care se apără folosește acum atributele sale de atac (bazeModificate.dmgT)
              let damageContratac = aplicaVariatieStandard(bazeModificate.dmgT);
              let aparareAtacant = aplicaVariatieStandard(bazeModificate.defA);

              let apararePenetrata = Math.round(aparareAtacant * 0.5);
              let damageFinalContratac = Math.max(
                0,
                damageContratac - apararePenetrata,
              );

              atacatorCurent.stats.hp = Math.max(
                0,
                atacatorCurent.stats.hp - damageFinalContratac,
              );

              logs.push({
                tip: "lovitura",
                text: `    💥 Lovitură de contratac! Damage primit: ${damageFinalContratac}. HP rămas: ${atacatorCurent.stats.hp}`,
              });

              if (atacatorCurent.stats.hp <= 0) {
                logs.push({
                  tip: "moarte",
                  text: `    💀 Atacatorul ${atacatorCurent.nume} a fost ucis pe contratac!`,
                });
              }
            } else {
              logs.push({
                tip: "ratare",
                text: `    ❌ Fără contratac. Agresorul s-a repliat.`,
              });
            }
          }
        }
      }

      let t1ViiFinal = mercenari.filter(
        (m) => m.echipa === 1 && m.stats.hp > 0,
      );
      let t2ViiFinal = mercenari.filter(
        (m) => m.echipa === 2 && m.stats.hp > 0,
      );

      if (t1ViiFinal.length === 0 || t2ViiFinal.length === 0) {
        luptaActiva = false;
      }

      tick++;
    }

    if (luptaActiva) {
      logs.push({
        tip: "sistem",
        text: `⏱️ Ciclul ${numarCiclu} s-a încheiat. Punctele ATB se păstrează.`,
      });
      numarCiclu++;
    }
  }

  const tabara1Finala = mercenari
    .filter((m) => m.echipa === 1)
    .map((m) => m.stats);
  const tabara2Finala = mercenari
    .filter((m) => m.echipa === 2)
    .map((m) => m.stats);

  const castigator = tabara1Finala.some((m) => m.hp > 0)
    ? "Tabăra 1"
    : "Tabăra 2";
  logs.push({
    tip: "sistem",
    text: `--- JOC FINALIZAT COMPLET ÎN CICLUL ${numarCiclu}: A CÂȘTIGAT ${castigator.toUpperCase()} ---`,
  });

  return {
    castigator,
    logs,
    stareFinala: { tabara1: tabara1Finala, tabara2: tabara2Finala },
  };
}
