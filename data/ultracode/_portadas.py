"""Portadas 1200x675 para los artículos nuevos: foto del tema (de las que ya hay), oscurecida, con título y categoría.

Uso: python -I _portadas.py   (lee los JSON de esta carpeta con accion "nuevo" y sin imagen propia en el sitio)
"""
import glob, json, os, textwrap
from PIL import Image, ImageDraw, ImageFilter, ImageFont

AQUI = os.path.dirname(os.path.abspath(__file__))
IMAGENES = os.path.join(AQUI, "..", "..", "client", "public", "images", "blog")
NEGRITA = "C:/Windows/Fonts/segoeuib.ttf"
NORMAL = "C:/Windows/Fonts/segoeui.ttf"

# slug -> (foto base, desplazamiento horizontal del recorte 0..1) para que no se vean iguales
BASE = {
    "como-cerrar-el-agua-de-toda-la-casa": ("bomba-de-agua-zumba-no-sube-diagnostico.webp", 0.2),
    "tinaco-tira-agua-por-arriba-o-por-el-respiradero": ("agua-turbia-despues-de-lluvia-en-el-tinaco.webp", 0.5),
    "tinaco-se-desborda-aunque-el-flotador-funciona": ("preparar-tinacos-para-temporada-de-estiaje.webp", 0.5),
    "wc-no-deja-de-tirar-agua-como-arreglarlo": ("biopelicula-en-tinacos-que-es-y-como-removerla.webp", 0.3),
    "fuga-de-agua-debajo-del-inodoro": ("agua-amarilla-mal-olor-regadera.webp", 0.5),
    "se-rompio-un-tubo-en-casa-que-hacer": ("lodo-en-el-fondo-del-tinaco-de-donde-proviene.webp", 0.6),
    "por-que-no-sale-agua-de-la-regadera-si-el-tinaco-esta-lleno": ("reductores-de-caudal-en-regaderas-y-grifos.webp", 0.7),
    "boiler-no-prende-o-se-apaga-solo": ("presion-del-presurizador-sube-y-baja-sin-parar.webp", 0.6),
    "sale-agua-fria-pero-no-caliente-en-la-regadera": ("sarro-en-tinaco-y-calentador.webp", 0.4),
    "recibo-de-agua-muy-alto-como-saber-si-hay-fuga": ("filtro-de-sedimentos-para-tinaco-cartuchos.webp", 0.5),
    "que-flotador-es-mejor-para-tinaco": ("flotador-tinaco-descalibrado-ajuste.webp", 0.4),
    "preguntas-para-hacerle-a-un-plomero-antes-de-contratarlo": ("pichancha-de-cisterna-atascada-sintomas-cambio.webp", 0.3),
    "cuanto-cobra-un-plomero-en-mexico": ("errores-al-lavar-el-tinaco-por-cuenta-propia.webp", 0.6),
    "como-destapar-un-bano-sin-destapador": ("biopelicula-en-tinacos-que-es-y-como-removerla.webp", 0.8),
    "como-destapar-un-lavabo-o-drenaje": ("sarro-en-tinaco-y-calentador.webp", 0.1),
    "flotador-electrico-para-cisterna-como-funciona": ("grietas-en-cisterna-concreto-como-detectarlas.webp", 0.3),
    "que-tamano-de-tinaco-necesito": ("cada-cuanto-lavar-tinaco-cisterna.webp", 0.5),
    "cisterna-de-5000-litros-medidas-precio-y-duracion": ("grietas-en-cisterna-concreto-como-detectarlas.webp", 0.8),
}

W, H = 1200, 675
NARANJA = (245, 158, 11)


def recorte(foto, x_rel):
    im = Image.open(os.path.join(IMAGENES, foto)).convert("RGB")
    escala = max(W / im.width, H / im.height) * 1.25  # un poco de zoom para variar el encuadre
    im = im.resize((int(im.width * escala), int(im.height * escala)), Image.LANCZOS)
    x = int((im.width - W) * x_rel)
    y = (im.height - H) // 2
    return im.crop((x, y, x + W, y + H))


def portada(slug, titulo, categoria):
    foto, x_rel = BASE[slug]
    fondo = recorte(foto, x_rel).filter(ImageFilter.GaussianBlur(3))
    # Velo azul marino que se oscurece hacia la izquierda, donde va el texto.
    velo = Image.new("RGBA", (W, H))
    dv = ImageDraw.Draw(velo)
    for x in range(W):
        alfa = int(235 - 120 * (x / W))
        dv.line([(x, 0), (x, H)], fill=(8, 30, 52, alfa))
    im = Image.alpha_composite(fondo.convert("RGBA"), velo)
    d = ImageDraw.Draw(im)

    f_cat = ImageFont.truetype(NEGRITA, 26)
    cat = categoria.upper()
    ancho = d.textlength(cat, font=f_cat)
    d.rounded_rectangle([70, 70, 70 + ancho + 40, 70 + 50], radius=25, fill=NARANJA)
    d.text((90, 79), cat, font=f_cat, fill="white")

    tam = 68
    while True:
        f_tit = ImageFont.truetype(NEGRITA, tam)
        lineas = textwrap.wrap(titulo, width=max(14, int(1900 / tam)))
        alto = len(lineas) * int(tam * 1.18)
        if (len(lineas) <= 4 and alto <= 390 and all(d.textlength(l, font=f_tit) <= 1040 for l in lineas)) or tam <= 40:
            break
        tam -= 4
    y = 160 + (390 - alto) // 2
    for l in lineas:
        d.text((70, y), l, font=f_tit, fill="white")
        y += int(tam * 1.18)

    f_pie = ImageFont.truetype(NEGRITA, 28)
    d.text((70, H - 80), "MonsterCo", font=f_pie, fill="white")
    d.text((70 + d.textlength("MonsterCo", font=f_pie) + 14, H - 78), "· Guías para tu tinaco y tu casa",
           font=ImageFont.truetype(NORMAL, 26), fill=(203, 213, 225))
    salida = os.path.join(IMAGENES, f"{slug}.webp")
    im.convert("RGB").save(salida, "WEBP", quality=82)
    return salida


if __name__ == "__main__":
    hechas = 0
    for ruta in sorted(glob.glob(os.path.join(AQUI, "*.json"))):
        a = json.load(open(ruta, encoding="utf-8"))
        if a.get("accion") != "nuevo" or a["slug"] not in BASE:
            continue
        print(portada(a["slug"], a["title"], a["category"]))
        hechas += 1
    print(hechas, "portadas")
