// Funcție helper pentru variația standard de +-50%
function aplicaVariatieStandard(valoare) {
  const procentVariatie = Math.random() * 100 - 50;
  const valoareFinala = valoare + valoare * (procentVariatie / 100);
  return Math.max(0, Math.round(valoareFinala));
}

// Funcție helper pentru variația critică de +0% până la +100%
function aplicaVariatieCriticaPozitiva(valoareDeBaza) {
  const bonusProcent = Math.random();
  const bonusCalculat = valoareDeBaza * bonusProcent;
  return Math.round(valoareDeBaza + bonusCalculat);
}

// Alege ținta perfectă pe baza priorităților stricte de clasă (Modificat pentru Subclase Mount)
function alegeTintaDupaPrioritate(clasaAtacator, inamiciVii) {
  let ordineaPrioritatilor = [];
  const esteAparatorCavalerie =
    clasaAtacator === "light_mount" || clasaAtacator === "heavy_mount";

  if (clasaAtacator === "melee") {
    ordineaPrioritatilor = [
      ["melee"],
      ["range"],
      ["light_mount", "heavy_mount"],
    ];
  } else if (clasaAtacator === "range") {
    ordineaPrioritatilor = [
      ["melee"],
      ["range"],
      ["light_mount", "heavy_mount"],
    ];
  } else if (esteAparatorCavalerie) {
    ordineaPrioritatilor = [
      ["light_mount", "heavy_mount"],
      ["range"],
      ["melee"],
    ];
  }

  // Căutăm în ordine prioritățile (grupate ca array-uri în caz de subclase)
  for (let grupClase of ordineaPrioritatilor) {
    let potentialiInamici = inamiciVii.filter((m) =>
      grupClase.includes(m.clasa),
    );
    if (potentialiInamici.length > 0) {
      // Dacă sunt mai mulți mercenari vii pe linia țintă, l-am ales pe unul aleatoriu
      return potentialiInamici[
        Math.floor(Math.random() * potentialiInamici.length)
      ];
    }
  }
  return null;
}

