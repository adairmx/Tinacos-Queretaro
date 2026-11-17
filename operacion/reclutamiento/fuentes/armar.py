"""Junta la investigación web (JSON por ciudad) y las fichas de Google Maps en un Excel para llamar."""
import glob, json, os, re, sys
from openpyxl import Workbook
from openpyxl.styles import Alignment, Font, PatternFill
from openpyxl.utils import get_column_letter
from openpyxl.worksheet.datavalidation import DataValidation

AQUI = os.path.dirname(os.path.abspath(__file__))
SALIDA = sys.argv[1]

ORDEN = ["San Luis Potosí", "Querétaro", "CDMX", "Edomex", "Toluca", "Guadalajara", "Monterrey", "Puebla",
         "Cuernavaca", "León", "Aguascalientes", "Mérida", "Cancún"]

LADAS = {"33": "Guadalajara", "81": "Monterrey", "220": "Puebla", "221": "Puebla", "222": "Puebla",
         "442": "Querétaro", "446": "Querétaro", "427": "Querétaro", "444": "San Luis Potosí",
         "477": "León", "479": "León", "449": "Aguascalientes", "722": "Toluca", "729": "Toluca",
         "777": "Cuernavaca", "999": "Mérida", "998": "Cancún", "984": "Cancún", "987": "Cancún"}

ESPECIALISTA = re.compile(r"tinaco|cisterna|aljibe|tanques? de agua|rotoplas|sisterna", re.I)
PROPIO = re.compile(r"monsterco|lavadotinacos\.com", re.I)


def digitos(tel):
    d = re.sub(r"\D", "", tel or "")
    if len(d) > 10 and d.startswith("52"):
        d = d[2:]
    if len(d) == 11 and d.startswith("1"):
        d = d[1:]
    return d


def ciudad_por_lada(d):
    for largo in (3, 2):
        if d[:largo] in LADAS:
            return LADAS[d[:largo]]
    return None


def formato(d):
    if len(d) != 10:
        return d
    return f"{d[:2]} {d[2:6]} {d[6:]}" if d[:2] in ("33", "55", "56", "81") else f"{d[:3]} {d[3:6]} {d[6:]}"


registros = []
for archivo in sorted(glob.glob(os.path.join(AQUI, "*.json"))):
    for r in json.load(open(archivo, encoding="utf-8")):
        r = {k: (v or "").strip() for k, v in r.items()}
        tipo = "Especialista" if r.get("tipo", "").lower().startswith("especialista") else "Secundario"
        registros.append({**r, "tipo": tipo, "origen": "Búsqueda web"})

for linea in open(os.path.join(AQUI, "maps.tsv"), encoding="utf-8"):
    if not linea.strip():
        continue
    c, n, p, cal, info, pid = (linea.rstrip("\n").split("\t") + [""] * 6)[:6]
    d = digitos(p)
    ciudad = ciudad_por_lada(d) or c
    nota = ""
    if ciudad_por_lada(d) and ciudad_por_lada(d) != c:
        nota = f"Salió buscando en {c}; por su lada es de {ciudad}."
    elif d and not ciudad_por_lada(d) and not d.startswith(("55", "56", "800")):
        nota = f"Lada {d[:3]} no es de {c}: confirmar dónde trabaja."
    registros.append({
        "ciudad": ciudad, "zona": info.split("·")[-1].strip() if "·" in info else info, "nombre": n.strip(),
        "tipo": "Especialista" if ESPECIALISTA.search(n + " " + info) else "Secundario",
        "servicios": info.split("·")[0].strip() if "·" in info else "", "telefono": p, "whatsapp": "",
        "facebook": "", "instagram": "", "web": "",
        "google_maps": f"https://www.google.com/maps/place/?q=place_id:{pid.strip()}" if pid.strip() else "",
        "calificacion": cal.strip(), "fuente": "Google Maps (16 nov 2026)", "notas": nota, "origen": "Google Maps",
    })

# Junta duplicados por teléfono (o por nombre si no hay teléfono).
unidos = {}
for r in registros:
    if PROPIO.search(r["nombre"] + " " + r.get("web", "")):
        continue
    d = digitos(r["telefono"]) or digitos(r["whatsapp"])
    clave = d if len(d) >= 8 else re.sub(r"\W", "", r["nombre"].lower()) + r["ciudad"]
    if clave in unidos:
        a = unidos[clave]
        for k in ("zona", "servicios", "whatsapp", "facebook", "instagram", "web", "google_maps", "calificacion"):
            if not a.get(k) and r.get(k):
                a[k] = r[k]
        if r["tipo"] == "Especialista":
            a["tipo"] = "Especialista"
        if r["origen"] not in a["origen"]:
            a["origen"] += " + " + r["origen"]
        if r["fuente"] and r["fuente"] not in a["fuente"]:
            a["fuente"] += " | " + r["fuente"]
        if r["notas"] and r["notas"] not in a["notas"]:
            a["notas"] = (a["notas"] + " " + r["notas"]).strip()
    else:
        unidos[clave] = dict(r)


