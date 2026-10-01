// server.ts
import express from "express";
import path2 from "path";
import fs2 from "fs";

// src/data/questions.ts
var STAT_QUESTIONS = [
  // ================= GK QUESTIONS =================
  {
    id: "q_buffon_cleansheets_seriea",
    position: "GK",
    player: "Gianluigi Buffon",
    playerId: "icon_buffon",
    season: "All-Time",
    category: "Clean sheets",
    statisticType: "\u0645\u0628\u0627\u0631\u064A\u0627\u062A \u0628\u0634\u0628\u0627\u0643 \u0646\u0638\u064A\u0641\u0629 \u0641\u064A \u0627\u0644\u062F\u0648\u0631\u064A \u0627\u0644\u0625\u064A\u0637\u0627\u0644\u064A",
    difficulty: "Elite",
    question: "\u0643\u0645 \u0639\u062F\u062F \u0627\u0644\u0645\u0628\u0627\u0631\u064A\u0627\u062A \u0628\u0634\u0628\u0627\u0643 \u0646\u0638\u064A\u0641\u0629 (Clean Sheets) \u0627\u0644\u062A\u064A \u062D\u0642\u0642\u0647\u0627 \u062C\u0627\u0646\u0644\u0648\u064A\u062C\u064A \u0628\u0648\u0641\u0648\u0646 \u0641\u064A \u0627\u0644\u062F\u0648\u0631\u064A \u0627\u0644\u0625\u064A\u0637\u0627\u0644\u064A (\u0633\u064A\u0631\u064A\u0627 \u0622) \u0637\u0648\u0627\u0644 \u0645\u0633\u064A\u0631\u062A\u0647 \u0627\u0644\u0642\u064A\u0627\u0633\u064A\u0629\u061F",
    correctAnswer: 299,
    source: "Lega Serie A Official Records",
    playerImage: "/players/icon_buffon.jpg",
    hint: "\u064A\u0642\u062A\u0631\u0628 \u0645\u0646 \u0627\u0644\u0631\u0642\u0645 \u0627\u0644\u0642\u064A\u0627\u0633\u064A \u0627\u0644\u062A\u0627\u0631\u064A\u062E\u064A \u0644\u0640 300 \u0645\u0628\u0627\u0631\u0627\u0629 \u0628\u0634\u0628\u0627\u0643 \u0646\u0638\u064A\u0641\u0629"
  },
  {
    id: "q_casillas_ucl_cleansheets",
    position: "GK",
    player: "Iker Casillas",
    playerId: "icon_casillas",
    season: "All-Time UCL",
    category: "Champions League",
    statisticType: "\u0645\u0628\u0627\u0631\u064A\u0627\u062A \u0628\u0634\u0628\u0627\u0643 \u0646\u0638\u064A\u0641\u0629 \u0641\u064A \u062F\u0648\u0631\u064A \u0623\u0628\u0637\u0627\u0644 \u0623\u0648\u0631\u0648\u0628\u0627",
    difficulty: "Pro",
    question: "\u0643\u0645 \u0645\u0628\u0627\u0631\u0627\u0629 \u0628\u0634\u0628\u0627\u0643 \u0646\u0638\u064A\u0641\u0629 \u062D\u0627\u0641\u0638 \u0639\u0644\u064A\u0647\u0627 \u0625\u064A\u0643\u0631 \u0643\u0627\u0633\u064A\u0627\u0633 \u0641\u064A \u062A\u0627\u0631\u064A\u062E \u0628\u0637\u0648\u0644\u0629 \u062F\u0648\u0631\u064A \u0623\u0628\u0637\u0627\u0644 \u0623\u0648\u0631\u0648\u0628\u0627\u061F",
    correctAnswer: 57,
    source: "UEFA Official Records",
    playerImage: "/players/icon_casillas.jpg",
    hint: "\u0628\u064A\u0646 50 \u0648 65 \u0645\u0628\u0627\u0631\u0627\u0629"
  },
  {
    id: "q_neuer_wc2014_saves",
    position: "GK",
    player: "Manuel Neuer",
    playerId: "wk_neuer",
    season: "World Cup 2014",
    category: "World Cup",
    statisticType: "\u062A\u0635\u062F\u064A\u0627\u062A \u0641\u064A \u0643\u0623\u0633 \u0627\u0644\u0639\u0627\u0644\u0645 2014",
    difficulty: "Legend",
    question: "\u0643\u0645 \u0639\u062F\u062F \u0627\u0644\u062A\u0635\u062F\u064A\u0627\u062A \u0627\u0644\u0646\u0627\u062C\u062D\u0629 \u0627\u0644\u062A\u064A \u0642\u0627\u0645 \u0628\u0647\u0627 \u0645\u0627\u0646\u0648\u064A\u0644 \u0646\u0648\u064A\u0631 \u062E\u0644\u0627\u0644 \u0645\u0634\u0648\u0627\u0631 \u062A\u062A\u0648\u064A\u062C \u0623\u0644\u0645\u0627\u0646\u064A\u0627 \u0628\u0643\u0623\u0633 \u0627\u0644\u0639\u0627\u0644\u0645 2014\u061F",
    correctAnswer: 25,
    source: "FIFA World Cup 2014 Technical Report",
    playerImage: "/players/wk_neuer.jpg",
    hint: "\u0641\u0627\u0632 \u0628\u0627\u0644\u0642\u0641\u0627\u0632 \u0627\u0644\u0630\u0647\u0628\u064A \u0641\u064A \u0647\u0630\u0647 \u0627\u0644\u0628\u0637\u0648\u0644\u0629"
  },
  {
    id: "q_courtois_ucl_final_2022",
    position: "GK",
    player: "Thibaut Courtois",
    playerId: "elite_courtois",
    season: "2021/22",
    category: "Champions League",
    statisticType: "\u062A\u0635\u062F\u064A\u0627\u062A \u0641\u064A \u0646\u0647\u0627\u0626\u064A \u062F\u0648\u0631\u064A \u0623\u0628\u0637\u0627\u0644 \u0623\u0648\u0631\u0648\u0628\u0627",
    difficulty: "Pro",
    question: "\u0643\u0645 \u0639\u062F\u062F \u0627\u0644\u062A\u0635\u062F\u064A\u0627\u062A \u0627\u0644\u062A\u0627\u0631\u064A\u062E\u064A\u0629 \u0627\u0644\u062A\u064A \u0642\u0627\u0645 \u0628\u0647\u0627 \u062A\u064A\u0628\u0648 \u0643\u0648\u0631\u062A\u0648\u0627 \u0641\u064A \u0646\u0647\u0627\u0626\u064A \u062F\u0648\u0631\u064A \u0623\u0628\u0637\u0627\u0644 \u0623\u0648\u0631\u0648\u0628\u0627 2022 \u0636\u062F \u0644\u064A\u0641\u0631\u0628\u0648\u0644\u061F",
    correctAnswer: 9,
    source: "UEFA Champions League Match Report",
    playerImage: "/players/elite_courtois.jpg",
    hint: "\u0631\u0642\u0645 \u0642\u064A\u0627\u0633\u064A \u0641\u064A \u0646\u0647\u0627\u0626\u064A \u062F\u0648\u0631\u064A \u0627\u0644\u0623\u0628\u0637\u0627\u0644"
  },
  {
    id: "q_alisson_epl_cleansheets_2022",
    position: "GK",
    player: "Alisson Becker",
    playerId: "elite_alisson",
    season: "2021/22",
    category: "League statistics",
    statisticType: "\u0634\u0628\u0627\u0643 \u0646\u0638\u064A\u0641\u0629 \u0641\u064A \u0645\u0648\u0633\u0645 \u0627\u0644\u0628\u0631\u064A\u0645\u064A\u0631\u0644\u064A\u062C",
    difficulty: "Elite",
    question: "\u0643\u0645 \u0645\u0628\u0627\u0631\u0627\u0629 \u0628\u0634\u0628\u0627\u0643 \u0646\u0638\u064A\u0641\u0629 \u062E\u0631\u062C \u0628\u0647\u0627 \u0623\u0644\u064A\u0633\u0648\u0646 \u0628\u064A\u0643\u0631 \u0644\u064A\u062A\u0648\u062C \u0628\u0627\u0644\u0642\u0641\u0627\u0632 \u0627\u0644\u0630\u0647\u0628\u064A \u0641\u064A \u0627\u0644\u062F\u0648\u0631\u064A \u0627\u0644\u0625\u0646\u062C\u0644\u064A\u0632\u064A \u0644\u0645\u0648\u0633\u0645 2021/2022\u061F",
    correctAnswer: 20,
    source: "Premier League Official",
    playerImage: "/players/elite_alisson.jpg"
  },
  // ================= DEF QUESTIONS =================
  {
    id: "q_maldini_ucl_finals",
    position: "DEF",
    player: "Paolo Maldini",
    playerId: "icon_maldini",
    season: "Career",
    category: "Champions League",
    statisticType: "\u0645\u0634\u0627\u0631\u0643\u0627\u062A \u0641\u064A \u0646\u0647\u0627\u0626\u064A\u0627\u062A \u062F\u0648\u0631\u064A \u0623\u0628\u0637\u0627\u0644 \u0623\u0648\u0631\u0648\u0628\u0627",
    difficulty: "Pro",
    question: "\u0643\u0645 \u0639\u062F\u062F \u0646\u0647\u0627\u0626\u064A\u0627\u062A \u062F\u0648\u0631\u064A \u0623\u0628\u0637\u0627\u0644 \u0623\u0648\u0631\u0648\u0628\u0627 \u0627\u0644\u062A\u064A \u062E\u0627\u0636\u0647\u0627 \u0627\u0644\u0623\u0633\u0637\u0648\u0631\u0629 \u0628\u0627\u0648\u0644\u0648 \u0645\u0627\u0644\u062F\u064A\u0646\u064A \u0645\u0639 \u0645\u064A\u0644\u0627\u0646 \u0637\u0648\u0627\u0644 \u0645\u0633\u064A\u0631\u062A\u0647\u061F",
    correctAnswer: 8,
    source: "UEFA Official Records",
    playerImage: "/players/icon_maldini.jpg",
    hint: "\u062A\u0648\u062C \u0628\u0627\u0644\u0644\u0642\u0628 5 \u0645\u0631\u0627\u062A \u0648\u0648\u0635\u064A\u0641 3 \u0645\u0631\u0627\u062A"
  },
  {
    id: "q_beckenbauer_caps",
    position: "DEF",
    player: "Franz Beckenbauer",
    playerId: "icon_beckenbauer",
    season: "International",
    category: "National team statistics",
    statisticType: "\u0645\u0628\u0627\u0631\u064A\u0627\u062A \u062F\u0648\u0644\u064A\u0629 \u0645\u0639 \u0645\u0646\u062A\u062E\u0628 \u0623\u0644\u0645\u0627\u0646\u064A\u0627 \u0627\u0644\u063A\u0631\u0628\u064A\u0629",
    difficulty: "Elite",
    question: "\u0643\u0645 \u0639\u062F\u062F \u0627\u0644\u0645\u0628\u0627\u0631\u064A\u0627\u062A \u0627\u0644\u062F\u0648\u0644\u064A\u0629 \u0627\u0644\u062A\u064A \u0634\u0627\u0631\u0643 \u0641\u064A\u0647\u0627 \u0627\u0644\u0642\u064A\u0635\u0631 \u0641\u0631\u0627\u0646\u062A\u0633 \u0628\u0643\u0646\u0628\u0627\u0648\u0631 \u0645\u0639 \u0645\u0646\u062A\u062E\u0628 \u0623\u0644\u0645\u0627\u0646\u064A\u0627 \u0627\u0644\u063A\u0631\u0628\u064A\u0629\u061F",
    correctAnswer: 103,
    source: "DFB German Football Association",
    playerImage: "/players/icon_beckenbauer.jpg",
    hint: "\u0623\u0643\u062B\u0631 \u0628\u0642\u0644\u064A\u0644 \u0645\u0646 100 \u0645\u0628\u0627\u0631\u0627\u0629"
  },
  {
    id: "q_vandijk_unbeaten_home",
    position: "DEF",
    player: "Virgil van Dijk",
    playerId: "elite_vandijk",
    season: "2018-2022",
    category: "Records",
    statisticType: "\u0645\u0628\u0627\u0631\u064A\u0627\u062A \u0645\u062A\u062A\u0627\u0644\u064A\u0629 \u0641\u064A \u0622\u0646\u0641\u064A\u0644\u062F \u0628\u0627\u0644\u062F\u0648\u0631\u064A \u062F\u0648\u0646 \u0647\u0632\u064A\u0645\u0629",
    difficulty: "Legend",
    question: "\u0643\u0645 \u0645\u0628\u0627\u0631\u0627\u0629 \u0645\u062A\u062A\u0627\u0644\u064A\u0629 \u062E\u0627\u0636\u0647\u0627 \u0641\u064A\u0631\u062C\u064A\u0644 \u0641\u0627\u0646 \u062F\u0627\u064A\u0643 \u0641\u064A \u0645\u0644\u0639\u0628 \u0622\u0646\u0641\u064A\u0644\u062F \u0641\u064A \u0627\u0644\u062F\u0648\u0631\u064A \u0627\u0644\u0625\u0646\u062C\u0644\u064A\u0632\u064A \u062F\u0648\u0646 \u0623\u0646 \u064A\u062A\u0644\u0642\u0649 \u0623\u064A \u0647\u0632\u064A\u0645\u0629\u061F",
    correctAnswer: 70,
    source: "Premier League Opta Stats",
    playerImage: "/players/elite_vandijk.jpg",
    hint: "\u0633\u0644\u0633\u0644\u0629 \u062A\u0627\u0631\u064A\u062E\u064A\u0629 \u0627\u0645\u062A\u062F\u062A \u0644\u0640 70 \u0645\u0628\u0627\u0631\u0627\u0629"
  },
  {
    id: "q_rudiger_ucl_minutes",
    position: "DEF",
    player: "Antonio R\xFCdiger",
    playerId: "elite_rudiger",
    season: "2023/24",
    category: "Champions League",
    statisticType: "\u0645\u0628\u0627\u0631\u064A\u0627\u062A \u0641\u064A \u062F\u0648\u0631\u064A \u0627\u0644\u0623\u0628\u0637\u0627\u0644 \u062E\u0644\u0627\u0644 \u0645\u0648\u0633\u0645 \u0627\u0644\u062A\u062A\u0648\u064A\u062C",
    difficulty: "Pro",
    question: "\u0643\u0645 \u0645\u0628\u0627\u0631\u0627\u0629 \u0634\u0627\u0631\u0643 \u0641\u064A\u0647\u0627 \u0623\u0646\u0637\u0648\u0646\u064A\u0648 \u0631\u0648\u062F\u064A\u063A\u0631 \u0645\u0639 \u0631\u064A\u0627\u0644 \u0645\u062F\u0631\u064A\u062F \u0641\u064A \u062F\u0648\u0631\u064A \u0623\u0628\u0637\u0627\u0644 \u0623\u0648\u0631\u0648\u0628\u0627 \u062E\u0644\u0627\u0644 \u0645\u0648\u0633\u0645 \u0627\u0644\u062A\u062A\u0648\u064A\u062C 2023/24\u061F",
    correctAnswer: 12,
    source: "UEFA Official",
    playerImage: "/players/elite_rudiger.jpg"
  },
  {
    id: "q_saliba_starts_epl_2024",
    position: "DEF",
    player: "William Saliba",
    playerId: "wk_saliba",
    season: "2023/24",
    category: "League statistics",
    statisticType: "\u0645\u0634\u0627\u0631\u0643\u0627\u062A \u0643\u0627\u0645\u0644\u0629 \u0641\u064A \u0627\u0644\u062F\u0648\u0631\u064A \u0627\u0644\u0625\u0646\u062C\u0644\u064A\u0632\u064A 2023/24",
    difficulty: "Rookie",
    question: "\u0644\u0639\u0628 \u0648\u064A\u0644\u064A\u0627\u0645 \u0633\u0627\u0644\u064A\u0628\u0627 \u0643\u0644 \u062F\u0642\u064A\u0642\u0629 \u0645\u0639 \u0623\u0631\u0633\u0646\u0627\u0644 \u0641\u064A \u0627\u0644\u062F\u0648\u0631\u064A \u0627\u0644\u0625\u0646\u062C\u0644\u064A\u0632\u064A 2023/24\u060C \u0641\u0643\u0645 \u0639\u062F\u062F \u0627\u0644\u0645\u0628\u0627\u0631\u064A\u0627\u062A \u0627\u0644\u062A\u064A \u062E\u0627\u0636\u0647\u0627\u061F",
    correctAnswer: 38,
    source: "Premier League Official",
    playerImage: "/players/wk_saliba.jpg",
    hint: "\u062E\u0627\u0636 \u0643\u0644 \u062C\u0648\u0644\u0627\u062A \u0627\u0644\u0645\u0648\u0633\u0645 \u062F\u0648\u0646 \u063A\u064A\u0627\u0628"
  },
  // ================= MID QUESTIONS =================
  {
    id: "q_zidane_wc1998_goals",
    position: "MID",
    player: "Zinedine Zidane",
    playerId: "icon_zidane",
    season: "World Cup 1998",
    category: "World Cup",
    statisticType: "\u0623\u0647\u062F\u0627\u0641 \u0641\u064A \u0646\u0647\u0627\u0626\u064A \u0643\u0623\u0633 \u0627\u0644\u0639\u0627\u0644\u0645 1998",
    difficulty: "Rookie",
    question: "\u0643\u0645 \u0647\u062F\u0641\u0627\u064B \u0628\u0631\u0623\u0633\u0647 \u0633\u062C\u0644\u0647 \u0632\u064A\u0646 \u0627\u0644\u062F\u064A\u0646 \u0632\u064A\u062F\u0627\u0646 \u0641\u064A \u0634\u0628\u0627\u0643 \u0627\u0644\u0628\u0631\u0627\u0632\u064A\u0644 \u0641\u064A \u0646\u0647\u0627\u0626\u064A \u0643\u0623\u0633 \u0627\u0644\u0639\u0627\u0644\u0645 1998\u061F",
    correctAnswer: 2,
    source: "FIFA World Cup Archives",
    playerImage: "/players/icon_zidane.jpg",
    hint: "\u062B\u0646\u0627\u0626\u064A\u0629 \u0631\u0623\u0633\u064A\u0629 \u0634\u0647\u064A\u0631\u0629 \u0641\u064A \u0627\u0644\u0634\u0648\u0637 \u0627\u0644\u0623\u0648\u0644"
  },
  {
    id: "q_debruyne_epl_assists_record",
    position: "MID",
    player: "Kevin De Bruyne",
    playerId: "elite_debruyne",
    season: "2019/20",
    category: "Assists",
    statisticType: "\u0635\u0646\u0627\u0639\u0629 \u0623\u0647\u062F\u0627\u0641 \u0641\u064A \u0645\u0648\u0633\u0645 \u0648\u0627\u062D\u062F \u0628\u0627\u0644\u0628\u0631\u064A\u0645\u064A\u0631\u0644\u064A\u062C",
    difficulty: "Pro",
    question: "\u0643\u0645 \u062A\u0645\u0631\u064A\u0631\u0629 \u062D\u0627\u0633\u0645\u0629 (\u0623\u0633\u064A\u0633\u062A) \u0635\u0646\u0639\u0647\u0627 \u0643\u064A\u0641\u0646 \u062F\u064A \u0628\u0631\u0648\u064A\u0646 \u0641\u064A \u0627\u0644\u062F\u0648\u0631\u064A \u0627\u0644\u0625\u0646\u062C\u0644\u064A\u0632\u064A \u0645\u0648\u0633\u0645 2019/20 \u0644\u064A\u0639\u0627\u062F\u0644 \u0627\u0644\u0631\u0642\u0645 \u0627\u0644\u0642\u064A\u0627\u0633\u064A\u061F",
    correctAnswer: 20,
    source: "Premier League Official Records",
    playerImage: "/players/elite_debruyne.jpg",
    hint: "\u064A\u0639\u0627\u062F\u0644 \u0631\u0642\u0645 \u062A\u064A\u064A\u0631\u064A \u0647\u0646\u0631\u064A"
  },
  {
    id: "q_xavi_pass_rate_elclasico",
    position: "MID",
    player: "Xavi Hern\xE1ndez",
    playerId: "icon_xavi",
    season: "2008/09",
    category: "Assists",
    statisticType: "\u0635\u0646\u0627\u0639\u0629 \u0623\u0647\u062F\u0627\u0641 \u0641\u064A \u0643\u0644\u0627\u0633\u064A\u0643\u0648 6-2 \u0627\u0644\u0634\u0647\u064A\u0631",
    difficulty: "Elite",
    question: "\u0643\u0645 \u062A\u0645\u0631\u064A\u0631\u0629 \u062D\u0627\u0633\u0645\u0629 \u0635\u0646\u0639\u0647\u0627 \u062A\u0634\u0627\u0641\u064A \u0647\u064A\u0631\u0646\u0627\u0646\u062F\u064A\u0632 \u0641\u064A \u0645\u0628\u0627\u0631\u0627\u0629 \u0627\u0644\u0643\u0644\u0627\u0633\u064A\u0643\u0648 \u0627\u0644\u062A\u0627\u0631\u064A\u062E\u064A\u0629 \u0627\u0644\u062A\u064A \u0627\u0646\u062A\u0647\u062A \u0628\u0641\u0648\u0632 \u0628\u0631\u0634\u0644\u0648\u0646\u0629 6-2 \u0639\u0644\u0649 \u0631\u064A\u0627\u0644 \u0645\u062F\u0631\u064A\u062F\u061F",
    correctAnswer: 4,
    source: "La Liga Records",
    playerImage: "/players/icon_xavi.jpg",
    hint: "\u0631\u0642\u0645 \u0642\u064A\u0627\u0633\u064A \u062A\u0627\u0631\u064A\u062E\u064A \u0641\u064A \u0645\u0628\u0627\u0631\u064A\u0627\u062A \u0627\u0644\u0643\u0644\u0627\u0633\u064A\u0643\u0648"
  },
  {
    id: "q_bellingham_first_season_goals",
    position: "MID",
    player: "Jude Bellingham",
    playerId: "elite_bellingham",
    season: "2023/24",
    category: "Goals",
    statisticType: "\u0623\u0647\u062F\u0627\u0641 \u0641\u064A \u062C\u0645\u064A\u0639 \u0627\u0644\u0645\u0633\u0627\u0628\u0642\u0627\u062A \u0645\u0639 \u0631\u064A\u0627\u0644 \u0645\u062F\u0631\u064A\u062F \u0628\u0645\u0648\u0633\u0645\u0647 \u0627\u0644\u0623\u0648\u0644",
    difficulty: "Pro",
    question: "\u0643\u0645 \u0647\u062F\u0641\u0627\u064B \u0623\u062D\u0631\u0632\u0647 \u062C\u0648\u062F \u0628\u064A\u0644\u064A\u0646\u062C\u0647\u0627\u0645 \u0641\u064A \u062C\u0645\u064A\u0639 \u0627\u0644\u0645\u0633\u0627\u0628\u0642\u0627\u062A \u0627\u0644\u0631\u0633\u0645\u064A\u0629 \u0645\u0639 \u0631\u064A\u0627\u0644 \u0645\u062F\u0631\u064A\u062F \u0641\u064A \u0645\u0648\u0633\u0645\u0647 \u0627\u0644\u0623\u0648\u0644 2023/24\u061F",
    correctAnswer: 23,
    source: "Real Madrid CF Official",
    playerImage: "/players/elite_bellingham.jpg"
  },
  {
    id: "q_rodri_unbeaten_games",
    position: "MID",
    player: "Rodri Hern\xE1ndez",
    playerId: "elite_rodri",
    season: "2023-2024",
    category: "Records",
    statisticType: "\u0645\u0628\u0627\u0631\u064A\u0627\u062A \u0645\u062A\u062A\u0627\u0644\u064A\u0629 \u062F\u0648\u0646 \u0647\u0632\u064A\u0645\u0629 \u0645\u0639 \u0645\u0627\u0646\u0634\u0633\u062A\u0631 \u0633\u064A\u062A\u064A \u0648\u0625\u0633\u0628\u0627\u0646\u064A\u0627",
    difficulty: "Legend",
    question: "\u0643\u0645 \u0639\u062F\u062F \u0627\u0644\u0645\u0628\u0627\u0631\u064A\u0627\u062A \u0627\u0644\u0645\u062A\u062A\u0627\u0644\u064A\u0629 \u0627\u0644\u062A\u064A \u062E\u0627\u0636\u0647\u0627 \u0631\u0648\u062F\u0631\u064A \u062F\u0648\u0646 \u0623\u0646 \u064A\u062A\u0644\u0642\u0649 \u0623\u064A \u0647\u0632\u064A\u0645\u0629 \u0641\u064A 90 \u062F\u0642\u064A\u0642\u0629 \u0645\u062D\u0642\u0642\u0627\u064B \u0623\u0637\u0648\u0644 \u0633\u0644\u0633\u0644\u0629 \u0641\u064A \u062A\u0627\u0631\u064A\u062E \u0627\u0644\u0644\u0639\u0628\u0629\u061F",
    correctAnswer: 74,
    source: "Opta / FIFA Official",
    playerImage: "/players/elite_rodri.jpg",
    hint: "\u0633\u0644\u0633\u0644\u0629 \u0627\u0645\u062A\u062F\u062A \u0644\u0623\u0643\u062B\u0631 \u0645\u0646 \u0639\u0627\u0645 \u0643\u0627\u0645\u0644"
  },
  // ================= ATT QUESTIONS =================
  {
    id: "q_messi_91_goals",
    position: "ATT",
    player: "Lionel Messi",
    playerId: "elite_messi",
    season: "2012",
    category: "Records",
    statisticType: "\u0623\u0647\u062F\u0627\u0641 \u0641\u064A \u0633\u0646\u0629 \u0645\u064A\u0644\u0627\u062F\u064A\u0629 \u0648\u0627\u062D\u062F\u0629",
    difficulty: "Pro",
    question: "\u0643\u0645 \u0639\u062F\u062F \u0627\u0644\u0623\u0647\u062F\u0627\u0641 \u0627\u0644\u062A\u0627\u0631\u064A\u062E\u064A\u0629 \u0627\u0644\u062A\u064A \u0633\u062C\u0644\u0647\u0627 \u0644\u064A\u0648\u0646\u064A\u0644 \u0645\u064A\u0633\u064A \u062E\u0644\u0627\u0644 \u0639\u0627\u0645 2012 \u0627\u0644\u0645\u064A\u0644\u0627\u062F\u064A \u0645\u062D\u0637\u0645\u0627\u064B \u0627\u0644\u0631\u0642\u0645 \u0627\u0644\u0642\u064A\u0627\u0633\u064A \u0627\u0644\u0639\u0627\u0644\u0645\u064A \u0644\u062C\u064A\u0631\u062F \u0645\u0648\u0644\u0631\u061F",
    correctAnswer: 91,
    source: "Guinness World Records / FIFA",
    playerImage: "/players/elite_messi.jpg",
    hint: "\u0627\u0644\u0631\u0642\u0645 \u0627\u0644\u0623\u0633\u0637\u0648\u0631\u064A \u0627\u0644\u0634\u0647\u064A\u0631 \u0644\u0645\u064A\u0633\u064A"
  },
  {
    id: "q_cr7_ucl_season_goals",
    position: "ATT",
    player: "Cristiano Ronaldo",
    playerId: "elite_ronaldo",
    season: "2013/14",
    category: "Champions League",
    statisticType: "\u0623\u0647\u062F\u0627\u0641 \u0641\u064A \u0645\u0648\u0633\u0645 \u0648\u0627\u062D\u062F \u0628\u062F\u0648\u0631\u064A \u0623\u0628\u0637\u0627\u0644 \u0623\u0648\u0631\u0648\u0628\u0627",
    difficulty: "Pro",
    question: "\u0643\u0645 \u0647\u062F\u0641\u0627\u064B \u0633\u062C\u0644 \u0643\u0631\u064A\u0633\u062A\u064A\u0627\u0646\u0648 \u0631\u0648\u0646\u0627\u0644\u062F\u0648 \u0641\u064A \u0645\u0648\u0633\u0645 2013/14 \u0628\u062F\u0648\u0631\u064A \u0623\u0628\u0637\u0627\u0644 \u0623\u0648\u0631\u0648\u0628\u0627\u060C \u0648\u0647\u0648 \u0627\u0644\u0631\u0642\u0645 \u0627\u0644\u0642\u064A\u0627\u0633\u064A \u0627\u0644\u062A\u0647\u062F\u064A\u0641\u064A \u0644\u0645\u0648\u0633\u0645 \u0648\u0627\u062D\u062F\u061F",
    correctAnswer: 17,
    source: "UEFA Champions League All-Time Records",
    playerImage: "/players/elite_ronaldo.jpg",
    hint: "\u0628\u064A\u0646 15 \u0648 20 \u0647\u062F\u0641\u0627\u064B"
  },
  {
    id: "q_haaland_epl_debut_goals",
    position: "ATT",
    player: "Erling Haaland",
    playerId: "elite_haaland",
    season: "2022/23",
    category: "League statistics",
    statisticType: "\u0623\u0647\u062F\u0627\u0641 \u0641\u064A \u0627\u0644\u062F\u0648\u0631\u064A \u0627\u0644\u0625\u0646\u062C\u0644\u064A\u0632\u064A \u0628\u0645\u0648\u0633\u0645\u0647 \u0627\u0644\u0623\u0648\u0644",
    difficulty: "Pro",
    question: "\u0643\u0645 \u0647\u062F\u0641\u0627\u064B \u0623\u062D\u0631\u0632 \u0625\u064A\u0631\u0644\u064A\u0646\u063A \u0647\u0627\u0644\u0627\u0646\u062F \u0641\u064A \u0627\u0644\u062F\u0648\u0631\u064A \u0627\u0644\u0625\u0646\u062C\u0644\u064A\u0632\u064A \u0627\u0644\u0645\u0645\u062A\u0627\u0632 \u0645\u0648\u0633\u0645 2022/23 \u0644\u064A\u062D\u0637\u0645 \u0627\u0644\u0631\u0642\u0645 \u0627\u0644\u0642\u064A\u0627\u0633\u064A \u0627\u0644\u062A\u0627\u0631\u064A\u062E\u064A \u0644\u0644\u0628\u0631\u064A\u0645\u064A\u0631\u0644\u064A\u062C\u061F",
    correctAnswer: 36,
    source: "Premier League Official Records",
    playerImage: "/players/elite_haaland.jpg",
    hint: "\u0643\u0633\u0631 \u0631\u0642\u0645 \u0634\u064A\u0631\u0631 \u0648\u0643\u0648\u0644 (34 \u0647\u062F\u0641\u0627\u064B)"
  },
  {
    id: "q_mbappe_wc2022_final_goals",
    position: "ATT",
    player: "Kylian Mbapp\xE9",
    playerId: "elite_mbappe",
    season: "World Cup 2022",
    category: "World Cup",
    statisticType: "\u0623\u0647\u062F\u0627\u0641 \u0641\u064A \u0646\u0647\u0627\u0626\u064A \u0643\u0623\u0633 \u0627\u0644\u0639\u0627\u0644\u0645 2022",
    difficulty: "Rookie",
    question: "\u0643\u0645 \u0647\u062F\u0641\u0627\u064B \u0633\u062C\u0644 \u0643\u064A\u0644\u064A\u0627\u0646 \u0645\u0628\u0627\u0628\u064A \u0641\u064A \u0646\u0647\u0627\u0626\u064A \u0643\u0623\u0633 \u0627\u0644\u0639\u0627\u0644\u0645 2022 \u0636\u062F \u0627\u0644\u0623\u0631\u062C\u0646\u062A\u064A\u0646 \u0645\u062D\u0642\u0642\u0627\u064B \u0647\u0627\u062A\u0631\u064A\u0643 \u062A\u0627\u0631\u064A\u062E\u064A\u0627\u064B\u061F",
    correctAnswer: 3,
    source: "FIFA World Cup Final Report",
    playerImage: "/players/elite_mbappe.jpg",
    hint: "\u062B\u0627\u0646\u064A \u0647\u0627\u062A\u0631\u064A\u0643 \u0641\u064A \u062A\u0627\u0631\u064A\u062E \u0646\u0647\u0627\u0626\u064A\u0627\u062A \u0643\u0623\u0633 \u0627\u0644\u0639\u0627\u0644\u0645"
  },
  {
    id: "q_pele_world_cups",
    position: "ATT",
    player: "Pel\xE9",
    playerId: "icon_pele",
    season: "Career",
    category: "Trophies",
    statisticType: "\u0623\u0644\u0642\u0627\u0628 \u0643\u0623\u0633 \u0627\u0644\u0639\u0627\u0644\u0645 \u0643\u0644\u0627\u0639\u0628",
    difficulty: "Rookie",
    question: "\u0643\u0645 \u0644\u0642\u0628\u0627\u064B \u0641\u064A \u0643\u0623\u0633 \u0627\u0644\u0639\u0627\u0644\u0645 \u0641\u0627\u0632 \u0628\u0647 \u0627\u0644\u0623\u0633\u0637\u0648\u0631\u0629 \u0627\u0644\u0628\u0631\u0627\u0632\u064A\u0644\u064A\u0629 \u0628\u064A\u0644\u064A\u0647 \u0643\u0644\u0627\u0639\u0628 (\u0627\u0644\u0644\u0627\u0639\u0628 \u0627\u0644\u0648\u062D\u064A\u062F \u0641\u064A \u0627\u0644\u062A\u0627\u0631\u064A\u062E \u0627\u0644\u0630\u064A \u062D\u0642\u0642 \u0647\u0630\u0627 \u0627\u0644\u0625\u0646\u062C\u0627\u0632)\u061F",
    correctAnswer: 3,
    source: "FIFA Official Trophy Records",
    playerImage: "/players/icon_pele.jpg",
    hint: "\u0623\u0639\u0648\u0627\u0645 1958\u060C 1962\u060C 1970"
  },
  {
    id: "q_salah_debut_season_goals",
    position: "ATT",
    player: "Mohamed Salah",
    playerId: "elite_salah",
    season: "2017/18",
    category: "League statistics",
    statisticType: "\u0623\u0647\u062F\u0627\u0641 \u0641\u064A \u0627\u0644\u062F\u0648\u0631\u064A \u0627\u0644\u0625\u0646\u062C\u0644\u064A\u0632\u064A \u0628\u0645\u0648\u0633\u0645\u0647 \u0627\u0644\u0623\u0648\u0644 \u0645\u0639 \u0644\u064A\u0641\u0631\u0628\u0648\u0644",
    difficulty: "Pro",
    question: "\u0643\u0645 \u0647\u062F\u0641\u0627\u064B \u0623\u062D\u0631\u0632 \u0645\u062D\u0645\u062F \u0635\u0644\u0627\u062D \u0641\u064A \u0627\u0644\u062F\u0648\u0631\u064A \u0627\u0644\u0625\u0646\u062C\u0644\u064A\u0632\u064A \u0627\u0644\u0645\u0645\u062A\u0627\u0632 \u0628\u0645\u0648\u0633\u0645\u0647 \u0627\u0644\u0623\u0648\u0644 2017/18 \u0644\u064A\u062A\u0648\u062C \u0628\u0627\u0644\u062D\u0630\u0627\u0621 \u0627\u0644\u0630\u0647\u0628\u064A\u061F",
    correctAnswer: 32,
    source: "Premier League Official Records",
    playerImage: "/players/elite_salah.jpg",
    hint: "\u0643\u0627\u0646 \u0631\u0642\u0645\u0627\u064B \u0642\u064A\u0627\u0633\u064A\u0627\u064B \u0644\u0645\u0648\u0633\u0645 \u0645\u0643\u0648\u0646 \u0645\u0646 38 \u062C\u0648\u0644\u0629"
  }
];
function getQuestionsForGame(positionOrder, excludeIds = []) {
  const chosen = [];
  const used = new Set(excludeIds);
  for (const pos of positionOrder) {
    const pool = STAT_QUESTIONS.filter((q) => q.position === pos && !used.has(q.id));
    if (pool.length > 0) {
      const selected = pool[Math.floor(Math.random() * pool.length)];
      chosen.push(selected);
      used.add(selected.id);
    } else {
      const fallbackPool = STAT_QUESTIONS.filter((q) => q.position === pos);
      const fallback = fallbackPool[Math.floor(Math.random() * fallbackPool.length)];
      chosen.push(fallback);
    }
  }
  return chosen;
}

