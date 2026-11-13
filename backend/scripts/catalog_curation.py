"""Hand-maintained inputs for build_vehicle_catalog.py.

MAKES            display name -> spellings used in the EEA "Mk" column
CURATED_MODELS   models popular in Türkiye: (display name, regex on the cleaned EEA
                 commercial name, fuel tank in litres). Patterns are tried in order,
                 so specific names ("Yaris Cross") must come before generic ones ("Yaris").
MOTORCYCLES      (model, engine cc, litres per 100 km in everyday riding, tank in litres)

Tank capacities and motorcycle figures are typical published values for the most common
version of each model. A model sold for many years can have changed tank size between
generations, so the site always lets the driver correct the number.
"""

MAKES = {
    "Alfa Romeo": ["ALFA ROMEO"],
    "Audi": ["AUDI"],
    "BMW": ["BMW"],
    "Chevrolet": ["CHEVROLET"],
    "Citroën": ["CITROEN"],
    "Cupra": ["CUPRA"],
    "Dacia": ["DACIA"],
    "Fiat": ["FIAT"],
    "Ford": ["FORD"],
    "Honda": ["HONDA"],
    "Hyundai": ["HYUNDAI"],
    "Jeep": ["JEEP"],
    "Kia": ["KIA"],
    "Land Rover": ["LAND ROVER"],
    "Mazda": ["MAZDA"],
    "Mercedes-Benz": ["MERCEDES-BENZ", "MERCEDES BENZ", "MERCEDES"],
    "MG": ["MG"],
    "Mini": ["MINI"],
    "Mitsubishi": ["MITSUBISHI"],
    "Nissan": ["NISSAN"],
    "Opel": ["OPEL"],
    "Peugeot": ["PEUGEOT"],
    "Porsche": ["PORSCHE"],
    "Renault": ["RENAULT"],
    "Seat": ["SEAT"],
    "Skoda": ["SKODA"],
    "SsangYong": ["SSANGYONG"],
    "Subaru": ["SUBARU"],
    "Suzuki": ["SUZUKI"],
    "Toyota": ["TOYOTA"],
    "Volkswagen": ["VOLKSWAGEN", "VW", "VOLKSWAGEN VW"],
    "Volvo": ["VOLVO"],
}

# EEA lists these makes by trim ("320D", "A 180"), so only the curated patterns are used.
AUTO_TIER_EXCLUDED_MAKES = {"Audi", "BMW", "Land Rover", "Mercedes-Benz", "Mini", "Porsche", "Volvo"}

# Repairs for automatically derived model names: a new spelling, or None to drop the name.
AUTO_MODEL_FIXES = {
    "TRAFFIC": "TRAFIC", "LANDCRUISER": "LAND CRUISER", "KA+": "KA", "VIVARO-B": "VIVARO", "COMBOLIFE": "COMBO",
    "SX4 SUZUKI": "SX4",
    **dict.fromkeys([
        "LAND", "NA", "LEXUS", "IX", "ALFA", "GRAND", "SUV", "DS", "ABARTH", "CUSTOM", "TOU", "TOURNEO", "VARIOBUS",
        "CUPRA", "ZAFIRA", "DUSTER", "C-ELYSSEE", "N208", "N5008", "308SW", "I30I30CW", "I30I30N", "EDCEED",
    ]),
}