# Un registro sin teléfono se junta con otro del mismo nombre y ciudad que sí tenga.
def nombre_base(r):
    return re.sub(r"\W", "", re.split(r"[(\-|,]", r["nombre"].lower())[0]) + r["ciudad"]

con_tel = {nombre_base(r): r for r in unidos.values() if digitos(r["telefono"]) or digitos(r["whatsapp"])}
for clave, r in list(unidos.items()):
    if digitos(r["telefono"]) or digitos(r["whatsapp"]):
        continue
    destino = con_tel.get(nombre_base(r))
    if destino:
        for k in ("facebook", "instagram", "web", "zona"):
            if not destino.get(k) and r.get(k):
                destino[k] = r[k]
        if r["tipo"] == "Especialista":
            destino["tipo"] = "Especialista"
        destino["fuente"] += " | " + r["fuente"]
        destino["origen"] = "Búsqueda web + Google Maps" if destino["origen"] != r["origen"] else destino["origen"]
        del unidos[clave]


def resenas(cal):
    m = re.search(r"\(([\d.,]+)", cal or "")
    return int(re.sub(r"\D", "", m.group(1))) if m else 0


def prioridad(r):
    tiene_tel = bool(digitos(r["telefono"]) or digitos(r["whatsapp"]))
    if r["tipo"] == "Especialista" and tiene_tel and (resenas(r["calificacion"]) >= 5 or "Google Maps" in r["origen"]):
        return 1
    if r["tipo"] == "Especialista" and tiene_tel:
        return 2
    return 3 if tiene_tel else 4


filas = []
for r in unidos.values():
    if r["ciudad"] not in ORDEN:
        r["notas"] = (f"Ciudad original: {r['ciudad']}. " + r["notas"]).strip()
        r["ciudad"] = "CDMX" if r["ciudad"].upper().startswith("CDMX") else r["ciudad"]
    tel = digitos(r["telefono"])
    wa = digitos(r["whatsapp"]) or (tel if len(tel) == 10 else "")
    filas.append({**r, "prioridad": prioridad(r), "telefono": formato(tel) if tel else r["telefono"],
                  "wa_link": f"https://wa.me/52{wa}" if len(wa) == 10 else ""})

filas.sort(key=lambda r: (ORDEN.index(r["ciudad"]) if r["ciudad"] in ORDEN else 99, r["prioridad"],
                          -resenas(r["calificacion"]), r["nombre"].lower()))

COLUMNAS = [("Prioridad", "prioridad", 9), ("Ciudad", "ciudad", 14), ("Nombre", "nombre", 42), ("Tipo", "tipo", 13),
            ("Teléfono", "telefono", 15), ("WhatsApp", "wa_link", 26), ("Calificación Google", "calificacion", 13),
            ("Zona / dirección", "zona", 30), ("Servicios", "servicios", 30), ("Facebook", "facebook", 26),
            ("Instagram", "instagram", 20), ("Web", "web", 26), ("Ficha de Google", "google_maps", 26),
            ("Fuente", "fuente", 30), ("Notas", "notas", 40), ("Origen", "origen", 14),
            ("Estado de la llamada", None, 20), ("Fecha", None, 12), ("Comentarios", None, 40)]
ESTADOS = '"Pendiente,No contesta,Llamar después,Interesado,Ya se registró,No le interesa,Número equivocado"'

ARIAL = Font(name="Arial", size=10)
NEGRITA = Font(name="Arial", size=10, bold=True, color="FFFFFF")
ENCABEZADO = PatternFill("solid", fgColor="1F4E78")
LLENAR = PatternFill("solid", fgColor="FFF2CC")
PRIO = {1: "C6EFCE", 2: "DDEBF7", 3: "F2F2F2", 4: "F2F2F2"}

