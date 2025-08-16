#!/usr/bin/env python3
# mergeMapData.py
import json
import sys
import re
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

def extraire_index(nom: str) -> Optional[int]:
    """Retourne l'entier à la fin du nom ('couche12' -> 12), sinon None."""
    m = re.search(r'(\d+)$', nom)
    return int(m.group(1)) if m else None

def charger_json_arg(arg: str) -> Tuple[Any, Optional[Path]]:
    """
    Si `arg` est un fichier existant, lit et retourne (data, path).
    Sinon traite `arg` comme une chaîne JSON et retourne (data, None).
    """
    p = Path(arg).expanduser()
    if p.exists() and p.is_file():
        with p.open("r", encoding="utf-8") as f:
            return json.load(f), p
    return json.loads(arg), None

def chemin_sortie(source_path: Optional[Path], explicit_out: Optional[str]) -> Path:
    """
    Si explicit_out est fourni, l'utiliser (relatif au dossier du fichier source si relatif).
    Sinon, écrire 'result_flat.json' à côté du fichier source (ou dans le cwd si JSON brut).
    """
    if explicit_out:
        out = Path(explicit_out).expanduser()
        if not out.is_absolute() and source_path is not None:
            out = source_path.parent / out
        return out
    if source_path is not None:
        return source_path.with_name("result_flat.json")
    return Path.cwd() / "result_flat.json"

def aplatir_couches(data: Any) -> List[Any]:
    """
    Aplati la structure {coucheN: {lineM: [...]}} -> liste de valeurs,
    en respectant l'ordre par N puis par M (indices numériques croissants).
    """
    if isinstance(data, list):
        # Déjà plat : renvoyer tel quel
        return list(data)

    if not isinstance(data, dict):
        raise ValueError("Le JSON d'entrée doit être un objet (dict) ou une liste.")

    # Trier les couches par indice numérique
    couches_ordonnees = []
    for k, v in data.items():
        if not isinstance(v, (dict, list)):
            # Ignore les métadonnées éventuelles
            continue
        idx = extraire_index(k)
        if idx is not None:
            couches_ordonnees.append((idx, k, v))
    if not couches_ordonnees:
        raise ValueError("Aucune 'coucheN' détectée (ex: 'couche1', 'couche2', ...).")

    couches_ordonnees.sort(key=lambda x: x[0])

    resultat: List[Any] = []

    for _, _, contenu_couche in couches_ordonnees:
        if isinstance(contenu_couche, list):
            # Compat : si une couche est directement une liste (ancienne structure)
            resultat.extend(contenu_couche)
            continue

        if not isinstance(contenu_couche, dict):
            raise ValueError("Chaque 'coucheN' doit être un objet contenant des 'lineM'.")

        # Trier les lignes par indice numérique
        lignes_ordonnees = []
        for lk, lv in contenu_couche.items():
            lidx = extraire_index(lk)
            if lidx is not None:
                if not isinstance(lv, list):
                    raise ValueError(f"'{lk}' doit être une liste.")
                lignes_ordonnees.append((lidx, lv))

        if not lignes_ordonnees:
            # Pas de line1/line2... => couche vide
            continue

        lignes_ordonnees.sort(key=lambda x: x[0])

        # Concaténer line1, line2, ...
        for _, liste in lignes_ordonnees:
            resultat.extend(liste)

    return resultat

def main():
    # Utilisation:
    #   python mergeMapData.py result.json
    #   python mergeMapData.py result.json sortie.json
    #   python mergeMapData.py "{\"couche1\": {\"line1\": [1]}}"  out.json
    if len(sys.argv) < 2:
        print("Utilisation: python mergeMapData.py <fichier_ou_json> [fichier_sortie]", file=sys.stderr)
        sys.exit(1)

    src = sys.argv[1]
    explicit_out = sys.argv[2] if len(sys.argv) > 2 else None

    try:
        data, src_path = charger_json_arg(src)
    except json.JSONDecodeError as e:
        print(f"JSON invalide : {e}", file=sys.stderr)
        sys.exit(2)

    try:
        flat = aplatir_couches(data)
    except ValueError as e:
        print(str(e), file=sys.stderr)
        sys.exit(3)

    out_path = chemin_sortie(src_path, explicit_out)

    try:
        out_path.parent.mkdir(parents=True, exist_ok=True)
        with out_path.open("w", encoding="utf-8", newline="\n") as f:
            json.dump(flat, f, ensure_ascii=False, indent=2)
    except OSError as e:
        print(f"Erreur d'écriture dans {out_path}: {e}", file=sys.stderr)
        sys.exit(4)

    print(f"OK, tableau reconstruit écrit dans: {out_path}")

if __name__ == "__main__":
    main()