export function simuleazaLupta(tabara1Original, tabara2Original) {
  const t1 = JSON.parse(JSON.stringify(tabara1Original));
  const t2 = JSON.parse(JSON.stringify(tabara2Original));

  const logs = [];

  if (t1.length === 0 && t2.length === 0) {
    return {
      castigator: "Nimeni",
      logs: [{ tip: "sistem", text: "❌ Ambele armate sunt goale!" }],
      stareFinala: { tabara1: t1, tabara2: t2 },
    };
  }
  if (t1.length === 0)
    return {
      castigator: "Tabăra 2",
      logs: [{ tip: "sistem", text: "❌ T1 nu are mercenari!" }],
      stareFinala: { tabara1: t1, tabara2: t2 },
    };
  if (t2.length === 0)
    return {
      castigator: "Tabăra 1",
      logs: [{ tip: "sistem", text: "❌ T2 nu are mercenari!" }],
      stareFinala: { tabara1: t1, tabara2: t2 },
    };

  logs.push({
    tip: "sistem",
    text: `--- ÎNCEPE BĂTĂLIA MULTI-CICLU (ATB CONTINUU) ---`,
  });

  // 1. Inițializăm structura extinsă a mercenarilor. Energia (atbPoints) pornește de la 0.
  let mercenari = [];

  t1.forEach((m, idx) => {
    mercenari.push({
      stats: m,
      echipa: 1,
      nume: `[${m.clasa.toUpperCase()}] T1-#${idx + 1}`,
      vitezăTick: 0, // Se va calcula dinamic la pornirea fiecărui ciclu
      atbPoints: 0,
    });
  });

  t2.forEach((m, idx) => {
    mercenari.push({
      stats: m,
      echipa: 2,
      nume: `[${m.clasa.toUpperCase()}] T2-#${idx + 1}`,
      vitezăTick: 0,
      atbPoints: 0,
    });
  });

  let numarCiclu = 1;
  let luptaActiva = true;

  // 2. Bucla mare care rulează Cicluri Globale succesive până la eliminarea unei tabere
  while (luptaActiva) {
    // NOU: Numărăm câți mercenari mai sunt în viață în acest moment exact
    let mercenariVii = mercenari.filter((m) => m.stats.hp > 0);

    // NOU: Calculăm dinamic limita de tick-uri pentru ciclul curent
    const MAX_TICKS = mercenariVii.length * 10;

    logs.push({
      tip: "sistem",
      text: `🔄 >>> PORNEȘTE CICLUL GLOBAL #${numarCiclu} (Durată dinamică: ${MAX_TICKS} Tick-uri) <<< 🔄`,
    });
    logs.push({
      tip: "sistem",
      text: `⚙️ Recalculare viteze (+-50%) pentru cei ${mercenariVii.length} supraviețuitori...`,
    });

    // RECALCULARE VITEZĂ: Generăm o nouă viteză curentă înainte de startul cronometrului
    for (let m of mercenari) {
      if (m.stats.hp > 0) {
        m.vitezăTick = aplicaVariatieStandard(m.stats.speed);
      }
    }

    let tick = 1;

    // Bucla internă a timpului continuu (acum rulează până la noua limită dinamică MAX_TICKS)
    while (tick <= MAX_TICKS && luptaActiva) {
      // Distribuim energia pe baza noilor viteze calculate în acest ciclu
      for (let m of mercenari) {
        if (m.stats.hp > 0) {
          m.atbPoints += m.vitezăTick;
        }
      }

      while (
        mercenari.some((m) => m.stats.hp > 0 && m.atbPoints >= 100) &&
        luptaActiva
      ) {
        let listaPregatita = mercenari
          .filter((m) => m.stats.hp > 0 && m.atbPoints >= 100)
          .sort((a, b) => b.atbPoints - a.atbPoints);

        // CORECTURĂ: Extragem EXACT primul mercenar care are cea mai mare energie (garantat >= 100)
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

        // Consumăm energia. Restul de puncte se păstrează în rezervor!
        atacatorCurent.atbPoints -= 100;

        logs.push({
          tip: "runda",
          text: `⏱️ [C${numarCiclu}-TICK ${tick}] >>> Acțiune: ${atacatorCurent.nume} (Energie rămasă: ${atacatorCurent.atbPoints})`,
        });

        // CALCUL MODIFICATORI CAVALERIE ÎNAINTE DE VARIAȚIE
        let esteConflictSpecial =
          atacatorCurent.stats.clasa === "light_mount" &&
          tintaCompleta.stats.clasa === "heavy_mount";

        let bazaAccuracy = atacatorCurent.stats.accuracy;
        let bazaDamage = atacatorCurent.stats.damage;
        let bazaDefenceAtacant = atacatorCurent.stats.defence;
        let bazaAgilityAtacant = atacatorCurent.stats.agility;

        if (esteConflictSpecial) {
          bazaAccuracy = bazaAccuracy * 1.03;
          bazaDamage = bazaDamage * 1.03;
          bazaDefenceAtacant = bazaDefenceAtacant * 1.03;
          bazaAgilityAtacant = bazaAgilityAtacant * 1.03;
        }

        let bazaAgilityTinta = tintaCompleta.stats.agility;
        let bazaDefenceTinta = tintaCompleta.stats.defence;
        let bazaAccuracyTinta = tintaCompleta.stats.accuracy;
        let bazaDamageTinta = tintaCompleta.stats.damage;

        if (esteConflictSpecial) {
          bazaAgilityTinta = bazaAgilityTinta * 0.97;
          bazaDefenceTinta = bazaDefenceTinta * 0.97;
          bazaAccuracyTinta = bazaAccuracyTinta * 0.97;
          bazaDamageTinta = bazaDamageTinta * 0.97;
        }

        let acurateteAtacant = aplicaVariatieStandard(bazaAccuracy);
        let agilitateTinta = aplicaVariatieStandard(bazaAgilityTinta);

        logs.push({
          tip: "actiune",
          text: `  ⚔️ Atac asupra ${tintaCompleta.nume}...`,
        });

        // EXECUȚIE ATAC PRINCIPAL
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
            let damageAtacantCritic = aplicaVariatieCriticaPozitiva(bazaDamage);
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
            let damageAtacantNormal = aplicaVariatieStandard(bazaDamage);
            let aparareTintaNormal = aplicaVariatieStandard(bazaDefenceTinta);
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
              text: `    💀 ${tintaCompleta.nume} a fost prăbușit!`,
            });
          }
        }
        // LOGICĂ RATARE ȘI CONTRATAC
        else {
          logs.push({
            tip: "ratare",
            text: `    💨 Ratare! (Acc: ${acurateteAtacant} vs Agi: ${agilitateTinta})`,
          });

          let aDouaAcurateteAtacant = aplicaVariatieStandard(bazaAccuracy);
          let aDouaAgilitateTinta = aplicaVariatieStandard(bazaAgilityTinta);

          if (aDouaAcurateteAtacant <= aDouaAgilitateTinta) {
            logs.push({
              tip: "sistem",
              text: `    ⚡ CONTRATAC! ${tintaCompleta.nume} ripostează!`,
            });

            let damageContratac = aplicaVariatieStandard(bazaDamageTinta);
            let aparareAtacant = aplicaVariatieStandard(bazaDefenceAtacant);

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
            logs.push({ tip: "ratare", text: `    ❌ Fără contratac.` });
          }
        }
      }

      // Verificare finală la nivel de tick
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

    // Incrementăm numărul ciclului global dacă ambele tabere încă mai au trupe în viață
    if (luptaActiva) {
      logs.push({
        tip: "sistem",
        text: `⏱️ Ciclul ${numarCiclu} s-a încheiat. Energia se păstrează. Trecem la următorul ciclu.`,
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
