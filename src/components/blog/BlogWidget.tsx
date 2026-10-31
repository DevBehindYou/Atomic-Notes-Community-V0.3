"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";

// Each widget is its own chunk, so a post downloads only the widgets it places. They still render on the server.
const OfflineSimulator = dynamic(() => import("./OfflineSimulator").then((m) => m.OfflineSimulator));
const LocalFirstScorecard = dynamic(() => import("./LocalFirstScorecard").then((m) => m.LocalFirstScorecard));
const RedFlagChecker = dynamic(() => import("./RedFlagChecker").then((m) => m.RedFlagChecker));
const PolicyDecoder = dynamic(() => import("./PolicyDecoder").then((m) => m.PolicyDecoder));
const EncryptionPlayground = dynamic(() => import("./EncryptionPlayground").then((m) => m.EncryptionPlayground));
const WhoCanRead = dynamic(() => import("./WhoCanRead").then((m) => m.WhoCanRead));
const AirplaneTest = dynamic(() => import("./AirplaneTest").then((m) => m.AirplaneTest));
const WaitCalculator = dynamic(() => import("./WaitCalculator").then((m) => m.WaitCalculator));
const MetadataInference = dynamic(() => import("./MetadataInference").then((m) => m.MetadataInference));
const SyncStepper = dynamic(() => import("./SyncStepper").then((m) => m.SyncStepper));
const AppFinder = dynamic(() => import("./AppFinder").then((m) => m.AppFinder));
const LocalFirstMatcher = dynamic(() => import("./LocalFirstMatcher").then((m) => m.LocalFirstMatcher));
const ShutdownTest = dynamic(() => import("./ShutdownTest").then((m) => m.ShutdownTest));
const RecoveryCheck = dynamic(() => import("./RecoveryCheck").then((m) => m.RecoveryCheck));
const GuessTime = dynamic(() => import("./GuessTime").then((m) => m.GuessTime));
const OfflineFinder = dynamic(() => import("./OfflineFinder").then((m) => m.OfflineFinder));
const PermissionReader = dynamic(() => import("./PermissionReader").then((m) => m.PermissionReader));
const AiScanner = dynamic(() => import("./AiScanner").then((m) => m.AiScanner));
const AiPath = dynamic(() => import("./AiPath").then((m) => m.AiPath));
const HabitAudit = dynamic(() => import("./HabitAudit").then((m) => m.HabitAudit));
const ApkChecker = dynamic(() => import("./ApkChecker").then((m) => m.ApkChecker));
const BlastRadius = dynamic(() => import("./BlastRadius").then((m) => m.BlastRadius));
const SecretScanner = dynamic(() => import("./SecretScanner").then((m) => m.SecretScanner));
const ThreatMatrix = dynamic(() => import("./ThreatMatrix").then((m) => m.ThreatMatrix));
const KeyCustody = dynamic(() => import("./KeyCustody").then((m) => m.KeyCustody));
const SwitchCheck = dynamic(() => import("./SwitchCheck").then((m) => m.SwitchCheck));
const CountCheck = dynamic(() => import("./CountCheck").then((m) => m.CountCheck));

// Interactive components a post can place with `:::widget <name>` on its own line.
const WIDGETS: Record<string, ComponentType> = {
  "offline-simulator": OfflineSimulator,
  "local-first-scorecard": LocalFirstScorecard,
  "red-flag-checker": RedFlagChecker,
  "policy-decoder": PolicyDecoder,
  "encryption-playground": EncryptionPlayground,
  "who-can-read": WhoCanRead,
  "airplane-test": AirplaneTest,
  "wait-calculator": WaitCalculator,
  "metadata-inference": MetadataInference,
  "sync-stepper": SyncStepper,
  "app-finder": AppFinder,
  "local-first-matcher": LocalFirstMatcher,
  "shutdown-test": ShutdownTest,
  "recovery-check": RecoveryCheck,
  "guess-time": GuessTime,
  "offline-finder": OfflineFinder,
  "permission-reader": PermissionReader,
  "ai-scanner": AiScanner,
  "ai-path": AiPath,
  "habit-audit": HabitAudit,
  "apk-checker": ApkChecker,
  "blast-radius": BlastRadius,
  "secret-scanner": SecretScanner,
  "threat-matrix": ThreatMatrix,
  "key-custody": KeyCustody,
  "switch-check": SwitchCheck,
  "count-check": CountCheck,
};

export const WIDGET_NAMES = Object.keys(WIDGETS);

export function BlogWidget({ name }: { name: string }) {
  const W = WIDGETS[name];
  return W ? <div className="bw-slot"><W /></div> : null;
}