// src/data/players.ts
var INITIAL_PLAYERS = [
  // ================= ICON LEGACY (96 - 105) =================
  {
    id: "icon_pele",
    name: "Pel\xE9",
    nationality: "Brazil",
    flag: "\u{1F1E7}\u{1F1F7}",
    club: "Santos FC",
    position: "ATT",
    detailedPosition: "ST",
    ovr: 102,
    cardType: "ICON",
    league: "Icon Legends",
    season: "1970",
    image: "/players/icon_pele.jpg",
    stats: { pac: 98, sho: 101, pas: 96, dri: 100, def: 62, phy: 88 }
  },
  {
    id: "icon_maradona",
    name: "Diego Maradona",
    nationality: "Argentina",
    flag: "\u{1F1E6}\u{1F1F7}",
    club: "SSC Napoli",
    position: "ATT",
    detailedPosition: "CAM",
    ovr: 101,
    cardType: "ICON",
    league: "Icon Legends",
    season: "1986",
    image: "/players/icon_maradona.jpg",
    stats: { pac: 95, sho: 98, pas: 100, dri: 102, def: 55, phy: 84 }
  },
  {
    id: "icon_zidane",
    name: "Zinedine Zidane",
    nationality: "France",
    flag: "\u{1F1EB}\u{1F1F7}",
    club: "Real Madrid",
    position: "MID",
    detailedPosition: "CAM",
    ovr: 99,
    cardType: "ICON",
    league: "Icon Legends",
    season: "2002",
    image: "/players/icon_zidane.jpg",
    stats: { pac: 87, sho: 94, pas: 100, dri: 98, def: 75, phy: 91 }
  },
  {
    id: "icon_ronaldinho",
    name: "Ronaldinho",
    nationality: "Brazil",
    flag: "\u{1F1E7}\u{1F1F7}",
    club: "FC Barcelona",
    position: "ATT",
    detailedPosition: "LW",
    ovr: 98,
    cardType: "ICON",
    league: "Icon Legends",
    season: "2005",
    image: "/players/icon_ronaldinho.jpg",
    stats: { pac: 94, sho: 95, pas: 96, dri: 101, def: 50, phy: 85 }
  },
  {
    id: "icon_maldini",
    name: "Paolo Maldini",
    nationality: "Italy",
    flag: "\u{1F1EE}\u{1F1F9}",
    club: "AC Milan",
    position: "DEF",
    detailedPosition: "CB",
    ovr: 99,
    cardType: "ICON",
    league: "Icon Legends",
    season: "2003",
    image: "/players/icon_maldini.jpg",
    stats: { pac: 88, sho: 60, pas: 82, dri: 80, def: 102, phy: 94 }
  },
  {
    id: "icon_beckenbauer",
    name: "Franz Beckenbauer",
    nationality: "Germany",
    flag: "\u{1F1E9}\u{1F1EA}",
    club: "Bayern Munich",
    position: "DEF",
    detailedPosition: "CB",
    ovr: 98,
    cardType: "ICON",
    league: "Icon Legends",
    season: "1974",
    image: "/players/icon_beckenbauer.jpg",
    stats: { pac: 86, sho: 80, pas: 93, dri: 89, def: 100, phy: 90 }
  },
  {
    id: "icon_buffon",
    name: "Gianluigi Buffon",
    nationality: "Italy",
    flag: "\u{1F1EE}\u{1F1F9}",
    club: "Juventus",
    position: "GK",
    detailedPosition: "GK",
    ovr: 98,
    cardType: "ICON",
    league: "Icon Legends",
    season: "2006",
    image: "/players/icon_buffon.jpg",
    stats: { pac: 70, sho: 40, pas: 75, dri: 50, def: 98, phy: 92 }
  },
  {
    id: "icon_casillas",
    name: "Iker Casillas",
    nationality: "Spain",
    flag: "\u{1F1EA}\u{1F1F8}",
    club: "Real Madrid",
    position: "GK",
    detailedPosition: "GK",
    ovr: 97,
    cardType: "ICON",
    league: "Icon Legends",
    season: "2010",
    image: "/players/icon_casillas.jpg",
    stats: { pac: 72, sho: 35, pas: 74, dri: 55, def: 97, phy: 88 }
  },
  {
    id: "icon_xavi",
    name: "Xavi Hern\xE1ndez",
    nationality: "Spain",
    flag: "\u{1F1EA}\u{1F1F8}",
    club: "FC Barcelona",
    position: "MID",
    detailedPosition: "CM",
    ovr: 97,
    cardType: "ICON",
    league: "Icon Legends",
    season: "2011",
    image: "/players/icon_xavi.jpg",
    stats: { pac: 80, sho: 82, pas: 102, dri: 94, def: 78, phy: 80 }
  },
  {
    id: "icon_iniesta",
    name: "Andr\xE9s Iniesta",
    nationality: "Spain",
    flag: "\u{1F1EA}\u{1F1F8}",
    club: "FC Barcelona",
    position: "MID",
    detailedPosition: "CM",
    ovr: 97,
    cardType: "ICON",
    league: "Icon Legends",
    season: "2010",
    image: "/players/icon_iniesta.jpg",
    stats: { pac: 83, sho: 84, pas: 100, dri: 99, def: 74, phy: 78 }
  },
  {
    id: "icon_kaka",
    name: "Kak\xE1",
    nationality: "Brazil",
    flag: "\u{1F1E7}\u{1F1F7}",
    club: "AC Milan",
    position: "MID",
    detailedPosition: "CAM",
    ovr: 97,
    cardType: "ICON",
    league: "Icon Legends",
    season: "2007",
    image: "/players/icon_kaka.jpg",
    stats: { pac: 93, sho: 91, pas: 92, dri: 96, def: 52, phy: 78 }
  },
  {
    id: "icon_delpiero",
    name: "Alessandro Del Piero",
    nationality: "Italy",
    flag: "\u{1F1EE}\u{1F1F9}",
    club: "Juventus",
    position: "ATT",
    detailedPosition: "CF",
    ovr: 96,
    cardType: "ICON",
    league: "Icon Legends",
    season: "1998",
    image: "/players/icon_delpiero.jpg",
    stats: { pac: 87, sho: 96, pas: 92, dri: 95, def: 48, phy: 75 }
  },
  {
    id: "icon_nesta",
    name: "Alessandro Nesta",
    nationality: "Italy",
    flag: "\u{1F1EE}\u{1F1F9}",
    club: "AC Milan",
    position: "DEF",
    detailedPosition: "CB",
    ovr: 97,
    cardType: "ICON",
    league: "Icon Legends",
    season: "2004",
    image: "/players/icon_nesta.jpg",
    stats: { pac: 84, sho: 40, pas: 78, dri: 72, def: 98, phy: 91 }
  },
  {
    id: "icon_chiellini",
    name: "Giorgio Chiellini",
    nationality: "Italy",
    flag: "\u{1F1EE}\u{1F1F9}",
    club: "Juventus",
    position: "DEF",
    detailedPosition: "CB",
    ovr: 96,
    cardType: "ICON",
    league: "Icon Legends",
    season: "2016",
    image: "/players/icon_chiellini.jpg",
    stats: { pac: 78, sho: 50, pas: 70, dri: 65, def: 97, phy: 95 }
  },
  // ================= ELITE RUSH (86 - 95) =================
  {
    id: "elite_messi",
    name: "Lionel Messi",
    nationality: "Argentina",
    flag: "\u{1F1E6}\u{1F1F7}",
    club: "FC Barcelona",
    position: "ATT",
    detailedPosition: "RW",
    ovr: 95,
    cardType: "ELITE",
    league: "La Liga",
    season: "2023/24",
    image: "/players/elite_messi.jpg",
    stats: { pac: 86, sho: 95, pas: 96, dri: 97, def: 42, phy: 73 }
  },
  {
    id: "elite_ronaldo",
    name: "Cristiano Ronaldo",
    nationality: "Portugal",
    flag: "\u{1F1F5}\u{1F1F9}",
    club: "Real Madrid",
    position: "ATT",
    detailedPosition: "ST",
    ovr: 95,
    cardType: "ELITE",
    league: "La Liga",
    season: "2023/24",
    image: "/players/elite_ronaldo.jpg",
    stats: { pac: 88, sho: 96, pas: 83, dri: 88, def: 45, phy: 90 }
  },
  {
    id: "elite_mbappe",
    name: "Kylian Mbapp\xE9",
    nationality: "France",
    flag: "\u{1F1EB}\u{1F1F7}",
    club: "Real Madrid",
    position: "ATT",
    detailedPosition: "ST",
    ovr: 95,
    cardType: "ELITE",
    league: "La Liga",
    season: "2024/25",
    image: "/players/elite_mbappe.jpg",
    stats: { pac: 98, sho: 93, pas: 85, dri: 94, def: 40, phy: 82 }
  },
  {
    id: "elite_haaland",
    name: "Erling Haaland",
    nationality: "Norway",
    flag: "\u{1F1F3}\u{1F1F4}",
    club: "Manchester City",
    position: "ATT",
    detailedPosition: "ST",
    ovr: 94,
    cardType: "ELITE",
    league: "Premier League",
    season: "2023/24",
    image: "/players/elite_haaland.jpg",
    stats: { pac: 91, sho: 96, pas: 75, dri: 84, def: 50, phy: 93 }
  },
  {
    id: "elite_vinicius",
    name: "Vin\xEDcius J\xFAnior",
    nationality: "Brazil",
    flag: "\u{1F1E7}\u{1F1F7}",
    club: "Real Madrid",
    position: "ATT",
    detailedPosition: "LW",
    ovr: 93,
    cardType: "ELITE",
    league: "La Liga",
    season: "2023/24",
    image: "/players/elite_vinicius.jpg",
    stats: { pac: 97, sho: 89, pas: 86, dri: 95, def: 38, phy: 78 }
  },
  {
    id: "elite_debruyne",
    name: "Kevin De Bruyne",
    nationality: "Belgium",
    flag: "\u{1F1E7}\u{1F1EA}",
    club: "Manchester City",
    position: "MID",
    detailedPosition: "CAM",
    ovr: 93,
    cardType: "ELITE",
    league: "Premier League",
    season: "2023/24",
    image: "/players/elite_debruyne.jpg",
    stats: { pac: 78, sho: 89, pas: 96, dri: 88, def: 72, phy: 80 }
  },
  {
    id: "elite_rodri",
    name: "Rodri Hern\xE1ndez",
    nationality: "Spain",
    flag: "\u{1F1EA}\u{1F1F8}",
    club: "Manchester City",
    position: "MID",
    detailedPosition: "CDM",
    ovr: 94,
    cardType: "ELITE",
    league: "Premier League",
    season: "2023/24",
    image: "/players/elite_rodri.jpg",
    stats: { pac: 73, sho: 84, pas: 90, dri: 85, def: 93, phy: 91 }
  },
  {
    id: "elite_bellingham",
    name: "Jude Bellingham",
    nationality: "England",
    flag: "\u{1F3F4}\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}\u{E007F}",
    club: "Real Madrid",
    position: "MID",
    detailedPosition: "CAM",
    ovr: 92,
    cardType: "ELITE",
    league: "La Liga",
    season: "2023/24",
    image: "/players/elite_bellingham.jpg",
    stats: { pac: 84, sho: 88, pas: 89, dri: 91, def: 83, phy: 88 }
  },
  {
    id: "elite_modric",
    name: "Luka Modri\u0107",
    nationality: "Croatia",
    flag: "\u{1F1ED}\u{1F1F7}",
    club: "Real Madrid",
    position: "MID",
    detailedPosition: "CM",
    ovr: 91,
    cardType: "ELITE",
    league: "La Liga",
    season: "2023/24",
    image: "/players/elite_modric.jpg",
    stats: { pac: 74, sho: 80, pas: 94, dri: 92, def: 75, phy: 73 }
  },
  {
    id: "elite_salah",
    name: "Mohamed Salah",
    nationality: "Egypt",
    flag: "\u{1F1EA}\u{1F1EC}",
    club: "Liverpool",
    position: "ATT",
    detailedPosition: "RW",
    ovr: 91,
    cardType: "ELITE",
    league: "Premier League",
    season: "2023/24",
    image: "/players/elite_salah.jpg",
    stats: { pac: 91, sho: 90, pas: 86, dri: 90, def: 48, phy: 79 }
  },
  {
    id: "elite_vandijk",
    name: "Virgil van Dijk",
    nationality: "Netherlands",
    flag: "\u{1F1F3}\u{1F1F1}",
    club: "Liverpool",
    position: "DEF",
    detailedPosition: "CB",
    ovr: 92,
    cardType: "ELITE",
    league: "Premier League",
    season: "2023/24",
    image: "/players/elite_vandijk.jpg",
    stats: { pac: 80, sho: 60, pas: 75, dri: 73, def: 94, phy: 90 }
  },
  {
    id: "elite_rubendias",
    name: "R\xFAben Dias",
    nationality: "Portugal",
    flag: "\u{1F1F5}\u{1F1F9}",
    club: "Manchester City",
    position: "DEF",
    detailedPosition: "CB",
    ovr: 89,
    cardType: "ELITE",
    league: "Premier League",
    season: "2023/24",
    image: "/players/elite_rubendias.jpg",
    stats: { pac: 72, sho: 45, pas: 74, dri: 72, def: 91, phy: 89 }
  },
  {
    id: "elite_rudiger",
    name: "Antonio R\xFCdiger",
    nationality: "Germany",
    flag: "\u{1F1E9}\u{1F1EA}",
    club: "Real Madrid",
    position: "DEF",
    detailedPosition: "CB",
    ovr: 88,
    cardType: "ELITE",
    league: "La Liga",
    season: "2023/24",
    image: "/players/elite_rudiger.jpg",
    stats: { pac: 86, sho: 58, pas: 73, dri: 70, def: 89, phy: 91 }
  },
  {
    id: "elite_courtois",
    name: "Thibaut Courtois",
    nationality: "Belgium",
    flag: "\u{1F1E7}\u{1F1EA}",
    club: "Real Madrid",
    position: "GK",
    detailedPosition: "GK",
    ovr: 91,
    cardType: "ELITE",
    league: "La Liga",
    season: "2023/24",
    image: "/players/elite_courtois.jpg",
    stats: { pac: 50, sho: 30, pas: 75, dri: 48, def: 92, phy: 87 }
  },
  {
    id: "elite_alisson",
    name: "Alisson Becker",
    nationality: "Brazil",
    flag: "\u{1F1E7}\u{1F1F7}",
    club: "Liverpool",
    position: "GK",
    detailedPosition: "GK",
    ovr: 90,
    cardType: "ELITE",
    league: "Premier League",
    season: "2023/24",
    image: "/players/elite_alisson.jpg",
    stats: { pac: 52, sho: 35, pas: 85, dri: 50, def: 91, phy: 86 }
  },
  {
    id: "elite_ederson",
    name: "Ederson Moraes",
    nationality: "Brazil",
    flag: "\u{1F1E7}\u{1F1F7}",
    club: "Manchester City",
    position: "GK",
    detailedPosition: "GK",
    ovr: 89,
    cardType: "ELITE",
    league: "Premier League",
    season: "2023/24",
    image: "/players/elite_ederson.jpg",
    stats: { pac: 64, sho: 30, pas: 93, dri: 55, def: 88, phy: 82 }
  },
  {
    id: "elite_kvaratskhelia",
    name: "Khvicha Kvaratskhelia",
    nationality: "Georgia",
    flag: "\u{1F1EC}\u{1F1EA}",
    club: "SSC Napoli",
    position: "ATT",
    detailedPosition: "LW",
    ovr: 88,
    cardType: "ELITE",
    league: "Serie A",
    season: "2023/24",
    image: "/players/elite_kvaratskhelia.jpg",
    stats: { pac: 90, sho: 85, pas: 84, dri: 92, def: 42, phy: 76 }
  },
  {
    id: "elite_leao",
    name: "Rafael Le\xE3o",
    nationality: "Portugal",
    flag: "\u{1F1F5}\u{1F1F9}",
    club: "AC Milan",
    position: "ATT",
    detailedPosition: "LW",
    ovr: 88,
    cardType: "ELITE",
    league: "Serie A",
    season: "2023/24",
    image: "/players/elite_leao.jpg",
    stats: { pac: 94, sho: 84, pas: 80, dri: 91, def: 35, phy: 80 }
  },
  {
    id: "elite_theo",
    name: "Theo Hern\xE1ndez",
    nationality: "France",
    flag: "\u{1F1EB}\u{1F1F7}",
    club: "AC Milan",
    position: "DEF",
    detailedPosition: "LB",
    ovr: 88,
    cardType: "ELITE",
    league: "Serie A",
    season: "2023/24",
    image: "/players/elite_theo.jpg",
    stats: { pac: 95, sho: 74, pas: 82, dri: 84, def: 82, phy: 89 }
  },
  // ================= WEEKLY PACK (77 - 85) =================
  {
    id: "wk_saka",
    name: "Bukayo Saka",
    nationality: "England",
    flag: "\u{1F3F4}\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}\u{E007F}",
    club: "Arsenal",
    position: "ATT",
    detailedPosition: "RW",
    ovr: 85,
    cardType: "WEEKLY",
    league: "Premier League",
    season: "2023/24",
    image: "/players/wk_saka.jpg",
    stats: { pac: 87, sho: 83, pas: 84, dri: 88, def: 60, phy: 75 }
  },
  {
    id: "wk_odegaard",
    name: "Martin \xD8degaard",
    nationality: "Norway",
    flag: "\u{1F1F3}\u{1F1F4}",
    club: "Arsenal",
    position: "MID",
    detailedPosition: "CAM",
    ovr: 85,
    cardType: "WEEKLY",
    league: "Premier League",
    season: "2023/24",
    image: "/players/wk_odegaard.jpg",
    stats: { pac: 78, sho: 82, pas: 90, dri: 88, def: 64, phy: 70 }
  },
  {
    id: "wk_saliba",
    name: "William Saliba",
    nationality: "France",
    flag: "\u{1F1EB}\u{1F1F7}",
    club: "Arsenal",
    position: "DEF",
    detailedPosition: "CB",
    ovr: 85,
    cardType: "WEEKLY",
    league: "Premier League",
    season: "2023/24",
    image: "/players/wk_saliba.jpg",
    stats: { pac: 82, sho: 40, pas: 74, dri: 72, def: 87, phy: 84 }
  },
  {
    id: "wk_raya",
    name: "David Raya",
    nationality: "Spain",
    flag: "\u{1F1EA}\u{1F1F8}",
    club: "Arsenal",
    position: "GK",
    detailedPosition: "GK",
    ovr: 84,
    cardType: "WEEKLY",
    league: "Premier League",
    season: "2023/24",
    image: "/players/wk_raya.jpg",
    stats: { pac: 55, sho: 25, pas: 83, dri: 45, def: 85, phy: 80 }
  },
  {
    id: "wk_pedri",
    name: "Pedri",
    nationality: "Spain",
    flag: "\u{1F1EA}\u{1F1F8}",
    club: "FC Barcelona",
    position: "MID",
    detailedPosition: "CM",
    ovr: 85,
    cardType: "WEEKLY",
    league: "La Liga",
    season: "2023/24",
    image: "/players/wk_pedri.jpg",
    stats: { pac: 80, sho: 76, pas: 87, dri: 90, def: 70, phy: 73 }
  },
  {
    id: "wk_gavi",
    name: "Gavi",
    nationality: "Spain",
    flag: "\u{1F1EA}\u{1F1F8}",
    club: "FC Barcelona",
    position: "MID",
    detailedPosition: "CM",
    ovr: 83,
    cardType: "WEEKLY",
    league: "La Liga",
    season: "2023/24",
    image: "/players/wk_gavi.jpg",
    stats: { pac: 79, sho: 72, pas: 82, dri: 85, def: 74, phy: 80 }
  },
  {
    id: "wk_araujo",
    name: "Ronald Ara\xFAjo",
    nationality: "Uruguay",
    flag: "\u{1F1FA}\u{1F1FE}",
    club: "FC Barcelona",
    position: "DEF",
    detailedPosition: "CB",
    ovr: 84,
    cardType: "WEEKLY",
    league: "La Liga",
    season: "2023/24",
    image: "/players/wk_araujo.jpg",
    stats: { pac: 81, sho: 50, pas: 68, dri: 65, def: 86, phy: 87 }
  },
  {
    id: "wk_kounde",
    name: "Jules Kound\xE9",
    nationality: "France",
    flag: "\u{1F1EB}\u{1F1F7}",
    club: "FC Barcelona",
    position: "DEF",
    detailedPosition: "RB",
    ovr: 84,
    cardType: "WEEKLY",
    league: "La Liga",
    season: "2023/24",
    image: "/players/wk_kounde.jpg",
    stats: { pac: 83, sho: 48, pas: 75, dri: 76, def: 85, phy: 81 }
  },
  {
    id: "wk_dimarco",
    name: "Federico Dimarco",
    nationality: "Italy",
    flag: "\u{1F1EE}\u{1F1F9}",
    club: "Inter Milan",
    position: "DEF",
    detailedPosition: "LB",
    ovr: 84,
    cardType: "WEEKLY",
    league: "Serie A",
    season: "2023/24",
    image: "/players/wk_dimarco.jpg",
    stats: { pac: 84, sho: 78, pas: 85, dri: 82, def: 78, phy: 76 }
  },
  {
    id: "wk_bastoni",
    name: "Alessandro Bastoni",
    nationality: "Italy",
    flag: "\u{1F1EE}\u{1F1F9}",
    club: "Inter Milan",
    position: "DEF",
    detailedPosition: "CB",
    ovr: 85,
    cardType: "WEEKLY",
    league: "Serie A",
    season: "2023/24",
    image: "/players/wk_bastoni.jpg",
    stats: { pac: 75, sho: 42, pas: 79, dri: 74, def: 87, phy: 84 }
  },
  {
    id: "wk_barella",
    name: "Nicol\xF2 Barella",
    nationality: "Italy",
    flag: "\u{1F1EE}\u{1F1F9}",
    club: "Inter Milan",
    position: "MID",
    detailedPosition: "CM",
    ovr: 85,
    cardType: "WEEKLY",
    league: "Serie A",
    season: "2023/24",
    image: "/players/wk_barella.jpg",
    stats: { pac: 80, sho: 78, pas: 86, dri: 87, def: 80, phy: 82 }
  },
  {
    id: "wk_lautaro",
    name: "Lautaro Mart\xEDnez",
    nationality: "Argentina",
    flag: "\u{1F1E6}\u{1F1F7}",
    club: "Inter Milan",
    position: "ATT",
    detailedPosition: "ST",
    ovr: 85,
    cardType: "WEEKLY",
    league: "Serie A",
    season: "2023/24",
    image: "/players/wk_lautaro.jpg",
    stats: { pac: 84, sho: 87, pas: 76, dri: 85, def: 48, phy: 84 }
  },
  {
    id: "wk_sommer",
    name: "Yann Sommer",
    nationality: "Switzerland",
    flag: "\u{1F1E8}\u{1F1ED}",
    club: "Inter Milan",
    position: "GK",
    detailedPosition: "GK",
    ovr: 84,
    cardType: "WEEKLY",
    league: "Serie A",
    season: "2023/24",
    image: "/players/wk_sommer.jpg",
    stats: { pac: 50, sho: 25, pas: 79, dri: 40, def: 85, phy: 78 }
  },
  {
    id: "wk_kimmich",
    name: "Joshua Kimmich",
    nationality: "Germany",
    flag: "\u{1F1E9}\u{1F1EA}",
    club: "Bayern Munich",
    position: "MID",
    detailedPosition: "CDM",
    ovr: 85,
    cardType: "WEEKLY",
    league: "Bundesliga",
    season: "2023/24",
    image: "/players/wk_kimmich.jpg",
    stats: { pac: 74, sho: 75, pas: 89, dri: 84, def: 84, phy: 80 }
  },
  {
    id: "wk_musiala",
    name: "Jamal Musiala",
    nationality: "Germany",
    flag: "\u{1F1E9}\u{1F1EA}",
    club: "Bayern Munich",
    position: "MID",
    detailedPosition: "CAM",
    ovr: 85,
    cardType: "WEEKLY",
    league: "Bundesliga",
    season: "2023/24",
    image: "/players/wk_musiala.jpg",
    stats: { pac: 86, sho: 81, pas: 84, dri: 92, def: 58, phy: 68 }
  },
  {
    id: "wk_davies",
    name: "Alphonso Davies",
    nationality: "Canada",
    flag: "\u{1F1E8}\u{1F1E6}",
    club: "Bayern Munich",
    position: "DEF",
    detailedPosition: "LB",
    ovr: 84,
    cardType: "WEEKLY",
    league: "Bundesliga",
    season: "2023/24",
    image: "/players/wk_davies.jpg",
    stats: { pac: 95, sho: 68, pas: 78, dri: 86, def: 77, phy: 78 }
  },
  {
    id: "wk_neuer",
    name: "Manuel Neuer",
    nationality: "Germany",
    flag: "\u{1F1E9}\u{1F1EA}",
    club: "Bayern Munich",
    position: "GK",
    detailedPosition: "GK",
    ovr: 85,
    cardType: "WEEKLY",
    league: "Bundesliga",
    season: "2023/24",
    image: "/players/wk_neuer.jpg",
    stats: { pac: 55, sho: 30, pas: 90, dri: 52, def: 86, phy: 82 }
  },
  {
    id: "wk_kane",
    name: "Harry Kane",
    nationality: "England",
    flag: "\u{1F3F4}\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}\u{E007F}",
    club: "Bayern Munich",
    position: "ATT",
    detailedPosition: "ST",
    ovr: 85,
    cardType: "WEEKLY",
    league: "Bundesliga",
    season: "2023/24",
    image: "/players/wk_kane.jpg",
    stats: { pac: 76, sho: 92, pas: 86, dri: 83, def: 52, phy: 84 }
  }
];
function getRandomPlayerByPosition(position, excludeIds = []) {
  const eligible = INITIAL_PLAYERS.filter((p) => p.position === position && !excludeIds.includes(p.id));
  if (eligible.length > 0) {
    return eligible[Math.floor(Math.random() * eligible.length)];
  }
  const fallback = INITIAL_PLAYERS.filter((p) => p.position === position);
  return fallback[Math.floor(Math.random() * fallback.length)] || INITIAL_PLAYERS.find((p) => p.position === position);
}
function getRandomPlayerByClubAndPosition(club, position) {
  const directMatches = INITIAL_PLAYERS.filter(
    (p) => p.club.toLowerCase() === club.toLowerCase() && p.position === position
  );
  if (directMatches.length > 0) {
    return directMatches[Math.floor(Math.random() * directMatches.length)];
  }
  return getRandomPlayerByPosition(position);
}
function openPackReward(tier) {
  const eligible = INITIAL_PLAYERS.filter((p) => p.cardType === tier);
  if (eligible.length === 0) return INITIAL_PLAYERS[0];
  return eligible[Math.floor(Math.random() * eligible.length)];
}