wb = Workbook()
guia = wb.active
guia.title = "Cómo usar"
texto = [
    "Prospectos de proveedores por ciudad — investigación del 16 de noviembre de 2026",
    "",
    "Qué hay aquí: negocios y técnicos que anuncian lavado de tinacos, cisternas o aljibes (Especialista), y plomeros, "
    "desazolves, fumigadoras o empresas de limpieza que podrían hacerlo (Secundario).",
    "Fuentes: fichas de Google Maps (con calificación y reseñas), Sección Amarilla, sitios web propios, Facebook y otros "
    "directorios. Cada fila dice de dónde salió.",
    "",
    "Prioridad:",
    "  1 = especialista con teléfono y ficha de Google o reseñas: llamar primero.",
    "  2 = especialista con teléfono, sin reseñas.",
    "  3 = secundario con teléfono: preguntar si lava tinacos y cisternas.",
    "  4 = sin teléfono: buscarlo por Facebook o su web.",
    "",
    "Qué llenas tú (columnas amarillas): Estado de la llamada (lista desplegable), Fecha y Comentarios.",
    "Ejemplo: Estado = Interesado · Fecha = 17/11/2026 · Comentarios = Cobra $900 tinaco, trabaja Soledad y centro, "
    "le mandé el enlace de registro.",
    "",
    "Cuidado: varios números salen de directorios y pueden estar viejos. Algunas fichas aparecieron al buscar en una "
    "ciudad pero su lada es de otra; se movieron a la ciudad de su lada y la nota lo dice.",
    "Algunas empresas grandes de CDMX cubren Edomex; pueden ser competencia más que proveedores.",
    "La columna WhatsApp arma el enlace con el teléfono; si es fijo, no abrirá chat.",
]
for i, t in enumerate(texto, 1):
    guia.cell(row=i, column=1, value=t).font = Font(name="Arial", size=12 if i == 1 else 10, bold=i == 1)
guia.column_dimensions["A"].width = 120

resumen_fila = len(texto) + 2
guia.cell(row=resumen_fila, column=1, value="Ciudad").font = Font(name="Arial", size=10, bold=True)
guia.cell(row=resumen_fila, column=2, value="Total").font = Font(name="Arial", size=10, bold=True)
guia.cell(row=resumen_fila, column=3, value="Especialistas").font = Font(name="Arial", size=10, bold=True)
guia.cell(row=resumen_fila, column=4, value="Prioridad 1").font = Font(name="Arial", size=10, bold=True)
guia.cell(row=resumen_fila, column=5, value="Interesados").font = Font(name="Arial", size=10, bold=True)
for c in "BCDE":
    guia.column_dimensions[c].width = 14


def hoja(nombre, datos):
    ws = wb.create_sheet(nombre[:31])
    for j, (titulo, _, ancho) in enumerate(COLUMNAS, 1):
        celda = ws.cell(row=1, column=j, value=titulo)
        celda.font, celda.fill = NEGRITA, ENCABEZADO
        celda.alignment = Alignment(wrap_text=True, vertical="center")
        ws.column_dimensions[get_column_letter(j)].width = ancho
    for i, r in enumerate(datos, 2):
        for j, (_, clave, _) in enumerate(COLUMNAS, 1):
            valor = r.get(clave, "") if clave else ""
            celda = ws.cell(row=i, column=j, value=valor if valor != "" else None)
            celda.font = ARIAL
            if clave is None:
                celda.fill = LLENAR
            if clave in ("wa_link", "google_maps", "facebook", "web", "instagram") and str(valor).startswith("http"):
                celda.hyperlink = valor
                celda.font = Font(name="Arial", size=10, color="0563C1", underline="single")
        ws.cell(row=i, column=1).fill = PatternFill("solid", fgColor=PRIO[r["prioridad"]])
        ws.cell(row=i, column=17, value="Pendiente")
    ws.freeze_panes = "D2"
    ws.auto_filter.ref = f"A1:{get_column_letter(len(COLUMNAS))}{max(2, len(datos) + 1)}"
    dv = DataValidation(type="list", formula1=ESTADOS, allow_blank=True)
    ws.add_data_validation(dv)
    dv.add(f"Q2:Q{len(datos) + 200}")
    return ws


hoja("Todas", filas)
for k, ciudad in enumerate(ORDEN):
    datos = [r for r in filas if r["ciudad"] == ciudad]
    hoja(ciudad, datos)
    fila = resumen_fila + 1 + k
    ref = f"'{ciudad}'"
    guia.cell(row=fila, column=1, value=ciudad).font = ARIAL
    guia.cell(row=fila, column=2, value=f"=COUNTA({ref}!C2:C1000)").font = ARIAL
    guia.cell(row=fila, column=3, value=f'=COUNTIF({ref}!D2:D1000,"Especialista")').font = ARIAL
    guia.cell(row=fila, column=4, value=f"=COUNTIF({ref}!A2:A1000,1)").font = ARIAL
    guia.cell(row=fila, column=5, value=f'=COUNTIF({ref}!Q2:Q1000,"Interesado")').font = ARIAL
total = resumen_fila + 1 + len(ORDEN)
guia.cell(row=total, column=1, value="Total").font = Font(name="Arial", size=10, bold=True)
for col in "BCDE":
    guia[f"{col}{total}"] = f"=SUM({col}{resumen_fila + 1}:{col}{total - 1})"
    guia[f"{col}{total}"].font = Font(name="Arial", size=10, bold=True)

wb.save(SALIDA)
from collections import Counter
print(len(filas), "filas")
print(Counter(r["ciudad"] for r in filas))
print(Counter(r["prioridad"] for r in filas))
print("fuera de orden:", [r["ciudad"] for r in filas if r["ciudad"] not in ORDEN])
