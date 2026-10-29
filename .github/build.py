"""Build UA (root) and EN (/en/) static versions from the bilingual source pages.

Source pages keep both languages (<x lang="uk"> / <x lang="en">). The build removes
the other language's elements so each URL is a clean single-language page that
search engines can index, and adds hreflang/canonical links.
Usage: python .github/build.py <src_dir> <out_dir>
"""
import glob, html, os, re, shutil, sys
from bs4 import BeautifulSoup

SRC, OUT = sys.argv[1], sys.argv[2]
BASE = 'https://webmotion.com.ua/'
EN_TITLES = {
    'index.html': 'WebMotion — Websites and AI Video Ads | Ukraine-based agency',
    'video.html': 'AI Video Ads: UGC, Meta Ads, AI Avatars · WebMotion',
    'web.html': 'Website Design & Development: Landing Pages, Stores, Redesign · WebMotion',
}
EN_DESC = {
    'index.html': 'Websites, landing pages and AI video ads for Meta and TikTok: UGC, AI avatars, video editing. 15 years in web development, Top Rated with 100% Job Success on Upwork.',
    'video.html': 'Full-cycle AI video ads: idea, script, storyboard, generation, voice-over, editing and colour grading. UGC, Meta Ads, TikTok, SaaS explainers, beauty, AI avatars. Price ranges inside.',
    'web.html': 'Websites that bring in leads: landing pages, company sites, online stores on WordPress and OpenCart, redesigns, Figma design and front-end. Price ranges inside.',
}

def pages():
    for f in ['index.html', 'video.html', 'web.html'] + sorted(glob.glob(os.path.join(SRC, 'cases', '*.html'))):
        yield os.path.relpath(os.path.join(SRC, f) if not f.startswith(SRC) else f, SRC)

def url(rel, lang):
    path = '' if rel == 'index.html' else rel
    return BASE + ('en/' if lang == 'en' else '') + path

def first_text(soup, sel, lang):
    el = soup.select_one(sel)
    if not el: return ''
    sp = el.find(attrs={'lang': lang})
    t = (sp or el).get_text(' ', strip=True)
    return (t[:155].rsplit(' ', 1)[0] + '…') if len(t) > 158 else t

def build(rel, lang):
    other = 'en' if lang == 'uk' else 'uk'
    soup = BeautifulSoup(open(os.path.join(SRC, rel), encoding='utf-8').read(), 'html.parser')
    root = soup.html
    root['lang'] = lang
    root['data-lang'] = lang
    root['data-page-lang'] = lang
    for el in soup.find_all(attrs={'lang': other}):
        if el.name != 'html': el.decompose()
    for o in soup.select('option[data-uk]'):
        o.string = o.get('data-' + lang) or o.string
    head = soup.head
    if lang == 'en':
        t = EN_TITLES.get(rel)
        if t: head.title.string = t
        d = EN_DESC.get(rel) or first_text(soup, '.lead', 'en')
        m = head.find('meta', attrs={'name': 'description'})
        if m and d: m['content'] = d
        for prop, val in (('og:title', head.title.string), ('og:description', d)):
            m = head.find('meta', attrs={'property': prop})
            if m and val: m['content'] = val
        m = head.find('meta', attrs={'property': 'og:locale'})
        if m: m['content'] = 'en_US'
        m = head.find('meta', attrs={'property': 'og:locale:alternate'})
        if m: m['content'] = 'uk_UA'
    for tag in head.find_all('link', attrs={'rel': 'alternate'}): tag.decompose()
    c = head.find('link', attrs={'rel': 'canonical'})
    if c: c['href'] = url(rel, lang)
    m = head.find('meta', attrs={'property': 'og:url'})
    if m: m['content'] = url(rel, lang)
    anchor = c or head.title
    for hl, l in (('x-default', 'uk'), ('en', 'en'), ('uk', 'uk')):
        anchor.insert_after(soup.new_tag('link', rel='alternate', hreflang=hl, href=url(rel, l)))
    out = str(soup)
    if lang == 'en':
        # assets live at the site root: add one ../ to asset references
        out = re.sub(r'((?:src|href|poster|action)=")((?:\.\./)*)(assets/|favicon\.ico|send\.php)', r'\1../\2\3', out)
        out = out.replace('url(assets/', 'url(../assets/')
    dst = os.path.join(OUT, 'en' if lang == 'en' else '', rel)
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    open(dst, 'w', encoding='utf-8').write(out)
    return url(rel, lang), 'noindex' in out

shutil.rmtree(OUT, ignore_errors=True)
shutil.copytree(SRC, OUT, ignore=shutil.ignore_patterns('.git', '.github', 'README.md', '*.html'))
urls = []
for rel in pages():
    for lang in ('uk', 'en'):
        u, noidx = build(rel, lang)
        if not noidx: urls.append((rel, u))
xml = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">']
for rel, u in urls:
    pr = '1.0' if rel == 'index.html' else ('0.9' if rel in ('video.html', 'web.html') else '0.7')
    alts = ''.join(f'<xhtml:link rel="alternate" hreflang="{h}" href="{url(rel, l)}"/>' for h, l in (('uk', 'uk'), ('en', 'en'), ('x-default', 'uk')))
    xml.append(f'  <url><loc>{u}</loc>{alts}<priority>{pr}</priority></url>')
xml.append('</urlset>')
open(os.path.join(OUT, 'sitemap.xml'), 'w').write('\n'.join(xml) + '\n')
print(f'built {len(urls)} indexable urls')