CURATED_MODELS = {
    "Alfa Romeo": [("Giulietta", r"^GIULIETTA", 60), ("Giulia", r"^GIULIA\b", 58), ("Stelvio", r"^STELVIO", 64), ("MiTo", r"^MITO", 45)],
    "Audi": [
        ("A1", r"^A1\b", 40), ("A3", r"^A3\b", 50), ("A4", r"^A4\b", 54), ("A5", r"^A5\b", 58), ("A6", r"^A6\b", 63),
        ("Q2", r"^Q2\b", 50), ("Q3", r"^Q3\b", 60), ("Q5", r"^Q5\b", 70), ("Q7", r"^Q7\b", 85),
    ],
    "BMW": [
        ("X1", r"^X1\b", 51), ("X2", r"^X2\b", 51), ("X3", r"^X3\b", 65), ("X5", r"^X5\b", 83),
        ("1 Series", r"^1[1-4]\d ?[DI]", 50), ("2 Series", r"^2[1-4]\d ?[DI]", 52), ("3 Series", r"^3[1-4]\d ?[DI]", 59),
        ("4 Series", r"^4[1-4]\d ?[DI]", 59), ("5 Series", r"^5[1-5]\d ?[DI]", 66),
    ],
    "Chevrolet": [("Cruze", r"^CRUZE", 60), ("Aveo", r"^AVEO", 46), ("Spark", r"^SPARK", 35), ("Captiva", r"^CAPTIVA", 65)],
    "Citroën": [
        ("C3 Aircross", r"^C3 AIRCROSS", 45), ("C5 Aircross", r"^C5 AIRCROSS", 53), ("C4 Cactus", r"^C4 CACTUS", 50),
        ("C-Elysée", r"^C[- ]?ELYSEE", 50), ("C3", r"^C3\b", 45), ("C4", r"^C4\b", 50), ("Berlingo", r"^BERLINGO", 50),
    ],
    "Cupra": [("Formentor", r"^FORMENTOR", 50), ("Leon", r"^LEON", 50), ("Ateca", r"^ATECA", 55)],
    "Dacia": [
        ("Duster", r"^DUSTER", 50), ("Sandero", r"^SANDERO", 50), ("Logan", r"^LOGAN", 50), ("Lodgy", r"^LODGY", 50),
        ("Dokker", r"^DOKKER", 50), ("Jogger", r"^JOGGER", 50),
    ],
    "Fiat": [
        ("Egea / Tipo", r"^(TIPO|EGEA)\b", 50), ("Linea", r"^LINEA", 45), ("Punto", r"PUNTO", 45),
        ("500X", r"^500 ?X\b", 48), ("500L", r"^500 ?L\b", 50), ("500", r"^500\b", 35), ("Panda", r"^PANDA", 37),
        ("Doblo", r"^DOBLO", 60), ("Fiorino / Qubo", r"^(QUBO|FIORINO)", 45),
    ],
    "Ford": [
        ("Focus", r"^FOCUS", 52), ("Fiesta", r"^FIESTA", 42), ("Kuga", r"^KUGA", 54), ("Puma", r"^PUMA", 42),
        ("EcoSport", r"^ECOSPORT", 52), ("Mondeo", r"^MONDEO", 62), ("C-Max", r"^(GRAND )?C[- ]?MAX", 55),
        ("Tourneo Courier", r"^TOURNEO COURIER", 48), ("Tourneo Connect", r"^(GRAND )?TOURNEO CONNECT", 60),
    ],
    "Honda": [("Civic", r"^CIVIC", 47), ("Jazz", r"^JAZZ", 40), ("CR-V", r"^CR[- ]?V", 57), ("HR-V", r"^HR[- ]?V", 50), ("Accord", r"^ACCORD", 65)],
    "Hyundai": [
        ("i10", r"^I ?10\b", 36), ("i20", r"^I ?20\b", 40), ("i30", r"^I ?30\b", 50), ("Elantra", r"^ELANTRA", 50),
        ("Tucson", r"^TUCSON", 54), ("Kona", r"^KONA", 50), ("Bayon", r"^BAYON", 40), ("ix35", r"^IX ?35", 58),
        ("Santa Fe", r"^SANTA ?FE", 67),
    ],
    "Jeep": [("Renegade", r"^RENEGADE", 48), ("Compass", r"^COMPASS", 60), ("Cherokee", r"^CHEROKEE", 60)],
    "Kia": [
        ("Picanto", r"^PICANTO", 35), ("Rio", r"^RIO", 45), ("XCeed", r"^X ?CEED", 50), ("Ceed", r"^(PRO[ _]?)?CEE ?D", 50),
        ("Sportage", r"^SPORTAGE", 62), ("Stonic", r"^STONIC", 45), ("Niro", r"^NIRO", 45), ("Sorento", r"^SORENTO", 67),
    ],
    "Land Rover": [
        ("Range Rover Evoque", r"EVOQUE", 54), ("Discovery Sport", r"DISCOVERY SPORT", 54),
        ("Range Rover Sport", r"RANGE ROVER SPORT", 80),
    ],
    "Mazda": [("CX-3", r"^CX[- ]?3\b", 48), ("CX-30", r"^CX[- ]?30\b", 51), ("CX-5", r"^CX[- ]?5\b", 56),
              ("Mazda2", r"^(MAZDA ?)?2\b", 44), ("Mazda3", r"^(MAZDA ?)?3\b", 51), ("Mazda6", r"^(MAZDA ?)?6\b", 62)],
    "Mercedes-Benz": [
        ("CLA", r"^CLA\b", 50), ("GLA", r"^GLA\b", 50), ("GLB", r"^GLB\b", 52), ("GLC", r"^GLC\b", 62),
        ("A-Class", r"^A ?\d{3}", 43), ("B-Class", r"^B ?\d{3}", 43), ("C-Class", r"^C ?\d{3}", 66), ("E-Class", r"^E ?\d{3}", 66),
    ],
    "MG": [("ZS", r"^ZS\b", 48), ("HS", r"^HS\b", 55)],
    "Mini": [("Countryman", r"COUNTRYMAN", 51), ("Clubman", r"CLUBMAN", 48), ("Hatch (Cooper / One)", r"^(COOPER|ONE|JOHN COOPER)", 40)],
    "Mitsubishi": [("ASX", r"^ASX", 63), ("Space Star", r"^SPACE ?STAR", 35), ("Eclipse Cross", r"^ECLIPSE CROSS", 63), ("Outlander", r"^OUTLANDER", 60)],
    "Nissan": [("Qashqai", r"^QASHQAI", 55), ("Juke", r"^JUKE", 46), ("Micra", r"^MICRA", 41), ("X-Trail", r"^X[- ]?TRAIL", 60),
               ("Note", r"^NOTE", 41), ("Pulsar", r"^PULSAR", 46)],
    "Opel": [
        ("Corsa", r"^CORSA", 44), ("Astra", r"^ASTRA", 50), ("Insignia", r"^INSIGNIA", 62), ("Mokka", r"^MOKKA", 48),
        ("Crossland", r"^CROSSLAND", 45), ("Grandland", r"^GRANDLAND", 53), ("Meriva", r"^MERIVA", 54), ("Zafira", r"^ZAFIRA", 58),
    ],
    "Peugeot": [
        ("2008", r"^2008\b", 44), ("3008", r"^3008\b", 53), ("5008", r"^5008\b", 56), ("208", r"^208\b", 44),
        ("301", r"^301\b", 50), ("308", r"^308\b", 53), ("508", r"^508\b", 55), ("Rifter", r"^RIFTER", 50),
    ],
    "Porsche": [("Macan", r"^MACAN", 65), ("Cayenne", r"^CAYENNE", 75)],
    "Renault": [
        ("Clio", r"^CLIO", 45), ("Megane", r"^MEGANE", 50), ("Symbol / Thalia", r"^(SYMBOL|THALIA)", 50), ("Fluence", r"^FLUENCE", 60),
        ("Captur", r"^CAPTUR", 48), ("Kadjar", r"^KADJAR", 55), ("Talisman", r"^TALISMAN", 51), ("Austral", r"^AUSTRAL", 55),
        ("Koleos", r"^KOLEOS", 60), ("Scenic", r"^(GRAND )?SCENIC", 52), ("Kangoo", r"^KANGOO", 60),
    ],
    "Seat": [("Ibiza", r"^IBIZA", 40), ("Leon", r"^LEON", 50), ("Arona", r"^ARONA", 40), ("Ateca", r"^ATECA", 50),
             ("Toledo", r"^TOLEDO", 55), ("Tarraco", r"^TARRACO", 58)],
    "Skoda": [
        ("Fabia", r"^FABIA", 45), ("Octavia", r"^OCTAVIA", 50), ("Superb", r"^SUPERB", 66), ("Kamiq", r"^KAMIQ", 50),
        ("Karoq", r"^KAROQ", 50), ("Kodiaq", r"^KODIAQ", 58), ("Scala", r"^SCALA", 50), ("Rapid", r"^RAPID", 55), ("Yeti", r"^YETI", 55),
    ],
    "SsangYong": [("Tivoli", r"^TIVOLI", 47), ("Korando", r"^KORANDO", 50)],
    "Subaru": [("XV", r"^XV\b", 63), ("Forester", r"^FORESTER", 63)],
    "Suzuki": [("Swift", r"^SWIFT", 37), ("Vitara", r"^VITARA", 47), ("SX4 S-Cross", r"^(SX4 )?S[- ]?CROSS", 47),
               ("Jimny", r"^JIMNY", 40), ("Ignis", r"^IGNIS", 32), ("Baleno", r"^BALENO", 37)],
    "Toyota": [
        ("Yaris Cross", r"^YARIS CROSS", 42), ("Corolla Cross", r"^COROLLA CROSS", 47), ("Corolla", r"^COROLLA", 50),
        ("Yaris", r"^YARIS", 42), ("C-HR", r"^C[- ]?HR", 50), ("RAV4", r"^RAV ?4", 55), ("Auris", r"^AURIS", 50),
        ("Avensis", r"^AVENSIS", 60), ("Verso", r"^VERSO", 55),
    ],
    "Volkswagen": [
        ("T-Roc", r"^T[- ]?ROC", 50), ("T-Cross", r"^T[- ]?CROSS", 40), ("Taigo", r"^TAIGO", 40), ("Tiguan", r"^TIGUAN", 58),
        ("Polo", r"^POLO", 40), ("Golf", r"^GOLF", 50), ("Passat", r"^PASSAT", 66), ("Jetta", r"^JETTA", 55),
        ("Arteon", r"^ARTEON", 66), ("Caddy", r"^CADDY", 55), ("Touran", r"^TOURAN", 58),
    ],
    "Volvo": [("XC40", r"^XC ?40", 54), ("XC60", r"^XC ?60", 60), ("XC90", r"^XC ?90", 71), ("S60", r"^S ?60", 60),
              ("S90", r"^S ?90", 60), ("V40", r"^V ?40", 62)],
}