// src/data/clubs.ts
var CLUBS_DATABASE = [
  { id: "real_madrid", name: "Real Madrid", nameAr: "\u0631\u064A\u0627\u0644 \u0645\u062F\u0631\u064A\u062F", league: "La Liga", country: "Spain", primaryColor: "#f7f7f7" },
  { id: "barcelona", name: "FC Barcelona", nameAr: "\u0628\u0631\u0634\u0644\u0648\u0646\u0629", league: "La Liga", country: "Spain", primaryColor: "#a50044" },
  { id: "man_city", name: "Manchester City", nameAr: "\u0645\u0627\u0646\u0634\u0633\u062A\u0631 \u0633\u064A\u062A\u064A", league: "Premier League", country: "England", primaryColor: "#6cabdd" },
  { id: "arsenal", name: "Arsenal", nameAr: "\u0623\u0631\u0633\u0646\u0627\u0644", league: "Premier League", country: "England", primaryColor: "#ef0107" },
  { id: "bayern", name: "Bayern Munich", nameAr: "\u0628\u0627\u064A\u0631\u0646 \u0645\u064A\u0648\u0646\u062E", league: "Bundesliga", country: "Germany", primaryColor: "#dc052d" },
  { id: "liverpool", name: "Liverpool", nameAr: "\u0644\u064A\u0641\u0631\u0628\u0648\u0644", league: "Premier League", country: "England", primaryColor: "#c8102e" },
  { id: "inter", name: "Inter Milan", nameAr: "\u0625\u0646\u062A\u0631 \u0645\u064A\u0644\u0627\u0646", league: "Serie A", country: "Italy", primaryColor: "#001489" },
  { id: "juventus", name: "Juventus", nameAr: "\u064A\u0648\u0641\u0646\u062A\u0648\u0633", league: "Serie A", country: "Italy", primaryColor: "#000000" },
  { id: "milan", name: "AC Milan", nameAr: "\u0625\u064A\u0647 \u0633\u064A \u0645\u064A\u0644\u0627\u0646", league: "Serie A", country: "Italy", primaryColor: "#fb090b" },
  { id: "napoli", name: "SSC Napoli", nameAr: "\u0646\u0627\u0628\u0648\u0644\u064A", league: "Serie A", country: "Italy", primaryColor: "#12a0d7" },
  { id: "santos", name: "Santos FC", nameAr: "\u0633\u0627\u0646\u062A\u0648\u0633", league: "Icon Club", country: "Brazil", primaryColor: "#ffffff" }
];
function getRandomClubsForRound(count = 4) {
  const shuffled = [...CLUBS_DATABASE].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// src/services/positions.ts
var QUICK_FIVE_POSITIONS = [
  "GK",
  "DEF",
  "MID",
  "ATT",
  "ATT"
];
var FULL_ELEVEN_POSITIONS = [
  "GK",
  "DEF",
  "DEF",
  "DEF",
  "DEF",
  "MID",
  "MID",
  "MID",
  "ATT",
  "ATT",
  "ATT"
];
function getPositionOrder(mode) {
  return mode === "quick_five" ? [...QUICK_FIVE_POSITIONS] : [...FULL_ELEVEN_POSITIONS];
}

// server/rankingManager.ts
var RankingManager = class {
  constructor() {
    this.players = /* @__PURE__ */ new Map();
    this.lastUpdateTimestamp = Date.now();
  }
  /**
   * Registers or updates a real user profile on the server ranking list
   */
  syncUserProfile(userId, username, avatar) {
    let player = this.players.get(userId);
    if (!player) {
      player = {
        id: userId,
        rank: 0,
        username: username || "\u0645\u062F\u0631\u0628 \u062C\u0648\u0627\u0644\u064A\u0643\u0633",
        avatar: avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80",
        points: 0,
        played: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDiff: 0,
        winRate: 0,
        streak: "-",
        countryFlag: "\u26BD",
        lastUpdated: Date.now()
      };
      this.players.set(userId, player);
    } else {
      if (username) player.username = username;
      if (avatar) player.avatar = avatar;
    }
    this.lastUpdateTimestamp = Date.now();
    return player;
  }
  /**
   * Authoritative match result recording exclusively for Real Online Rooms
   * Win: 3 points
   * Draw: 1 point
   * Loss: 0 points
   */
  recordRoomMatch(hostId, hostName, hostAvatar, hostGoals, guestId, guestName, guestAvatar, guestGoals) {
    const host = this.syncUserProfile(hostId, hostName, hostAvatar);
    const guest = this.syncUserProfile(guestId, guestName, guestAvatar);
    host.played += 1;
    guest.played += 1;
    host.goalsFor += hostGoals;
    host.goalsAgainst += guestGoals;
    host.goalDiff = host.goalsFor - host.goalsAgainst;
    guest.goalsFor += guestGoals;
    guest.goalsAgainst += hostGoals;
    guest.goalDiff = guest.goalsFor - guest.goalsAgainst;
    if (hostGoals > guestGoals) {
      host.wins += 1;
      host.points += 3;
      host.streak = "W";
      guest.losses += 1;
      guest.streak = "L";
    } else if (guestGoals > hostGoals) {
      guest.wins += 1;
      guest.points += 3;
      guest.streak = "W";
      host.losses += 1;
      host.streak = "L";
    } else {
      host.draws += 1;
      host.points += 1;
      host.streak = "D";
      guest.draws += 1;
      guest.points += 1;
      guest.streak = "D";
    }
    host.winRate = Math.round(host.wins / host.played * 100);
    guest.winRate = Math.round(guest.wins / guest.played * 100);
    host.lastUpdated = Date.now();
    guest.lastUpdated = Date.now();
    this.lastUpdateTimestamp = Date.now();
  }
  /**
   * Returns current sorted leaderboard with rank recalculation (real accounts only)
   */
  getLeaderboard(currentUserId) {
    const list = Array.from(this.players.values()).sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff;
      if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
      return b.wins - a.wins;
    });
    list.forEach((p, idx) => {
      p.rank = idx + 1;
    });
    const currentUser = currentUserId ? list.find((p) => p.id === currentUserId) : void 0;
    return {
      players: list,
      currentUser,
      totalPlayers: list.length,
      lastUpdated: this.lastUpdateTimestamp
    };
  }
};
var rankingManager = new RankingManager();

