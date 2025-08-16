#!/usr/bin/env python3
# splitMapData.py
import json
import sys
import math
from pathlib import Path
from typing import Any, List, Dict, Optional, Tuple

def split_en_n_dyn_lignes(tableau: List[Any], tuiles_par_ligne: int, nb_couches: int = 6) -> Dict[str, Dict[str, List[Any]]]:
    """
    1) Sépare `tableau` en `nb_couches` couches égales (couche1..coucheN).
    2) Dans chaque couche, crée dynamiquement le nombre de lignes nécessaire :
       nb_lignes = ceil(len(couche) / tuiles_par_ligne).
       Chaque ligne contient au plus `tuiles_par_ligne` éléments.
    """
    if tuiles_par_ligne <= 0:
        raise ValueError("tuiles_par_ligne doit être un entier > 0.")

    n = len(tableau)
    if nb_couches <= 0:
        raise ValueError("nb_couches doit être > 0.")
    if n % nb_couches != 0:
        raise ValueError(
            f"Impossible de séparer {n} éléments en {nb_couches} couches égales (n doit être multiple de {nb_couches})."
        )

    taille_couche = n // nb_couches
    nb_lignes = max(1, math.ceil(taille_couche / tuiles_par_ligne))

    resultat: Dict[str, Dict[str, List[Any]]] = {}

    for i in range(nb_couches):
        debut = i * taille_couche
        fin = (i + 1) * taille_couche
        sous_tab = tableau[debut:fin]

        lignes = {}
        for l in range(nb_lignes):
            start = l * tuiles_par_ligne
            end = start + tuiles_par_ligne
            lignes[f"line{l+1}"] = sous_tab[start:end]
        resultat[f"couche{i+1}"] = lignes

    return resultat

def charger_json_arg(arg: str) -> Tuple[List[Any], Optional[Path]]:
    """
    Si `arg` est un chemin de fichier existant, lit le JSON depuis ce fichier et retourne (data, path).
    Sinon, traite `arg` comme une chaîne JSON brute et retourne (data, None).
    """
    p = Path(arg).expanduser()
    if p.exists() and p.is_file():
        with p.open("r", encoding="utf-8") as f:
            return json.load(f), p
    else:
        return json.loads(arg), None

def chemin_sortie(source_path: Optional[Path]) -> Path:
    """Écrit 'result.json' dans le même dossier que la source si fournie, sinon dans le dossier courant."""
    if source_path is not None:
        return source_path.with_name("result.json")
    return Path.cwd() / "result.json"

def main():
    # Exemples:
    #   python splitMapData.py data.json 30
    #   python splitMapData.py "[1,2,3,4,5,6,7,8,9,10,11,12]" 2
    if len(sys.argv) < 2:
        print('Utilisation: python splitMapData.py <json_ou_fichier.json> <tuiles_par_ligne>', file=sys.stderr)
        sys.exit(1)

    if len(sys.argv) < 3:
        print('Erreur: il manque <tuiles_par_ligne>.', file=sys.stderr)
        sys.exit(1)

    try:
        data, src_path = charger_json_arg(sys.argv[1])
    except json.JSONDecodeError as e:
        print("Impossible de décoder le JSON. Passe un fichier JSON valide ou une chaîne JSON brute.\n"
              f"Détail: {e}", file=sys.stderr)
        sys.exit(2)

    try:
        tuiles_par_ligne = int(sys.argv[2])
    except ValueError:
        print("<tuiles_par_ligne> doit être un entier.", file=sys.stderr)
        sys.exit(3)

    if not isinstance(data, list):
        print("L'entrée doit être un tableau JSON (liste).", file=sys.stderr)
        sys.exit(4)

    try:
        res = split_en_n_dyn_lignes(data, tuiles_par_ligne, nb_couches=6)
    except ValueError as e:
        print(str(e), file=sys.stderr)
        sys.exit(5)

    out_path = chemin_sortie(src_path)
    try:
        with out_path.open("w", encoding="utf-8", newline="\n") as f:
            json.dump(res, f, ensure_ascii=False, indent=2)
    except OSError as e:
        print(f"Erreur lors de l'écriture de {out_path}: {e}", file=sys.stderr)
        sys.exit(6)

    print(f"OK, résultat écrit dans: {out_path}")

if __name__ == "__main__":
    main()