MOTORCYCLES = {
    "Bajaj": [("Pulsar NS200", 199, 2.9, 12), ("Dominar 250", 249, 3.2, 13), ("Dominar 400", 373, 3.7, 13)],
    "BMW Motorrad": [("G 310 GS", 313, 3.3, 11), ("C 400 X", 350, 3.5, 12.8), ("F 850 GS", 853, 4.1, 15), ("R 1250 GS", 1254, 4.8, 20)],
    "CFMoto": [("250NK", 249, 3.2, 12.5), ("450SR", 449, 4.0, 14), ("450MT", 449, 4.2, 17.5), ("650MT", 649, 4.9, 18), ("800MT", 799, 5.5, 19)],
    "Honda Motor": [
        ("Dio 110", 109, 1.9, 5.2), ("Activa 125", 124, 2.0, 5.3), ("PCX 125", 125, 2.1, 8.1), ("CB125F", 124, 2.0, 11),
        ("CL250", 249, 3.2, 12), ("CB250R", 249, 3.3, 10.1), ("CBR250R", 249, 3.3, 13), ("Forza 250", 249, 3.4, 11.7),
        ("CB650R", 649, 4.9, 15.4), ("NC750X", 745, 3.5, 14.1), ("Africa Twin 1100", 1084, 4.9, 18.8),
    ],
    "Kawasaki": [("Ninja 400", 399, 4.1, 14), ("Z650", 649, 4.3, 15), ("Versys 650", 649, 4.5, 21), ("Z900", 948, 5.7, 17)],
    "KTM": [("250 Duke", 249, 3.2, 13.4), ("390 Duke", 373, 3.4, 13.4), ("390 Adventure", 373, 3.4, 14.5), ("790 Duke", 799, 4.4, 14)],
    "Kymco": [("Downtown 250i", 249, 3.6, 12.5), ("Agility 125", 125, 2.5, 7)],
    "Mondial": [("125 Drift L", 124, 2.4, 12), ("150 Mash", 149, 2.6, 6)],
    "Royal Enfield": [("Classic 350", 349, 2.7, 13), ("Meteor 350", 349, 2.7, 15), ("Himalayan 411", 411, 3.2, 15)],
    "Suzuki Motor": [("Address 125", 124, 1.9, 5), ("GSX-R125", 124, 2.3, 11), ("Burgman 400", 400, 4.0, 13.5), ("V-Strom 650", 645, 4.2, 20)],
    "SYM": [("Jet 14 125", 125, 2.4, 7.5), ("Joyride 300", 278, 3.5, 12)],
    "TVS": [("Jupiter 125", 124, 1.9, 5.1), ("Apache RTR 200", 198, 2.8, 12)],
    "Vespa": [("Primavera 150", 155, 2.6, 8), ("GTS 300", 278, 3.3, 8.5)],
    "Yamaha": [
        ("D'elight 125", 125, 1.8, 5.5), ("NMAX 125", 125, 2.2, 7.1), ("NMAX 155", 155, 2.3, 7.1), ("Tricity 125", 125, 2.4, 7.2),
        ("XMAX 250", 249, 3.2, 13), ("XMAX 300", 292, 3.2, 13), ("MT-25", 249, 3.6, 14), ("R25", 249, 3.6, 14),
        ("MT-07", 689, 4.3, 14), ("Tracer 7", 689, 4.3, 17), ("Ténéré 700", 689, 4.3, 16), ("MT-09", 890, 5.0, 14),
    ],
}