// server/adminDb.ts
import fs from "fs";
import path from "path";
var INITIAL_STORE_PRODUCTS = [
  // 1. 🪙 Coins Packages
  {
    id: "coins_500",
    name: "Bronze Coins Pouch",
    nameAr: "\u062D\u0632\u0645\u0629 \u0643\u0648\u064A\u0646\u0632 \u0628\u0631\u0648\u0646\u0632\u064A\u0629 (500 \u0643\u0648\u064A\u0646\u0632)",
    category: "coins",
    price: 500,
    rarity: "common",
    description: "Grant 500 Coins directly to your account",
    descriptionAr: "\u0631\u0635\u064A\u062F 500 \u0643\u0648\u064A\u0646\u0632 \u0644\u0644\u0627\u0633\u062A\u062E\u062F\u0627\u0645 \u0641\u064A \u0641\u062A\u062D \u0627\u0644\u062D\u0632\u0645 \u0648\u0634\u0631\u0627\u0621 \u0639\u0646\u0627\u0635\u0631 \u0627\u0644\u0645\u062A\u062C\u0631 \u0627\u0644\u0641\u0627\u062E\u0631\u0629.",
    image: "https://images.unsplash.com/photo-1618042164219-62c820f10723?auto=format&fit=crop&w=300&q=80",
    icon: "Coins",
    isFeatured: false,
    isNew: false,
    isActive: true,
    purchasedCount: 42
  },
  {
    id: "coins_1500",
    name: "Silver Coins Chest",
    nameAr: "\u0635\u0646\u062F\u0648\u0642 \u0643\u0648\u064A\u0646\u0632 \u0641\u0636\u064A (1500 \u0643\u0648\u064A\u0646\u0632)",
    category: "coins",
    price: 1500,
    rarity: "rare",
    description: "Grant 1500 Coins with a 15% bonus value",
    descriptionAr: "\u0631\u0635\u064A\u062F 1500 \u0643\u0648\u064A\u0646\u0632 \u0645\u062B\u0627\u0644\u064A \u0644\u0627\u0642\u062A\u0646\u0627\u0621 \u062D\u0632\u0645 \u0627\u0644\u0646\u062E\u0628\u0629 \u0648\u0625\u0637\u0627\u0631\u0627\u062A \u0627\u0644\u0634\u0627\u062A \u0627\u0644\u062D\u0635\u0631\u064A\u0629.",
    image: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=300&q=80",
    icon: "Sparkles",
    isFeatured: true,
    isNew: false,
    isActive: true,
    purchasedCount: 95
  },
  {
    id: "coins_3500",
    name: "Golden Coins Vault",
    nameAr: "\u062E\u0632\u064A\u0646\u0629 \u0643\u0648\u064A\u0646\u0632 \u0630\u0647\u0628\u064A\u0629 (3500 \u0643\u0648\u064A\u0646\u0632)",
    category: "coins",
    price: 3500,
    rarity: "epic",
    description: "Grant 3500 Coins for true football masters",
    descriptionAr: "\u062E\u0632\u064A\u0646\u0629 \u0630\u0647\u0628\u064A\u0629 \u0636\u062E\u0645\u0629 \u062A\u0645\u0646\u062D\u0643 3500 \u0643\u0648\u064A\u0646\u0632 \u0644\u0634\u0631\u0627\u0621 \u0643\u0644 \u0645\u0627 \u062A\u0631\u063A\u0628 \u0628\u0647 \u0641\u064A GOALIX.",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=300&q=80",
    icon: "Crown",
    isFeatured: false,
    isNew: true,
    isActive: true,
    purchasedCount: 28
  },
  // 2. 🎁 Packs (3D Boxes)
  {
    id: "pack_weekly",
    name: "Weekly Booster Pack",
    nameAr: "\u062D\u0632\u0645\u0629 \u0627\u0644\u0623\u0633\u0628\u0648\u0639 (Weekly Pack)",
    category: "packs",
    price: 50,
    rarity: "common",
    description: "77-85 OVR Current Season Top Stars",
    descriptionAr: "\u0646\u062C\u0648\u0645 \u0627\u0644\u062F\u0648\u0631\u064A\u0627\u062A \u0627\u0644\u0643\u0628\u0631\u0649 \u0627\u0644\u0645\u062A\u0623\u0644\u0642\u0648\u0646 \u0647\u0630\u0627 \u0627\u0644\u0623\u0633\u0628\u0648\u0639 \u0628\u062A\u0642\u064A\u064A\u0645 77 \u0625\u0644\u0649 85 OVR.",
    image: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=300&q=80",
    tier: "WEEKLY",
    isFeatured: false,
    isNew: false,
    isActive: true,
    purchasedCount: 140
  },
  {
    id: "pack_elite",
    name: "Elite Rush Vault",
    nameAr: "\u0646\u062E\u0628\u0629 \u0627\u0644\u0639\u0627\u0644\u0645 (Elite Rush Pack)",
    category: "packs",
    price: 250,
    rarity: "epic",
    description: "86-95 OVR World-Class Superstars",
    descriptionAr: "\u0635\u0641\u0648\u0629 \u0646\u062C\u0648\u0645 \u0627\u0644\u0639\u0627\u0644\u0645 \u0648\u0623\u0628\u0631\u0632 \u0627\u0644\u0645\u0631\u0634\u062D\u064A\u0646 \u0644\u0644\u0643\u0631\u0629 \u0627\u0644\u0630\u0647\u0628\u064A\u0629 \u0628\u062A\u0642\u064A\u064A\u0645 86 \u0625\u0644\u0649 95 OVR.",
    image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=300&q=80",
    tier: "ELITE",
    isFeatured: true,
    isNew: false,
    isActive: true,
    purchasedCount: 215
  },
  {
    id: "pack_icon",
    name: "Icon Legacy Masterpiece",
    nameAr: "\u0623\u0633\u0627\u0637\u064A\u0631 \u0627\u0644\u0645\u0633\u062A\u062F\u064A\u0631\u0629 (Icon Legacy Pack)",
    category: "packs",
    price: 500,
    rarity: "legendary",
    description: "96-105 OVR All-Time Legendary Icons",
    descriptionAr: "\u0623\u0639\u0638\u0645 \u0623\u0633\u0627\u0637\u064A\u0631 \u0643\u0631\u0629 \u0627\u0644\u0642\u062F\u0645 \u0639\u0628\u0631 \u0627\u0644\u062A\u0627\u0631\u064A\u062E (\u0628\u064A\u0644\u064A\u0647\u060C \u0645\u0627\u0631\u0627\u062F\u0648\u0646\u0627\u060C \u0632\u064A\u062F\u0627\u0646\u060C \u0631\u0648\u0646\u0627\u0644\u062F\u064A\u0646\u064A\u0648).",
    image: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=300&q=80",
    tier: "ICON",
    isFeatured: true,
    isNew: false,
    isActive: true,
    purchasedCount: 180
  },
  // 3. 💬 Chat Messages
  {
    id: "chat_hattrick",
    name: "Hattrick Hero Message",
    nameAr: "\u0634\u0639\u0627\u0631: \u0647\u0627\u062A\u0631\u064A\u0643 \u062A\u0627\u0631\u064A\u062E\u064A \u064A\u0627 \u0643\u0627\u0628\u062A\u0646! \u26BD\u26BD\u26BD",
    category: "chat_messages",
    price: 80,
    rarity: "common",
    description: "Celebrate scoring or winning rounds with flair",
    descriptionAr: "\u0639\u0628\u0627\u0631\u0629 \u0635\u0648\u062A\u064A\u0629 \u0648\u0646\u0635\u064A\u0629 \u062D\u0645\u0627\u0633\u064A\u0629 \u062A\u0638\u0647\u0631 \u0641\u064A \u0634\u0627\u062A \u0627\u0644\u063A\u0631\u0641\u0629 \u0639\u0646\u062F \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u0623\u0647\u062F\u0627\u0641.",
    image: "https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=300&q=80",
    isFeatured: false,
    isNew: false,
    isActive: true,
    purchasedCount: 52
  },
  {
    id: "chat_guardiola",
    name: "Tactical Genius Message",
    nameAr: "\u0634\u0639\u0627\u0631: \u062A\u0643\u062A\u064A\u0643 \u062C\u0648\u0627\u0631\u062F\u064A\u0648\u0644\u0627 \u0644\u0627 \u064A\u0631\u062D\u0645! \u{1F9E0}",
    category: "chat_messages",
    price: 100,
    rarity: "rare",
    description: "Assert tactical dominance in online matches",
    descriptionAr: "\u0627\u0633\u062A\u0641\u0632\u0627\u0632 \u062A\u0643\u062A\u064A\u0643\u064A \u0631\u0627\u0642\u064D \u064A\u0624\u0643\u062F \u062A\u0641\u0648\u0642 \u062E\u0637\u062A\u0643 \u0648\u0642\u0631\u0627\u0621\u062A\u0643 \u0644\u0623\u0633\u0626\u0644\u0629 \u0627\u0644\u0645\u0646\u0627\u0641\u0633.",
    image: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=300&q=80",
    isFeatured: false,
    isNew: true,
    isActive: true,
    purchasedCount: 39
  },
  {
    id: "chat_crossbar",
    name: "Crossbar Luck Message",
    nameAr: "\u0634\u0639\u0627\u0631: \u0627\u0644\u0642\u0627\u0626\u0645 \u0648\u0627\u0644\u0639\u0627\u0631\u0636\u0629 \u0623\u0635\u062F\u0642\u0627\u0626\u064A \u0627\u0644\u064A\u0648\u0645! \u{1F945}",
    category: "chat_messages",
    price: 90,
    rarity: "common",
    description: "Use when surviving close calls or simulation saves",
    descriptionAr: "\u0634\u0639\u0627\u0631 \u0634\u0627\u062A \u062E\u0641\u064A\u0641 \u0627\u0644\u0638\u0644 \u064A\u0638\u0647\u0631 \u0639\u0646\u062F \u062A\u0641\u0627\u062F\u064A \u0627\u0644\u0647\u0632\u0627\u0626\u0645 \u0628\u0641\u0627\u0631\u0642 \u0636\u0626\u064A\u0644.",
    image: "https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=300&q=80",
    isFeatured: false,
    isNew: false,
    isActive: true,
    purchasedCount: 31
  },
  {
    id: "chat_remontada",
    name: "Last Minute Remontada",
    nameAr: "\u0634\u0639\u0627\u0631: \u0631\u064A\u0645\u0648\u0646\u062A\u0627\u062F\u0627 \u0641\u064A \u0627\u0644\u062B\u0648\u0627\u0646\u064A \u0627\u0644\u0623\u062E\u064A\u0631\u0629! \u23F3\u{1F525}",
    category: "chat_messages",
    price: 120,
    rarity: "epic",
    description: "Epic comeback shoutout in live rooms",
    descriptionAr: "\u0631\u0633\u0627\u0644\u0629 \u0646\u0627\u0631\u064A\u0629 \u0639\u0646\u062F \u0642\u0644\u0628 \u0627\u0644\u0646\u062A\u064A\u062C\u0629 \u0641\u064A \u0627\u0644\u062C\u0648\u0644\u0627\u062A \u0627\u0644\u062D\u0627\u0633\u0645\u0629 \u0644\u0644\u0645\u0628\u0627\u0631\u0627\u0629.",
    image: "https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=300&q=80",
    isFeatured: true,
    isNew: false,
    isActive: true,
    purchasedCount: 68
  },
  // 4. ✨ Chat Effects
  {
    id: "effect_fire",
    name: "Blazing Aura Effect",
    nameAr: "\u062A\u0623\u062B\u064A\u0631: \u0634\u0639\u0644\u0629 \u0627\u0644\u0644\u0647\u0628 \u0627\u0644\u0645\u062A\u0648\u0647\u062C\u0629 (Blazing Aura)",
    category: "chat_effects",
    price: 300,
    rarity: "epic",
    description: "Glow messages with fiery animated embers in room chat",
    descriptionAr: "\u064A\u062D\u0648\u0644 \u0631\u0633\u0627\u0626\u0644\u0643 \u0641\u064A \u0627\u0644\u0634\u0627\u062A \u0625\u0644\u0649 \u0644\u0647\u0628 \u0645\u062A\u0642\u062F \u0628\u0623\u0644\u0648\u0627\u0646 \u0628\u0631\u062A\u0642\u0627\u0644\u064A\u0629 \u0646\u0627\u0631\u064A\u0629 \u0645\u062A\u0648\u0647\u062C\u0629.",
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=300&q=80",
    isFeatured: true,
    isNew: false,
    isActive: true,
    purchasedCount: 84
  },
  {
    id: "effect_thunder",
    name: "Thunderbolt Spark",
    nameAr: "\u062A\u0623\u062B\u064A\u0631: \u0627\u0644\u0635\u0627\u0639\u0642\u0629 \u0627\u0644\u0643\u0647\u0631\u0628\u0627\u0626\u064A\u0629 (Thunder Spark)",
    category: "chat_effects",
    price: 350,
    rarity: "epic",
    description: "Electric blue storm ripples across your messages",
    descriptionAr: "\u0635\u0648\u0627\u0639\u0642 \u0632\u0631\u0642\u0627\u0621 \u0633\u0627\u064A\u0628\u0631\u0627\u0646\u064A\u0629 \u062A\u062D\u064A\u0637 \u0628\u0627\u0633\u0645\u0643 \u0648\u0631\u0633\u0627\u0626\u0644\u0643 \u062F\u0627\u062E\u0644 \u063A\u0631\u0641 \u0627\u0644\u0644\u0639\u0628.",
    image: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=300&q=80",
    isFeatured: false,
    isNew: true,
    isActive: true,
    purchasedCount: 46
  },
  {
    id: "effect_royal_crown",
    name: "Royal Gold Crown Effect",
    nameAr: "\u062A\u0623\u062B\u064A\u0631: \u0627\u0644\u062A\u0627\u062C \u0627\u0644\u0645\u0644\u0643\u064A \u0627\u0644\u0645\u0630\u0647\u0628 (Royal Gold)",
    category: "chat_effects",
    price: 450,
    rarity: "legendary",
    description: "Golden royal glow and crown particle effects",
    descriptionAr: "\u062A\u0627\u062C \u0645\u0644\u0643\u064A \u0630\u0647\u0628\u064A \u064A\u0644\u0645\u0639 \u0641\u0648\u0642 \u0643\u0644 \u0631\u0633\u0627\u0644\u0629 \u0645\u0639 \u0628\u0631\u064A\u0642 \u0630\u0647\u0628\u064A \u0641\u0627\u062E\u0631.",
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=300&q=80",
    isFeatured: true,
    isNew: false,
    isActive: true,
    purchasedCount: 62
  },
  // 5. 🖼️ Profile Items
  {
    id: "frame_gold_24k",
    name: "24K Gold Champion Frame",
    nameAr: "\u0625\u0637\u0627\u0631 \u0627\u0644\u0623\u0633\u0627\u0637\u064A\u0631 \u0627\u0644\u0630\u0647\u0628\u064A 24K (Champion Frame)",
    category: "profile_items",
    price: 400,
    rarity: "legendary",
    description: "Gleaming 24K gold border around your profile avatar",
    descriptionAr: "\u0625\u0637\u0627\u0631 \u0630\u0647\u0628\u064A \u0646\u0642\u064A \u062B\u0644\u0627\u062B\u064A \u0627\u0644\u0623\u0628\u0639\u0627\u062F \u064A\u062D\u064A\u0637 \u0628\u0635\u0648\u0631\u062A\u0643 \u0627\u0644\u0634\u062E\u0635\u064A\u0629 \u0641\u064A \u0643\u0644 \u0645\u0643\u0627\u0646 \u0628\u0627\u0644\u0644\u0639\u0628\u0629.",
    image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=300&q=80",
    isFeatured: true,
    isNew: false,
    isActive: true,
    purchasedCount: 77
  },
  {
    id: "frame_cyber_neon",
    name: "Cyberpunk Neon Ring",
    nameAr: "\u0625\u0637\u0627\u0631 \u0627\u0644\u0633\u0627\u064A\u0628\u0631\u0628\u0627\u0646\u0643 \u0627\u0644\u0646\u064A\u0648\u0646 (Neon Ring Frame)",
    category: "profile_items",
    price: 350,
    rarity: "rare",
    description: "Futuristic cyan and magenta pulsing avatar frame",
    descriptionAr: "\u062D\u0644\u0642\u0629 \u0646\u064A\u0648\u0646 \u0632\u0631\u0642\u0627\u0621 \u0633\u0645\u0627\u0648\u064A\u0629 \u062A\u0646\u0628\u0636 \u062D\u0648\u0644 \u0635\u0648\u0631\u062A\u0643 \u0627\u0644\u0634\u062E\u0635\u064A\u0629.",
    image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=300&q=80",
    isFeatured: false,
    isNew: true,
    isActive: true,
    purchasedCount: 51
  },
  {
    id: "bg_wembley",
    name: "Wembley Night Stadium Backdrop",
    nameAr: "\u062E\u0644\u0641\u064A\u0629: \u0633\u062A\u0627\u062F \u0648\u064A\u0645\u0628\u0644\u064A \u0627\u0644\u0644\u064A\u0644\u064A (Wembley Night)",
    category: "profile_items",
    price: 250,
    rarity: "rare",
    description: "Illuminated Wembley pitch background for your profile",
    descriptionAr: "\u062E\u0644\u0641\u064A\u0629 \u0645\u0647\u064A\u0628\u0629 \u0644\u0623\u0636\u0648\u0627\u0621 \u0633\u062A\u0627\u062F \u0648\u064A\u0645\u0628\u0644\u064A \u0627\u0644\u0634\u0647\u064A\u0631 \u062A\u062A\u0635\u062F\u0631 \u0645\u0644\u0641\u0643 \u0627\u0644\u0634\u062E\u0635\u064A.",
    image: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=300&q=80",
    isFeatured: false,
    isNew: false,
    isActive: true,
    purchasedCount: 38
  },
  {
    id: "badge_goat",
    name: "GOAT Certified Crest",
    nameAr: "\u0634\u0627\u0631\u0629: \u0628\u0637\u0644 \u0627\u0644\u0642\u0631\u0646 \u0627\u0644\u0643\u0631\u0648\u064A (GOAT Certified)",
    category: "profile_items",
    price: 500,
    rarity: "legendary",
    description: "Official crest proving absolute football supremacy",
    descriptionAr: "\u0648\u0633\u0627\u0645 \u0631\u0633\u0645\u064A \u064A\u0638\u0647\u0631 \u0628\u062C\u0627\u0646\u0628 \u0627\u0633\u0645\u0643 \u064A\u0624\u0643\u062F \u062A\u0635\u0646\u064A\u0641\u0643 \u0643\u0623\u062D\u062F \u0623\u0639\u0638\u0645 \u0627\u0644\u0645\u062F\u0631\u0628\u064A\u0646.",
    image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=300&q=80",
    isFeatured: true,
    isNew: false,
    isActive: true,
    purchasedCount: 44
  },
  // 6. 🏆 Special Items
  {
    id: "title_tactician",
    name: "Master Tactician Title",
    nameAr: "\u0644\u0642\u0628: \u0627\u0644\u0623\u0633\u062A\u0627\u0630 \u0627\u0644\u062A\u0643\u062A\u064A\u0643\u064A (Tactical Master)",
    category: "special_items",
    price: 300,
    rarity: "rare",
    description: "Exclusive title displayed below your username in rooms",
    descriptionAr: "\u0644\u0642\u0628 \u0641\u062E\u0631\u064A \u064A\u0638\u0647\u0631 \u062A\u062D\u062A \u0627\u0633\u0645\u0643 \u0641\u064A \u0627\u0644\u063A\u0631\u0641 \u0648\u062C\u062F\u0627\u0648\u0644 \u0627\u0644\u062A\u0631\u062A\u064A\u0628.",
    image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=300&q=80",
    isFeatured: false,
    isNew: false,
    isActive: true,
    purchasedCount: 29
  },
  {
    id: "shield_clasico",
    name: "El Clasico Honorary Shield",
    nameAr: "\u062F\u0631\u0639 \u0627\u0644\u0643\u0644\u0627\u0633\u064A\u0643\u0648 \u0627\u0644\u0641\u062E\u0631\u064A (El Clasico Shield)",
    category: "special_items",
    price: 400,
    rarity: "epic",
    description: "Commemorative shield badge for your collection showcase",
    descriptionAr: "\u062F\u0631\u0639 \u062A\u0630\u0643\u0627\u0631\u064A \u0646\u0627\u062F\u064D \u0645\u062E\u0635\u0635 \u0644\u0644\u0645\u062F\u0631\u0628\u064A\u0646 \u0630\u0648\u064A \u0627\u0644\u062E\u0628\u0631\u0629 \u0627\u0644\u062A\u0643\u062A\u064A\u0643\u064A\u0629.",
    image: "https://images.unsplash.com/photo-1533227268428-f9ed0900fb3b?auto=format&fit=crop&w=300&q=80",
    isFeatured: false,
    isNew: true,
    isActive: true,
    purchasedCount: 22
  },
  // 7. 🔥 Limited Items
  {
    id: "limited_founder_2026",
    name: "GOALIX 2026 Founder Edition",
    nameAr: "\u0634\u0627\u0631\u0629 \u0627\u0644\u0645\u0624\u0633\u0633 \u0627\u0644\u0630\u0647\u0628\u064A\u0629 GOALIX 2026 (Founder Edition)",
    category: "limited_items",
    price: 800,
    rarity: "mythic",
    description: "Ultra rare permanent commemorative badge for early supporters",
    descriptionAr: "\u0625\u0635\u062F\u0627\u0631 \u0645\u062D\u062F\u0648\u062F \u0648\u0646\u0627\u062F\u0631 \u062C\u062F\u0627\u064B \u064A\u0645\u0646\u062D\u0643 \u0634\u0627\u0631\u0629 \u0627\u0644\u0645\u0624\u0633\u0633 \u0627\u0644\u0630\u0647\u0628\u064A\u0629 \u0627\u0644\u0645\u0639\u062A\u0645\u062F\u0629 \u0644\u0639\u0627\u0645 2026.",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80",
    isFeatured: true,
    isLimited: true,
    isNew: true,
    isActive: true,
    purchasedCount: 16,
    stock: 50
  },
  {
    id: "limited_secret_icon",
    name: "Secret Mythic Voucher",
    nameAr: "\u0642\u0633\u064A\u0645\u0629 \u0623\u0633\u0637\u0648\u0631\u0629 \u0633\u0631\u064A\u0629 \u062E\u0627\u0631\u0642\u0629 (Mythic Icon Pass)",
    category: "limited_items",
    price: 1e3,
    rarity: "mythic",
    description: "Direct ticket granting guaranteed 100+ OVR Icon Legend",
    descriptionAr: "\u062A\u0630\u0643\u0631\u0629 \u062D\u0635\u0631\u064A\u0629 \u0645\u0636\u0645\u0648\u0646\u0629 \u062A\u0645\u0646\u062D\u0643 \u0644\u0627\u0639\u0628\u0627\u064B \u0623\u0633\u0637\u0648\u0631\u064A\u0627\u064B \u062E\u0627\u0631\u0642\u0627\u064B \u0628\u062A\u0642\u064A\u064A\u0645 \u064A\u0641\u0648\u0642 100 OVR \u0641\u0648\u0631\u0627\u064B.",
    image: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=300&q=80",
    isFeatured: true,
    isLimited: true,
    isNew: false,
    isActive: true,
    purchasedCount: 12,
    stock: 25
  }
];
var AdminDatabase = class {
  constructor() {
    this.users = /* @__PURE__ */ new Map();
    this.products = /* @__PURE__ */ new Map();
    this.matchLogs = [];
    this.adminLogs = [];
    this.dbFilePath = path.resolve("server_db_store.json");
    this.initDefaultProducts();
    this.loadFromDisk();
    this.ensureAdminUser();
    this.migrateAccountIds();
  }
  initDefaultProducts() {
    INITIAL_STORE_PRODUCTS.forEach((p) => {
      this.products.set(p.id, { ...p });
    });
  }
  generateAccountId() {
    let id;
    do {
      const rand = Math.floor(1e5 + Math.random() * 9e5);
      id = `GX-${rand}`;
    } while (Array.from(this.users.values()).some((u) => u.accountId === id));
    return id;
  }
  migrateAccountIds() {
    let modified = false;
    this.users.forEach((user) => {
      if (!user.accountId) {
        user.accountId = this.generateAccountId();
        modified = true;
      }
      if (!Array.isArray(user.inventory)) {
        user.inventory = [];
        modified = true;
      }
      if (!Array.isArray(user.purchaseHistory)) {
        user.purchaseHistory = [];
        modified = true;
      }
      if (typeof user.matchesDrawn !== "number") {
        user.matchesDrawn = 0;
        modified = true;
      }
      if (typeof user.matchesLost !== "number") {
        user.matchesLost = Math.max(0, user.matchesPlayed - user.matchesWon);
        modified = true;
      }
    });
    if (modified) {
      this.saveToDisk();
    }
  }
  loadFromDisk() {
    try {
      if (fs.existsSync(this.dbFilePath)) {
        const raw = fs.readFileSync(this.dbFilePath, "utf-8");
        const data = JSON.parse(raw);
        if (data.users && Array.isArray(data.users)) {
          data.users.forEach((u) => this.users.set(u.id, u));
        }
        if (data.products && Array.isArray(data.products)) {
          data.products.forEach((p) => this.products.set(p.id, p));
        }
        if (data.matchLogs && Array.isArray(data.matchLogs)) {
          this.matchLogs = data.matchLogs;
        }
        if (data.adminLogs && Array.isArray(data.adminLogs)) {
          this.adminLogs = data.adminLogs;
        }
      }
    } catch {
    }
  }
  saveToDisk() {
    try {
      const data = {
        users: Array.from(this.users.values()),
        products: Array.from(this.products.values()),
        matchLogs: this.matchLogs.slice(-200),
        adminLogs: this.adminLogs.slice(-200),
        lastBackup: Date.now()
      };
      fs.writeFileSync(this.dbFilePath, JSON.stringify(data, null, 2), "utf-8");
    } catch {
    }
  }
  ensureAdminUser() {
    const adminId = "dev_mahmoud_salama";
    if (!this.users.has(adminId)) {
      this.users.set(adminId, {
        id: adminId,
        accountId: "GX-999999",
        username: "\u0645\u062D\u0645\u0648\u062F \u0623\u062D\u0645\u062F \u0633\u0644\u0627\u0645\u0629",
        email: "admin@goalix.pro",
        passwordHash: "salama2026",
        role: "admin",
        coins: 99999,
        bids: 999,
        points: 99,
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
        inventory: ["frame_gold_24k", "effect_royal_crown", "badge_goat", "limited_founder_2026"],
        purchaseHistory: [],
        matchesPlayed: 35,
        matchesWon: 33,
        matchesDrawn: 2,
        matchesLost: 0,
        createdAt: 17e11,
        lastLogin: Date.now()
      });
      this.saveToDisk();
    }
  }
  // ================= USER ACCOUNT MANAGEMENT =================
  registerUser(username, passwordHash, avatar, email) {
    const cleanUsername = username.trim();
    if (!cleanUsername) {
      throw new Error("\u064A\u0631\u062C\u0649 \u0625\u062F\u062E\u0627\u0644 \u0627\u0633\u0645 \u0627\u0644\u0645\u062F\u0631\u0628");
    }
    const existing = Array.from(this.users.values()).find(
      (u) => u.username.trim().toLowerCase() === cleanUsername.toLowerCase()
    );
    if (existing) {
      throw new Error("\u0627\u0633\u0645 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u0645\u0633\u062C\u0644 \u0628\u0627\u0644\u0641\u0639\u0644\u060C \u064A\u0631\u062C\u0649 \u0627\u062E\u062A\u064A\u0627\u0631 \u0627\u0633\u0645 \u0622\u062E\u0631 \u0623\u0648 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644");
    }
    const newUser = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      accountId: this.generateAccountId(),
      username: cleanUsername,
      email,
      passwordHash: passwordHash || "123456",
      role: "player",
      coins: 100,
      // Welcome grant
      bids: 20,
      points: 0,
      avatar: avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
      inventory: [],
      purchaseHistory: [],
      matchesPlayed: 0,
      matchesWon: 0,
      matchesDrawn: 0,
      matchesLost: 0,
      createdAt: Date.now(),
      lastLogin: Date.now()
    };
    this.users.set(newUser.id, newUser);
    this.saveToDisk();
    return newUser;
  }
  authenticate(usernameOrAccountId, passwordHash) {
    const query = usernameOrAccountId.trim().toLowerCase();
    if (query === "\u0645\u062D\u0645\u0648\u062F \u0623\u062D\u0645\u062F \u0633\u0644\u0627\u0645\u0629" || query === "\u0645\u062D\u0645\u0648\u062F \u0633\u0644\u0627\u0645\u0647" || query === "admin" || query === "salama" || query === "gx-999999") {
      if (passwordHash === "salama2026" || passwordHash === "admin" || passwordHash === "123456") {
        const admin = this.users.get("dev_mahmoud_salama");
        if (admin) {
          admin.lastLogin = Date.now();
          return admin;
        }
      }
    }
    const user = Array.from(this.users.values()).find(
      (u) => (u.username.trim().toLowerCase() === query || u.accountId.toLowerCase() === query) && u.passwordHash === passwordHash
    );
    if (user) {
      user.lastLogin = Date.now();
      this.saveToDisk();
      return user;
    }
    return null;
  }
  /**
   * Google Sign-In & Instant Account Linking
   */
  handleGoogleLogin(data) {
    const { googleId, email, name, avatar } = data;
    let user = Array.from(this.users.values()).find(
      (u) => u.googleId && u.googleId === googleId || u.email && u.email.toLowerCase() === email.toLowerCase()
    );
    if (user) {
      user.lastLogin = Date.now();
      if (!user.googleId) user.googleId = googleId;
      if (avatar && !user.avatar) user.avatar = avatar;
      this.saveToDisk();
      return user;
    }
    let chosenUsername = (name || email.split("@")[0] || "\u0643\u0627\u0628\u062A\u0646 \u062C\u0648\u0627\u0644\u064A\u0643\u0633").trim();
    let collision = Array.from(this.users.values()).some(
      (u) => u.username.toLowerCase() === chosenUsername.toLowerCase()
    );
    if (collision) {
      chosenUsername = `${chosenUsername}_${Math.floor(100 + Math.random() * 900)}`;
    }
    const newUser = {
      id: `usr_g_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      accountId: this.generateAccountId(),
      username: chosenUsername,
      email: email.toLowerCase(),
      googleId,
      passwordHash: "google_oauth_auth",
      role: "player",
      coins: 150,
      // Welcome bonus for Google players
      bids: 25,
      points: 0,
      avatar: avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
      inventory: [],
      purchaseHistory: [],
      matchesPlayed: 0,
      matchesWon: 0,
      matchesDrawn: 0,
      matchesLost: 0,
      createdAt: Date.now(),
      lastLogin: Date.now()
    };
    this.users.set(newUser.id, newUser);
    this.saveToDisk();
    return newUser;
  }
  updateUsername(userId, newUsername) {
    const user = this.users.get(userId);
    if (!user) throw new Error("\u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F");
    const clean = newUsername.trim();
    if (!clean) throw new Error("\u064A\u0631\u062C\u0649 \u0625\u062F\u062E\u0627\u0644 \u0627\u0633\u0645 \u0645\u0633\u062A\u062E\u062F\u0645 \u0635\u0627\u0644\u062D");
    const collision = Array.from(this.users.values()).find(
      (u) => u.id !== userId && u.username.trim().toLowerCase() === clean.toLowerCase()
    );
    if (collision) {
      throw new Error(`\u0627\u0644\u0627\u0633\u0645 "${clean}" \u0645\u0633\u062A\u062E\u062F\u0645 \u0628\u0627\u0644\u0641\u0639\u0644 \u0645\u0646 \u0642\u0628\u0644 \u0645\u062F\u0631\u0628 \u0622\u062E\u0631! \u064A\u0631\u062C\u0649 \u0627\u062E\u062A\u064A\u0627\u0631 \u0627\u0633\u0645 \u0641\u0631\u064A\u062F.`);
    }
    user.username = clean;
    this.saveToDisk();
    return user;
  }
  updateAvatar(userId, avatarUrl) {
    const user = this.users.get(userId);
    if (!user) throw new Error("\u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F");
    user.avatar = avatarUrl.trim();
    this.saveToDisk();
    return user;
  }
  getUser(idOrAccountId) {
    if (this.users.has(idOrAccountId)) {
      return this.users.get(idOrAccountId);
    }
    const query = idOrAccountId.trim().toLowerCase();
    return Array.from(this.users.values()).find(
      (u) => u.accountId.toLowerCase() === query || u.username.toLowerCase() === query
    );
  }
  getAllUsers() {
    return Array.from(this.users.values()).sort((a, b) => b.createdAt - a.createdAt);
  }
  // ================= STORE & SERVER-SIDE PURCHASES =================
  getStoreProducts(category) {
    const list = Array.from(this.products.values()).filter((p) => p.isActive !== false);
    if (category) {
      return list.filter((p) => p.category === category);
    }
    return list;
  }
  getProductById(id) {
    return this.products.get(id);
  }
  /**
   * Authoritative Server-Side Purchase Transaction
   */
  purchaseProduct(userId, productId) {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error("\u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F \u0639\u0644\u0649 \u0627\u0644\u0633\u064A\u0631\u0641\u0631");
    }
    const product = this.products.get(productId);
    if (!product || product.isActive === false) {
      throw new Error("\u0647\u0630\u0627 \u0627\u0644\u0645\u0646\u062A\u062C \u063A\u064A\u0631 \u0645\u062A\u0627\u062D \u062D\u0627\u0644\u064A\u0627\u064B \u0641\u064A \u0627\u0644\u0645\u062A\u062C\u0631");
    }
    const nonConsumableCategories = ["chat_effects", "profile_items", "special_items", "limited_items"];
    if (nonConsumableCategories.includes(product.category) && user.inventory?.includes(productId)) {
      throw new Error("\u2713 \u0647\u0630\u0627 \u0627\u0644\u0639\u0646\u0635\u0631 \u0645\u0645\u0644\u0648\u0643 \u0644\u0643 \u0628\u0627\u0644\u0641\u0639\u0644!");
    }
    if (user.coins < product.price) {
      throw new Error(`Coins \u063A\u064A\u0631 \u0643\u0627\u0641\u064A\u0629 \u0644\u0625\u062A\u0645\u0627\u0645 \u0627\u0644\u0634\u0631\u0627\u0621 (\u0627\u0644\u0645\u0637\u0644\u0648\u0628: ${product.price} \u0643\u0648\u064A\u0646\u0632 \xB7 \u0631\u0635\u064A\u062F\u0643 \u0627\u0644\u062D\u0627\u0644\u064A: ${user.coins})`);
    }
    user.coins -= product.price;
    if (!user.inventory.includes(productId)) {
      user.inventory.push(productId);
    }
    product.purchasedCount = (product.purchasedCount || 0) + 1;
    let rewardPlayer = null;
    if (product.category === "packs" && product.tier) {
      rewardPlayer = openPackReward(product.tier);
    }
    const purchase = {
      id: `TXN-${Math.floor(1e5 + Math.random() * 9e5)}`,
      userId: user.id,
      accountId: user.accountId,
      username: user.username,
      productId: product.id,
      productName: product.nameAr,
      category: product.category,
      price: product.price,
      timestamp: Date.now(),
      status: "completed"
    };
    if (!Array.isArray(user.purchaseHistory)) {
      user.purchaseHistory = [];
    }
    user.purchaseHistory.unshift(purchase);
    this.saveToDisk();
    return {
      success: true,
      user,
      purchase,
      rewardPlayer
    };
  }
  // ================= ADMIN CONTROLS =================
  createStoreProduct(productData) {
    const id = productData.id || `item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newProduct = {
      ...productData,
      id,
      purchasedCount: 0,
      isActive: true
    };
    this.products.set(id, newProduct);
    this.saveToDisk();
    return newProduct;
  }
  updateStoreProduct(id, updates) {
    const product = this.products.get(id);
    if (!product) throw new Error("\u0627\u0644\u0645\u0646\u062A\u062C \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F");
    Object.assign(product, updates);
    this.saveToDisk();
    return product;
  }
  deleteStoreProduct(id) {
    const product = this.products.get(id);
    if (!product) return false;
    product.isActive = false;
    this.saveToDisk();
    return true;
  }
  adjustUserCoins(targetUserIdOrAccountId, coinsDelta, adminId, reason = "\u062A\u0639\u062F\u064A\u0644 \u0625\u062F\u0627\u0631\u064A") {
    const user = this.getUser(targetUserIdOrAccountId);
    if (!user) throw new Error("\u0627\u0644\u0644\u0627\u0639\u0628 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F");
    user.coins = Math.max(0, user.coins + coinsDelta);
    this.adminLogs.unshift({
      id: `adm_${Date.now()}`,
      adminId,
      action: coinsDelta >= 0 ? "ADD_COINS" : "DEDUCT_COINS",
      targetAccountId: user.accountId,
      targetUsername: user.username,
      details: `${coinsDelta >= 0 ? "+" : ""}${coinsDelta} \u0643\u0648\u064A\u0646\u0632 \xB7 \u0627\u0644\u0633\u0628\u0628: ${reason}`,
      timestamp: Date.now()
    });
    this.saveToDisk();
    return user;
  }
  updateUserCoinsAndPoints(userId, coinsDelta, pointsDelta, bidsDelta = 0) {
    const user = this.users.get(userId) || this.getUser(userId);
    if (!user) throw new Error("\u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F");
    user.coins = Math.max(0, user.coins + coinsDelta);
    user.points = Math.max(0, user.points + pointsDelta);
    user.bids = Math.max(0, user.bids + bidsDelta);
    this.saveToDisk();
    return user;
  }
  addMatchLog(roomCode, hostName, guestName, score, winner) {
    this.matchLogs.unshift({
      id: `match_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      roomCode,
      hostName,
      guestName,
      score,
      winner,
      timestamp: Date.now()
    });
    this.saveToDisk();
  }
  getGlobalPurchases() {
    const all = [];
    this.users.forEach((u) => {
      if (Array.isArray(u.purchaseHistory)) {
        all.push(...u.purchaseHistory);
      }
    });
    return all.sort((a, b) => b.timestamp - a.timestamp).slice(0, 100);
  }
  getDatabaseSnapshot() {
    return {
      totalUsers: this.users.size,
      users: Array.from(this.users.values()).map((u) => ({
        id: u.id,
        accountId: u.accountId,
        username: u.username,
        role: u.role,
        coins: u.coins,
        bids: u.bids,
        points: u.points,
        inventoryCount: u.inventory?.length || 0,
        matchesPlayed: u.matchesPlayed,
        matchesWon: u.matchesWon,
        matchesDrawn: u.matchesDrawn,
        matchesLost: u.matchesLost,
        createdAt: u.createdAt,
        lastLogin: u.lastLogin
      })),
      products: Array.from(this.products.values()),
      recentPurchases: this.getGlobalPurchases().slice(0, 30),
      matchLogs: this.matchLogs.slice(0, 30),
      adminLogs: this.adminLogs.slice(0, 30),
      serverUptime: process.uptime(),
      timestamp: Date.now()
    };
  }
};
var adminDb = new AdminDatabase();

// server/roomManager.ts
var RoomManager = class {
  constructor() {
    this.rooms = /* @__PURE__ */ new Map();
    this.subscribers = /* @__PURE__ */ new Map();
    this.disconnectTimers = /* @__PURE__ */ new Map();
  }
  generateCode() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return this.rooms.has(code) ? this.generateCode() : code;
  }
  getRoom(code) {
    return this.rooms.get(code.toUpperCase());
  }
  getAllRooms() {
    return Array.from(this.rooms.values());
  }
  subscribe(code, subId, callback) {
    const upper = code.toUpperCase();
    if (!this.subscribers.has(upper)) {
      this.subscribers.set(upper, []);
    }
    this.subscribers.get(upper).push({ id: subId, callback });
  }
  unsubscribe(code, subId) {
    const upper = code.toUpperCase();
    const subs = this.subscribers.get(upper);
    if (subs) {
      this.subscribers.set(upper, subs.filter((s) => s.id !== subId));
    }
  }
  broadcast(room) {
    const subs = this.subscribers.get(room.code);
    if (subs) {
      subs.forEach((sub) => {
        try {
          sub.callback(room);
        } catch {
        }
      });
    }
  }
  createRoom(hostId, hostName, gameId = "stat_arena", mode = "quick_five") {
    const code = this.generateCode();
    const positions = getPositionOrder(mode);
    const room = {
      code,
      hostId,
      gameId,
      mode,
      phase: "WAITING",
      currentRoundIndex: 0,
      totalRounds: positions.length,
      positionOrder: positions,
      participants: {
        host: {
          id: hostId,
          name: hostName || "\u0627\u0644\u0645\u0636\u064A\u0641",
          ready: false,
          score: 0,
          diffSum: 0,
          squad: [],
          connected: true
        }
      },
      updatedAt: Date.now()
    };
    this.rooms.set(code, room);
    return room;
  }
  joinRoom(code, guestId, guestName) {
    const room = this.getRoom(code);
    if (!room) {
      throw new Error("\u0631\u0645\u0632 \u0627\u0644\u063A\u0631\u0641\u0629 \u063A\u064A\u0631 \u0635\u062D\u064A\u062D \u0623\u0648 \u0623\u0646 \u0627\u0644\u063A\u0631\u0641\u0629 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F\u0629");
    }
    const timerKey = `${code}_${guestId}`;
    if (this.disconnectTimers.has(timerKey)) {
      clearTimeout(this.disconnectTimers.get(timerKey));
      this.disconnectTimers.delete(timerKey);
    }
    if (room.participants.guest && room.participants.guest.id !== guestId) {
      throw new Error("\u0627\u0644\u063A\u0631\u0641\u0629 \u0645\u0645\u062A\u0644\u0626\u0629 \u0628\u0627\u0644\u0641\u0639\u0644 \u0628\u0644\u0627\u0639\u0628\u064A\u0646 \u0627\u062B\u0646\u064A\u0646");
    }
    if (!room.participants.guest || room.participants.guest.id === guestId) {
      room.participants.guest = {
        id: guestId,
        name: guestName || room.participants.guest?.name || "\u0627\u0644\u0636\u064A\u0641",
        ready: room.participants.guest?.ready || false,
        score: room.participants.guest?.score || 0,
        diffSum: room.participants.guest?.diffSum || 0,
        squad: room.participants.guest?.squad || [],
        connected: true
      };
    }
    room.updatedAt = Date.now();
    this.broadcast(room);
    return room;
  }
  setReady(code, userId, isReady) {
    const room = this.getRoom(code);
    if (!room) throw new Error("\u0627\u0644\u063A\u0631\u0641\u0629 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F\u0629");
    if (room.hostId === userId) {
      room.participants.host.ready = isReady;
    } else if (room.participants.guest?.id === userId) {
      room.participants.guest.ready = isReady;
    }
    if (room.participants.host.ready && room.participants.guest?.ready) {
      this.startMatch(room);
    }
    room.updatedAt = Date.now();
    this.broadcast(room);
    return room;
  }
  selectGame(code, hostId, gameId, mode) {
    const room = this.getRoom(code);
    if (!room) throw new Error("\u0627\u0644\u063A\u0631\u0641\u0629 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F\u0629");
    if (room.hostId !== hostId) throw new Error("\u0641\u0642\u0637 \u0627\u0644\u0645\u0636\u064A\u0641 \u064A\u0645\u0643\u0646\u0647 \u062A\u063A\u064A\u064A\u0631 \u0625\u0639\u062F\u0627\u062F\u0627\u062A \u0627\u0644\u063A\u0631\u0641\u0629");
    room.gameId = gameId;
    room.mode = mode;
    const positions = getPositionOrder(mode);
    room.positionOrder = positions;
    room.totalRounds = positions.length;
    room.updatedAt = Date.now();
    this.broadcast(room);
    return room;
  }
  startMatch(room) {
    room.currentRoundIndex = 0;
    room.participants.host.squad = [];
    room.participants.host.diffSum = 0;
    if (room.participants.guest) {
      room.participants.guest.squad = [];
      room.participants.guest.diffSum = 0;
    }
    this.prepareRound(room);
  }
  prepareRound(room) {
    const currentPos = room.positionOrder[room.currentRoundIndex];
    room.participants.host.currentAnswer = null;
    room.participants.host.currentBoxSelection = null;
    if (room.participants.guest) {
      room.participants.guest.currentAnswer = null;
      room.participants.guest.currentBoxSelection = null;
    }
    room.lastRoundWinner = null;
    room.lastRoundLoserReward = null;
    if (room.gameId === "stat_arena") {
      room.phase = "QUESTION_ACTIVE";
      const questions = getQuestionsForGame([currentPos]);
      room.currentQuestion = questions[0];
    } else if (room.gameId === "santra") {
      room.phase = "MYSTERY_SELECTION";
      const clubs = getRandomClubsForRound(4);
      room.currentRoundClubs = clubs.map((c) => c.name);
    }
    room.updatedAt = Date.now();
  }
  submitStatAnswer(code, userId, answer) {
    const room = this.getRoom(code);
    if (!room) throw new Error("\u0627\u0644\u063A\u0631\u0641\u0629 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F\u0629");
    if (room.phase !== "QUESTION_ACTIVE") throw new Error("\u0644\u064A\u0633 \u0648\u0642\u062A \u0627\u0644\u0625\u062C\u0627\u0628\u0629 \u062D\u0627\u0644\u064A\u0627\u064B");
    if (typeof answer !== "number" || answer < 0 || !Number.isFinite(answer)) {
      throw new Error("\u0625\u062C\u0627\u0628\u0629 \u063A\u064A\u0631 \u0635\u0627\u0644\u062D\u0629");
    }
    if (room.hostId === userId) {
      room.participants.host.currentAnswer = answer;
    } else if (room.participants.guest?.id === userId) {
      room.participants.guest.currentAnswer = answer;
    } else {
      throw new Error("\u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u0644\u064A\u0633 \u0639\u0636\u0648\u0627\u064B \u0641\u064A \u0647\u0630\u0647 \u0627\u0644\u063A\u0631\u0641\u0629");
    }
    const hostAns = room.participants.host.currentAnswer;
    const guestAns = room.participants.guest?.currentAnswer;
    if (hostAns !== null && hostAns !== void 0 && guestAns !== null && guestAns !== void 0) {
      const correct = room.currentQuestion?.correctAnswer || 0;
      const hostDiff = Math.abs(hostAns - correct);
      const guestDiff = Math.abs(guestAns - correct);
      room.participants.host.diffSum += hostDiff;
      if (room.participants.guest) {
        room.participants.guest.diffSum += guestDiff;
      }
      const currentPos = room.positionOrder[room.currentRoundIndex];
      if (hostDiff < guestDiff) {
        room.lastRoundWinner = "host";
        const rewardPlayer = getRandomPlayerByPosition(currentPos);
        room.participants.guest.squad.push(rewardPlayer);
        room.lastRoundLoserReward = {
          recipientId: room.participants.guest.id,
          player: rewardPlayer
        };
      } else if (guestDiff < hostDiff) {
        room.lastRoundWinner = "guest";
        const rewardPlayer = getRandomPlayerByPosition(currentPos);
        room.participants.host.squad.push(rewardPlayer);
        room.lastRoundLoserReward = {
          recipientId: room.hostId,
          player: rewardPlayer
        };
      } else {
        room.lastRoundWinner = "tie";
        const r1 = getRandomPlayerByPosition(currentPos);
        const r2 = getRandomPlayerByPosition(currentPos, [r1.id]);
        room.participants.host.squad.push(r1);
        room.participants.guest.squad.push(r2);
      }
      room.phase = "ANSWER_REVEAL";
    }
    room.updatedAt = Date.now();
    this.broadcast(room);
    return room;
  }
  submitSantraBox(code, userId, boxIndex) {
    const room = this.getRoom(code);
    if (!room) throw new Error("\u0627\u0644\u063A\u0631\u0641\u0629 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F\u0629");
    if (room.phase !== "MYSTERY_SELECTION") throw new Error("\u0644\u064A\u0633 \u0648\u0642\u062A \u0627\u062E\u062A\u064A\u0627\u0631 \u0627\u0644\u0635\u0646\u0627\u062F\u064A\u0642");
    if (boxIndex < 0 || boxIndex > 3) {
      throw new Error("\u0631\u0642\u0645 \u0627\u0644\u0635\u0646\u062F\u0648\u0642 \u063A\u064A\u0631 \u0635\u0627\u0644\u062D");
    }
    const currentPos = room.positionOrder[room.currentRoundIndex];
    const clubs = room.currentRoundClubs || ["Real Madrid", "FC Barcelona", "Manchester City", "Bayern Munich"];
    const chosenClub = clubs[boxIndex % clubs.length];
    if (room.hostId === userId) {
      if (room.participants.host.currentBoxSelection === null) {
        room.participants.host.currentBoxSelection = boxIndex;
        const p1 = getRandomPlayerByClubAndPosition(chosenClub, currentPos);
        room.participants.host.squad.push(p1);
      }
    } else if (room.participants.guest?.id === userId) {
      if (room.participants.guest.currentBoxSelection === null) {
        room.participants.guest.currentBoxSelection = boxIndex;
        const p2 = getRandomPlayerByClubAndPosition(chosenClub, currentPos);
        room.participants.guest.squad.push(p2);
      }
    } else {
      throw new Error("\u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u0644\u064A\u0633 \u0639\u0636\u0648\u0627\u064B \u0641\u064A \u0647\u0630\u0647 \u0627\u0644\u063A\u0631\u0641\u0629");
    }
    const hostBox = room.participants.host.currentBoxSelection;
    const guestBox = room.participants.guest?.currentBoxSelection;
    if (hostBox !== null && hostBox !== void 0 && guestBox !== null && guestBox !== void 0) {
      room.phase = "MYSTERY_REVEAL";
    }
    room.updatedAt = Date.now();
    this.broadcast(room);
    return room;
  }
  nextRound(code) {
    const room = this.getRoom(code);
    if (!room) throw new Error("\u0627\u0644\u063A\u0631\u0641\u0629 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F\u0629");
    const nextIndex = room.currentRoundIndex + 1;
    if (nextIndex < room.totalRounds) {
      room.currentRoundIndex = nextIndex;
      this.prepareRound(room);
    } else {
      room.phase = "SQUAD_COMPARISON";
      if (room.gameId === "stat_arena") {
        const p1Diff = room.participants.host.diffSum;
        const p2Diff = room.participants.guest?.diffSum ?? 0;
        if (p1Diff < p2Diff) {
          room.matchAdvantage = { leaderId: room.hostId, score: "1-0" };
        } else if (p2Diff < p1Diff && room.participants.guest) {
          room.matchAdvantage = { leaderId: room.participants.guest.id, score: "1-0" };
        }
      }
    }
    room.updatedAt = Date.now();
    this.broadcast(room);
    return room;
  }
  startSimulation(code) {
    const room = this.getRoom(code);
    if (!room) throw new Error("\u0627\u0644\u063A\u0631\u0641\u0629 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F\u0629");
    room.phase = "SIMULATION";
    room.updatedAt = Date.now();
    this.broadcast(room);
    return room;
  }
  finishMatch(code, hostGoals, guestGoals) {
    const room = this.getRoom(code);
    if (!room) throw new Error("\u0627\u0644\u063A\u0631\u0641\u0629 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F\u0629");
    let winnerId = "draw";
    if (hostGoals > guestGoals) winnerId = room.hostId;
    else if (guestGoals > hostGoals && room.participants.guest) winnerId = room.participants.guest.id;
    room.phase = "MATCH_FINISHED";
    room.simulationResult = { hostGoals, guestGoals, winnerId };
    room.updatedAt = Date.now();
    if (room.participants.guest) {
      rankingManager.recordRoomMatch(
        room.hostId,
        room.participants.host.name,
        void 0,
        hostGoals,
        room.participants.guest.id,
        room.participants.guest.name,
        void 0,
        guestGoals
      );
      adminDb.addMatchLog(
        room.code,
        room.participants.host.name,
        room.participants.guest.name,
        `${hostGoals} - ${guestGoals}`,
        winnerId === "draw" ? "\u062A\u0639\u0627\u062F\u0644" : winnerId === room.hostId ? room.participants.host.name : room.participants.guest.name
      );
    }
    this.broadcast(room);
    return room;
  }
  handleDisconnect(code, userId) {
    const room = this.getRoom(code);
    if (!room) return;
    if (room.hostId === userId) {
      room.participants.host.connected = false;
    } else if (room.participants.guest?.id === userId) {
      room.participants.guest.connected = false;
    }
    room.updatedAt = Date.now();
    this.broadcast(room);
    const timerKey = `${code}_${userId}`;
    const timer = setTimeout(() => {
      this.leaveRoom(code, userId);
    }, 45e3);
    this.disconnectTimers.set(timerKey, timer);
  }
  leaveRoom(code, userId) {
    const room = this.getRoom(code);
    if (!room) return;
    if (room.hostId === userId) {
      this.rooms.delete(code);
      this.broadcast({
        ...room,
        phase: "WAITING",
        updatedAt: Date.now()
      });
    } else if (room.participants.guest?.id === userId) {
      delete room.participants.guest;
      room.phase = "WAITING";
      room.participants.host.ready = false;
      this.broadcast(room);
    }
  }
};
var roomManager = new RoomManager();

// server.ts
var app = express();
var PORT = Number(process.env.PORT) || 3e3;
app.use(express.json());
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});
var apiRouter = express.Router();
apiRouter.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", serverTime: Date.now() });
});
apiRouter.post("/rooms/create", (req, res) => {
  try {
    const { hostId, hostName, gameId, mode } = req.body;
    if (!hostId) {
      return res.status(400).json({ error: "hostId is required" });
    }
    const room = roomManager.createRoom(hostId, hostName, gameId, mode);
    res.json(room);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: message });
  }
});
apiRouter.post("/rooms/join", (req, res) => {
  try {
    const { code, guestId, guestName } = req.body;
    if (!code || !guestId) {
      return res.status(400).json({ error: "code and guestId are required" });
    }
    const room = roomManager.joinRoom(code, guestId, guestName);
    res.json(room);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(400).json({ error: message });
  }
});
apiRouter.get("/rooms/:code", (req, res) => {
  const room = roomManager.getRoom(req.params.code);
  if (!room) {
    return res.status(404).json({ error: "\u0627\u0644\u063A\u0631\u0641\u0629 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F\u0629" });
  }
  res.json(room);
});
apiRouter.get("/rooms/:code/stream", (req, res) => {
  const code = req.params.code.toUpperCase();
  const room = roomManager.getRoom(code);
  if (!room) {
    return res.status(404).json({ error: "\u0627\u0644\u063A\u0631\u0641\u0629 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F\u0629" });
  }
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();
  res.write(`data: ${JSON.stringify(room)}

`);
  const subId = `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  roomManager.subscribe(code, subId, (updatedState) => {
    res.write(`data: ${JSON.stringify(updatedState)}

`);
  });
  const keepAlive = setInterval(() => {
    res.write(": keepalive\n\n");
  }, 15e3);
  req.on("close", () => {
    clearInterval(keepAlive);
    roomManager.unsubscribe(code, subId);
  });
});
apiRouter.post("/rooms/:code/ready", (req, res) => {
  try {
    const { userId, ready } = req.body;
    const room = roomManager.setReady(req.params.code, userId, ready);
    res.json(room);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(400).json({ error: message });
  }
});
apiRouter.post("/rooms/:code/select-game", (req, res) => {
  try {
    const { hostId, gameId, mode } = req.body;
    const room = roomManager.selectGame(req.params.code, hostId, gameId, mode);
    res.json(room);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(400).json({ error: message });
  }
});
apiRouter.post("/rooms/:code/stat-answer", (req, res) => {
  try {
    const { userId, answer } = req.body;
    const room = roomManager.submitStatAnswer(req.params.code, userId, answer);
    res.json(room);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(400).json({ error: message });
  }
});
apiRouter.post("/rooms/:code/santra-box", (req, res) => {
  try {
    const { userId, boxIndex } = req.body;
    const room = roomManager.submitSantraBox(req.params.code, userId, boxIndex);
    res.json(room);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(400).json({ error: message });
  }
});
apiRouter.post("/rooms/:code/next-round", (req, res) => {
  try {
    const room = roomManager.nextRound(req.params.code);
    res.json(room);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(400).json({ error: message });
  }
});
apiRouter.post("/rooms/:code/start-simulation", (req, res) => {
  try {
    const room = roomManager.startSimulation(req.params.code);
    res.json(room);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(400).json({ error: message });
  }
});
apiRouter.post("/rooms/:code/finish-match", (req, res) => {
  try {
    const { hostGoals, guestGoals } = req.body;
    const room = roomManager.finishMatch(req.params.code, hostGoals, guestGoals);
    res.json(room);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(400).json({ error: message });
  }
});
apiRouter.post("/rooms/:code/leave", (req, res) => {
  try {
    const { userId } = req.body;
    roomManager.leaveRoom(req.params.code, userId);
    res.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(400).json({ error: message });
  }
});
apiRouter.get("/ranking", (req, res) => {
  try {
    const userId = req.query.userId;
    const leaderboard = rankingManager.getLeaderboard(userId);
    res.json(leaderboard);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: message });
  }
});
apiRouter.post("/ranking/sync", (req, res) => {
  try {
    const { userId, username, avatar } = req.body;
    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }
    const player = rankingManager.syncUserProfile(userId, username, avatar);
    res.json(player);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: message });
  }
});
apiRouter.post("/auth/register", (req, res) => {
  try {
    const { username, password, avatar } = req.body;
    if (!username || !username.trim()) {
      return res.status(400).json({ error: "\u064A\u0631\u062C\u0649 \u0625\u062F\u062E\u0627\u0644 \u0627\u0633\u0645 \u0627\u0644\u0645\u062F\u0631\u0628" });
    }
    const user = adminDb.registerUser(username, password, avatar);
    rankingManager.syncUserProfile(user.id, user.username, user.avatar);
    res.json({ success: true, user });
  } catch (err) {
    const message = err instanceof Error ? err.message : "\u0641\u0634\u0644 \u0627\u0644\u062A\u0633\u062C\u064A\u0644";
    res.status(400).json({ error: message });
  }
});
apiRouter.post("/auth/login", (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !username.trim()) {
      return res.status(400).json({ error: "\u064A\u0631\u062C\u0649 \u0625\u062F\u062E\u0627\u0644 \u0627\u0633\u0645 \u0627\u0644\u0645\u062F\u0631\u0628 \u0623\u0648 Account ID" });
    }
    const user = adminDb.authenticate(username, password);
    if (!user) {
      return res.status(401).json({ error: "\u0627\u0633\u0645 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u0623\u0648 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u063A\u064A\u0631 \u0635\u062D\u064A\u062D\u0629" });
    }
    rankingManager.syncUserProfile(user.id, user.username, user.avatar);
    res.json({ success: true, user });
  } catch (err) {
    const message = err instanceof Error ? err.message : "\u0641\u0634\u0644 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644";
    res.status(500).json({ error: message });
  }
});
apiRouter.post("/auth/google", (req, res) => {
  try {
    const { googleId, email, name, avatar } = req.body;
    if (!email) {
      return res.status(400).json({ error: "\u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A \u0645\u0637\u0644\u0648\u0628" });
    }
    const user = adminDb.handleGoogleLogin({
      googleId: googleId || `g_${Date.now()}`,
      email,
      name: name || email.split("@")[0],
      avatar
    });
    rankingManager.syncUserProfile(user.id, user.username, user.avatar);
    res.json({ success: true, user });
  } catch (err) {
    const message = err instanceof Error ? err.message : "\u0641\u0634\u0644 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0639\u0628\u0631 Google";
    res.status(500).json({ error: message });
  }
});
apiRouter.post("/profile/update-username", (req, res) => {
  try {
    const { userId, newUsername } = req.body;
    if (!userId || !newUsername) {
      return res.status(400).json({ error: "\u0627\u0644\u0645\u0639\u0631\u0641 \u0648\u0627\u0633\u0645 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u0627\u0644\u062C\u062F\u064A\u062F \u0645\u0637\u0644\u0648\u0628\u0627\u0646" });
    }
    const user = adminDb.updateUsername(userId, newUsername);
    rankingManager.syncUserProfile(user.id, user.username, user.avatar);
    res.json({ success: true, user });
  } catch (err) {
    const message = err instanceof Error ? err.message : "\u0641\u0634\u0644 \u062A\u062D\u062F\u064A\u062B \u0627\u0644\u0627\u0633\u0645";
    res.status(400).json({ error: message });
  }
});
apiRouter.post("/profile/update-avatar", (req, res) => {
  try {
    const { userId, avatar } = req.body;
    if (!userId || !avatar) {
      return res.status(400).json({ error: "\u0627\u0644\u0645\u0639\u0631\u0641 \u0648\u0627\u0644\u0635\u0648\u0631\u0629 \u0645\u0637\u0644\u0648\u0628\u0627\u0646" });
    }
    const user = adminDb.updateAvatar(userId, avatar);
    rankingManager.syncUserProfile(user.id, user.username, user.avatar);
    res.json({ success: true, user });
  } catch (err) {
    const message = err instanceof Error ? err.message : "\u0641\u0634\u0644 \u062A\u062D\u062F\u064A\u062B \u0627\u0644\u0635\u0648\u0631\u0629";
    res.status(400).json({ error: message });
  }
});
apiRouter.get("/profile/:id", (req, res) => {
  try {
    const user = adminDb.getUser(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "\u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F" });
    }
    res.json({ success: true, user });
  } catch (err) {
    const message = err instanceof Error ? err.message : "\u062E\u0637\u0623 \u0641\u064A \u062C\u0644\u0628 \u0627\u0644\u0645\u0644\u0641 \u0627\u0644\u0634\u062E\u0635\u064A";
    res.status(500).json({ error: message });
  }
});
apiRouter.get("/store/products", (req, res) => {
  try {
    const category = req.query.category;
    const products = adminDb.getStoreProducts(category);
    res.json({ success: true, products });
  } catch (err) {
    const message = err instanceof Error ? err.message : "\u0641\u0634\u0644 \u062C\u0644\u0628 \u0645\u0646\u062A\u062C\u0627\u062A \u0627\u0644\u0645\u062A\u062C\u0631";
    res.status(500).json({ error: message });
  }
});
apiRouter.post("/store/purchase", (req, res) => {
  try {
    const { userId, productId } = req.body;
    if (!userId || !productId) {
      return res.status(400).json({ error: "\u0645\u0639\u0631\u0641 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u0648\u0645\u0639\u0631\u0641 \u0627\u0644\u0645\u0646\u062A\u062C \u0645\u0637\u0644\u0648\u0628\u0627\u0646" });
    }
    const result = adminDb.purchaseProduct(userId, productId);
    rankingManager.syncUserProfile(result.user.id, result.user.username, result.user.avatar);
    res.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "\u0641\u0634\u0644 \u0625\u062A\u0645\u0627\u0645 \u0627\u0644\u0634\u0631\u0627\u0621";
    res.status(400).json({ error: message });
  }
});
apiRouter.get("/admin/database", (req, res) => {
  try {
    const snapshot = adminDb.getDatabaseSnapshot();
    const activeRooms = roomManager.getAllRooms();
    const rankings = rankingManager.getLeaderboard();
    res.json({
      success: true,
      snapshot,
      activeRooms,
      rankings,
      serverTime: Date.now()
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "\u0641\u0634\u0644 \u062C\u0644\u0628 \u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0625\u062F\u0627\u0631\u0629";
    res.status(500).json({ error: message });
  }
});
apiRouter.post("/admin/search-player", (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ error: "\u064A\u0631\u062C\u0649 \u0625\u062F\u062E\u0627\u0644 Account ID \u0623\u0648 \u0627\u0633\u0645 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645" });
    }
    const user = adminDb.getUser(query);
    if (!user) {
      return res.status(404).json({ error: "\u0644\u0645 \u064A\u062A\u0645 \u0627\u0644\u0639\u062B\u0648\u0631 \u0639\u0644\u0649 \u0623\u064A \u0644\u0627\u0639\u0628 \u0628\u0647\u0630\u0627 \u0627\u0644\u0640 ID \u0623\u0648 \u0627\u0644\u0627\u0633\u0645" });
    }
    res.json({ success: true, user });
  } catch (err) {
    const message = err instanceof Error ? err.message : "\u062E\u0637\u0623 \u0641\u064A \u0627\u0644\u0628\u062D\u062B";
    res.status(500).json({ error: message });
  }
});
apiRouter.post("/admin/adjust-coins", (req, res) => {
  try {
    const { targetUserIdOrAccountId, coinsDelta, adminId, reason } = req.body;
    if (!targetUserIdOrAccountId || typeof coinsDelta !== "number") {
      return res.status(400).json({ error: "\u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u063A\u064A\u0631 \u0645\u0643\u062A\u0645\u0644\u0629" });
    }
    const user = adminDb.adjustUserCoins(
      targetUserIdOrAccountId,
      coinsDelta,
      adminId || "dev_mahmoud_salama",
      reason
    );
    res.json({ success: true, user });
  } catch (err) {
    const message = err instanceof Error ? err.message : "\u0641\u0634\u0644 \u062A\u0639\u062F\u064A\u0644 \u0631\u0635\u064A\u062F \u0627\u0644\u0643\u0648\u064A\u0646\u0632";
    res.status(400).json({ error: message });
  }
});
apiRouter.post("/admin/products/create", (req, res) => {
  try {
    const product = adminDb.createStoreProduct(req.body);
    res.json({ success: true, product });
  } catch (err) {
    const message = err instanceof Error ? err.message : "\u0641\u0634\u0644 \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u0645\u0646\u062A\u062C";
    res.status(400).json({ error: message });
  }
});
apiRouter.post("/admin/products/update", (req, res) => {
  try {
    const { id, ...updates } = req.body;
    if (!id) return res.status(400).json({ error: "\u0645\u0639\u0631\u0641 \u0627\u0644\u0645\u0646\u062A\u062C \u0645\u0637\u0644\u0648\u0628" });
    const product = adminDb.updateStoreProduct(id, updates);
    res.json({ success: true, product });
  } catch (err) {
    const message = err instanceof Error ? err.message : "\u0641\u0634\u0644 \u062A\u0639\u062F\u064A\u0644 \u0627\u0644\u0645\u0646\u062A\u062C";
    res.status(400).json({ error: message });
  }
});
apiRouter.post("/admin/products/delete", (req, res) => {
  try {
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: "\u0645\u0639\u0631\u0641 \u0627\u0644\u0645\u0646\u062A\u062C \u0645\u0637\u0644\u0648\u0628" });
    const success = adminDb.deleteStoreProduct(id);
    res.json({ success });
  } catch (err) {
    const message = err instanceof Error ? err.message : "\u0641\u0634\u0644 \u062D\u0630\u0641 \u0627\u0644\u0645\u0646\u062A\u062C";
    res.status(400).json({ error: message });
  }
});
apiRouter.post("/admin/adjust-user", (req, res) => {
  try {
    const { userId, coinsDelta, pointsDelta, bidsDelta } = req.body;
    if (!userId) {
      return res.status(400).json({ error: "\u0645\u0639\u0631\u0641 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u0645\u0637\u0644\u0648\u0628" });
    }
    const updated = adminDb.updateUserCoinsAndPoints(
      userId,
      coinsDelta || 0,
      pointsDelta || 0,
      bidsDelta || 0
    );
    res.json({ success: true, user: updated });
  } catch (err) {
    const message = err instanceof Error ? err.message : "\u0641\u0634\u0644 \u062A\u0639\u062F\u064A\u0644 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645";
    res.status(500).json({ error: message });
  }
});
app.use("/players", express.static(path2.resolve("public", "players")));
app.use(express.static(path2.resolve("public")));
app.use("/api", apiRouter);
async function start() {
  const distPath = path2.resolve("dist");
  const hasDist = fs2.existsSync(path2.join(distPath, "index.html"));
  const isProduction = process.env.NODE_ENV === "production" || hasDist && process.env.NODE_ENV !== "development";
  if (isProduction) {
    console.log(`Starting in PRODUCTION mode. Serving static assets from ${distPath}`);
    app.use(express.static(distPath));
    app.get("*", (req, res, next) => {
      if (req.path.startsWith("/api") || req.path === "/health") {
        return next();
      }
      res.sendFile(path2.join(distPath, "index.html"));
    });
  } else {
    console.log("Starting in DEVELOPMENT mode with Vite middleware");
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  }
  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`GOALIX server listening on http://0.0.0.0:${PORT} (mode: ${isProduction ? "production" : "development"})`);
  });
  const shutdown = () => {
    console.log("Shutting down server gracefully...");
    server.close(() => {
      console.log("Server closed successfully.");
      process.exit(0);
    });
  };
  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}
start();
