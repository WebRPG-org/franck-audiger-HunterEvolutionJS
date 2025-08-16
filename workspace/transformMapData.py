#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
import argparse

COUCHES = [f"couche{i}" for i in range(1, 5)]
SRC_START, SRC_END = 186, 255   # lignes source inclusives
DST_START, DST_END = 1, 185     # lignes destination inclusives

def verifier_structure(root):
    if not isinstance(root, dict):
        raise TypeError("Le JSON racine doit être un objet.")
    for ck in COUCHES:
        if ck not in root or not isinstance(root[ck], dict):
            raise KeyError(f"Clé manquante ou invalide: {ck} (attendu: objet).")
        couche = root[ck]
        # S'assurer que les lignes source 186..255 existent et sont des listes
        manquantes = []
        mauvais_types = []
        for i in range(SRC_START, SRC_END + 1):
            key = f"line{i}"
            if key not in couche:
                manquantes.append(key)
            elif not isinstance(couche[key], list):
                mauvais_types.append(key)
        if manquantes:
            raise ValueError(f"{ck}: lignes sources manquantes: {', '.join(manquantes[:10])}"
                             + ("..." if len(manquantes) > 10 else ""))
        if mauvais_types:
            raise TypeError(f"{ck}: lignes non-listes: {', '.join(mauvais_types[:10])}"
                            + ("..." if len(mauvais_types) > 10 else ""))

def copier_186_255_sur_1_185(couche_obj):
    """
    Remplace line1..line185 par une répétition cyclique de line186..line255.
    On copie les tableaux (list()) pour ne pas partager la même référence.
    """
    src_keys = [f"line{i}" for i in range(SRC_START, SRC_END + 1)]  # 70 lignes
    # Prépare la séquence des sources en cycle
    src_len = len(src_keys)  # 70
    idx = 0
    for i in range(DST_START, DST_END + 1):
        src_key = src_keys[idx % src_len]
        dst_key = f"line{i}"
        # copie de liste pour éviter les alias
        couche_obj[dst_key] = list(couche_obj[src_key])
        idx += 1

def transformer(data):
    for ck in COUCHES:
        copier_186_255_sur_1_185(data[ck])
    return data

def main():
    parser = argparse.ArgumentParser(
        description="Pour chaque couche (couche1..couche4), copie line186..line255 en boucle sur line1..line185. Écrit result_refined.json."
    )
    parser.add_argument("fichier", help="Chemin du fichier JSON d'entrée (structure: coucheX -> lineY -> tableau).")
    args = parser.parse_args()

    try:
        # utf-8-sig tolère un éventuel BOM sous Windows
        with open(args.fichier, "r", encoding="utf-8-sig") as f:
            data = json.load(f)
        verifier_structure(data)
        out = transformer(data)
    except (OSError, json.JSONDecodeError) as e:
        parser.exit(1, f"Erreur de lecture/JSON: {e}\n")
    except (TypeError, KeyError, ValueError) as e:
        parser.exit(1, f"{e}\n")

    try:
        with open("result_refined.json", "w", encoding="utf-8") as f:
            json.dump(out, f, ensure_ascii=False, indent=2)
    except OSError as e:
        parser.exit(1, f"Impossible d'écrire result_refined.json: {e}\n")

    print("Résultat écrit dans result_refined.json")

if __name__ == "__main__":
    main()
